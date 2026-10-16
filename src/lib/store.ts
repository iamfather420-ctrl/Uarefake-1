import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productBySku } from "@/lib/catalog";
import { paraiStages, type ParaiId } from "@/lib/dfrl";
import { matchProblem } from "@/lib/architecture";

export type CartLine = { sku: string; qty: number };

export type OrderStatus =
  | "ORDER_CREATED"
  | "AUTHORIZATION_HOLD"
  | "FAIL_CLOSED"
  | "ESCROW_FUNDED"
  | "REVERSED";

export type Order = {
  id: string;
  items: { sku: string; title: string; priceCents: number; qty: number }[];
  totalCents: number;
  status: OrderStatus;
  createdAt: number;
  reason?: string;
  receipt: string;
};

export type RunStatus =
  | "QUEUED"
  | "CYCLING"
  | "FAIL_CLOSED"
  | "EXECUTED"
  | "REVERSED"
  | "CHALLENGED";

export type Run = {
  id: string;
  operation: string;
  authorized: boolean;
  reversible: boolean;
  status: RunStatus;
  stage: ParaiId;
  note: string;
  startedAt: number;
  receipt: string;
  kernel: "A" | "B";
  pairId: string;
};

export type ProblemRecord = {
  id: string;
  statement: string;
  createdAt: number;
  path: string[];
  note: string;
  paradoxCodes: string[];
  nodeIds: string[];
  skus: string[];
};

export type NopotState =
  | "CREATED"
  | "REGISTERED"
  | "VALID"
  | "USED"
  | "EXPIRED"
  | "BURNED";

export type NopotCell = {
  id: string;
  header: string;
  state: NopotState;
  createdAt: number;
};

type AppState = {
  cart: CartLine[];
  orders: Order[];
  runs: Run[];
  problems: ProblemRecord[];
  cells: NopotCell[];
  addToCart: (sku: string) => { ok: true } | { ok: false; error: string };
  setQty: (sku: string, qty: number) => void;
  clearCart: () => void;
  checkout: () => { ok: false; error: string };
  proposeRun: (input: {
    operation: string;
    authorized: boolean;
    reversible: boolean;
  }) => Run;
  advanceRun: (id: string) => void;
  reverseRun: (id: string) => void;
  submitProblem: (statement: string) => ProblemRecord;
  mintCell: () => NopotCell;
  advanceCell: (id: string) => void;
  burnCell: (id: string) => void;
};

function runId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

function cellHeader(id: string) {
  const ts = new Date().toISOString();
  return `UAF1|cell=${id}|kind=NOPOT|tenant=PREVIEW|node=DN-16|proof=PB-NOPOT-REG-04|author=HUMAN_ROOT|ts=${ts}|hmac=${id.slice(-12)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      orders: [],
      runs: [],
      problems: [],
      cells: [],
      addToCart: (sku) => {
        const product = productBySku(sku);
        if (!product) return { ok: false, error: "Unknown SKU." };
        if (product.evidence !== "VERIFIED") {
          return {
            ok: false,
            error: `Fail-closed: ${product.evidence} goods cannot enter the verified marketplace.`,
          };
        }
        set((s) => {
          const existing = s.cart.find((l) => l.sku === sku);
          const cart = existing
            ? s.cart.map((l) =>
                l.sku === sku ? { ...l, qty: l.qty + 1 } : l,
              )
            : [...s.cart, { sku, qty: 1 }];
          return { cart };
        });
        return { ok: true };
      },
      setQty: (sku, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.sku !== sku)
              : s.cart.map((l) => (l.sku === sku ? { ...l, qty } : l)),
        })),
      clearCart: () => set({ cart: [] }),
      checkout: () => ({
        ok: false,
        error:
          "Access request blocked: authenticated, tenant-scoped server persistence is not configured. No order was created.",
      }),
      proposeRun: ({ operation, authorized, reversible }) => {
        const pairId = `pair_${Date.now().toString(36)}`;
        const base = {
          operation,
          authorized,
          reversible,
          status: "CYCLING" as const,
          stage: "INPUT" as const,
          startedAt: Date.now(),
        };
        const a: Run = {
          ...base,
          id: runId(),
          kernel: "A",
          pairId,
          note: "Kernel A · candidate. Information is not yet evidence.",
          receipt: receiptOf("UAF-KA"),
        };
        const b: Run = {
          ...base,
          id: runId(),
          kernel: "B",
          pairId,
          note: "Kernel B · independent challenge. Replay before promotion.",
          receipt: receiptOf("UAF-KB"),
        };
        set((s) => ({ runs: [a, b, ...s.runs].slice(0, 24) }));
        return a;
      },
      advanceRun: (id) =>
        set((s) => ({
          runs: s.runs.map((r) => {
            if (r.id !== id || r.status !== "CYCLING") return r;
            const i = paraiStages.findIndex((st) => st.id === r.stage);
            const next = paraiStages[i + 1];
            if (r.stage === "AUTHORIZE" && !r.authorized) {
              return {
                ...r,
                status: "FAIL_CLOSED",
                note: "Authorization unavailable. Capability does not imply permission. Execution refused.",
              };
            }
            if (r.stage === "GOVERN" && !r.reversible) {
              return {
                ...r,
                status: "FAIL_CLOSED",
                note: "Reversibility cannot be established. The system does nothing it cannot reverse.",
              };
            }
            if (r.kernel === "B" && r.stage === "VERIFY") {
              return {
                ...r,
                stage: "PROVE",
                note: "Kernel B challenged the candidate. Independent replay recorded. Not a production promotion.",
              };
            }
            if (!next) {
              return {
                ...r,
                status: r.kernel === "B" ? "CHALLENGED" : "EXECUTED",
                stage: "LEARN",
                note:
                  r.kernel === "B"
                    ? "Kernel B complete. Candidate remains unpromoted until both kernels and authorization agree."
                    : "Observable execution complete. Receipt sealed. Verified learning recorded.",
              };
            }
            return {
              ...r,
              stage: next.id,
              note: `${r.kernel === "A" ? "Kernel A" : "Kernel B"} · ${next.hint}`,
            };
          }),
        })),
      reverseRun: (id) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === id && (r.status === "EXECUTED" || r.status === "CHALLENGED")
              ? {
                  ...r,
                  status: "REVERSED",
                  note: "Rollback applied. Prior checkpoint restored. Forensic record retained.",
                }
              : r,
          ),
        })),
      submitProblem: (statement) => {
        const hit = matchProblem(statement);
        const rec: ProblemRecord = {
          id: `prb_${Date.now().toString(36)}`,
          statement: statement.trim().slice(0, 800),
          createdAt: Date.now(),
          path: hit.path,
          note: hit.note,
          paradoxCodes: hit.paradoxes.map((p) => p.code),
          nodeIds: hit.nodes.map((n) => n.id),
          skus: hit.products.map((p) => p.sku),
        };
        set((s) => ({ problems: [rec, ...s.problems].slice(0, 24) }));
        return rec;
      },
      mintCell: () => {
        const id = `np_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
        const cell: NopotCell = {
          id,
          header: cellHeader(id),
          state: "CREATED",
          createdAt: Date.now(),
        };
        set((s) => ({ cells: [cell, ...s.cells].slice(0, 12) }));
        return cell;
      },
      advanceCell: (id) =>
        set((s) => ({
          cells: s.cells.map((c) => {
            if (c.id !== id) return c;
            const order: NopotState[] = [
              "CREATED",
              "REGISTERED",
              "VALID",
              "USED",
              "EXPIRED",
            ];
            if (c.state === "BURNED" || c.state === "EXPIRED") return c;
            const i = order.indexOf(c.state);
            const next = order[i + 1];
            if (!next) return c;
            return { ...c, state: next };
          }),
        })),
      burnCell: (id) =>
        set((s) => ({
          cells: s.cells.map((c) =>
            c.id === id && c.state !== "BURNED"
              ? { ...c, state: "BURNED" }
              : c,
          ),
        })),
    }),
    {
      name: "uarefake-ledger",
      version: 3,
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<AppState>;
        return {
          cart: s.cart ?? [],
          // Older releases stored simulated orders in browser storage. Do not carry
          // those local-only records forward as if they were persisted orders.
          orders: [],
          runs: (s.runs ?? []).map((r) => ({
            ...r,
            kernel: r.kernel ?? "A",
            pairId: r.pairId ?? r.id,
          })),
          problems: s.problems ?? [],
          cells: s.cells ?? [],
        } as AppState;
      },
    },
  ),
);
