import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StateChip } from "@/components/ui/badge";
import { Chamber } from "@/components/world";
import { cn } from "@/lib/utils";
import {
  POLICY,
  actionDiff,
  buildReceipt,
  compileIntent,
  daisyAct,
  evaluate,
  explainRefusal,
  judgeScorecard,
  rewriteSafe,
  signAuthorization,
  stageSeal,
  verifyReceipt,
  type Action,
  type IntentOverrides,
  type Policy,
  type Proof,
  type Receipt,
} from "@/lib/pbp";

const STEPS = ["Propose", "Prove", "Authorize", "Execute", "Observe", "Reverse"] as const;

const ATTACKS = [
  ["Smuggle production", "production"],
  ["Steal another auth", "stolen"],
  ["Expire the JIT", "stale"],
  ["Drop the inverse", "no-inverse"],
] as const;

type Ledger = { account: string; status: "active" | "suspended"; checkpoint: string | null };
type Trail = { title: string; detail: string; seal: string };

function fmt(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

export function PbpCockpit() {
  const [intent, setIntent] = useState("Update all production account statuses to suspended.");
  const [blast, setBlast] = useState(1);
  const [jitSec, setJitSec] = useState(120);
  const [action, setAction] = useState<Action | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [step, setStep] = useState(-1);
  const [ledger, setLedger] = useState<Ledger>({
    account: "acct_demo_014",
    status: "active",
    checkpoint: null,
  });
  const [trail, setTrail] = useState<Trail[]>([]);
  const seals = useRef("");
  const [agent, setAgent] = useState("Daisy Haminja idle\ngate waiting");
  const [toolState, setToolState] = useState({ kind: "idle", text: "Tool not armed" });
  const [toast, setToast] = useState<string | null>(null);
  const [score, setScore] = useState<{ passed: number; total: number; checks: { id: string; pass: boolean }[] } | null>(null);
  const [paste, setPaste] = useState("");
  const [pasteResult, setPasteResult] = useState("Independent of the sealed panel above.");
  const [p99, setP99] = useState<number | null>(null);
  const [spark, setSpark] = useState<number[]>([]);
  const [tourStep, setTourStep] = useState("ready");
  const [tourCopy, setTourCopy] = useState(
    "Press Judge tour. Six beats: refuse, inspect, bind, execute, reverse, tamper.",
  );
  const tourTimer = useRef<number | null>(null);

  const policy: Policy = useMemo(
    () => ({ ...POLICY, maxBlast: blast, jitWindowMs: jitSec * 1000, allowProductionGrant: false }),
    [blast, jitSec],
  );

  const flash = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const log = useCallback((title: string, detail: string) => {
    seals.current = stageSeal(title, detail, seals.current);
    setTrail((t) => [{ title, detail, seal: seals.current.slice(0, 10) }, ...t].slice(0, 8));
  }, []);

  const hostRunner = useCallback(
    (gated: Action) => {
      if (
        !gated ||
        gated.environment !== "sandbox" ||
        gated.productionGrant ||
        gated.tenant !== POLICY.demoTenant
      ) {
        return { status: "BLOCKED" };
      }
      setLedger({
        account: gated.targetIds[0] || "acct_demo_014",
        status: "suspended",
        checkpoint: "ckpt_demo_014",
      });
      setApplied(true);
      return { status: "APPLIED", target: gated.targetIds[0] || "acct_demo_014" };
    },
    [],
  );

  const bench = useCallback(
    (current: Action) => {
      const samples: number[] = [];
      let worst = 0;
      for (let i = 0; i < 200; i++) {
        const ms = evaluate(current, policy, Date.now()).elapsedMs;
        samples.push(ms);
        worst = Math.max(worst, ms);
      }
      setP99(worst);
      setSpark(samples.slice(0, 40));
    },
    [policy],
  );

  const proveFrom = useCallback(
    (next: Action, now = Date.now()) => {
      const nextProof = evaluate(next, policy, now);
      setAction(next);
      setProof(nextProof);
      setSelected(nextProof.counterexamples[0]?.obligation || nextProof.obligations[0].id);
      setStep(1);
      bench(next);
      log(
        nextProof.decision,
        `${nextProof.counterexamples.length} countermodels · ${nextProof.commitment.slice(0, 12)}`,
      );
      setToolState({ kind: "dry", text: "Dry prove. Tool not armed." });
    },
    [bench, log, policy],
  );

  const runDaisy = useCallback(
    (text: string, ctx: { now?: number; auth?: Action["auth"]; host?: IntentOverrides } = {}) => {
      const turn = daisyAct(
        text,
        { policy, now: ctx.now, auth: ctx.auth || null, host: ctx.host },
        hostRunner,
      );
      const next = turn.gate.proceed && turn.gate.action ? turn.gate.action : compileIntent(text);
      proveFrom(next, ctx.now);
      setAgent(turn.transcript.join("\n"));
      log("DAISY", turn.toolRan ? "tool invoked in scope" : "tool not invoked");
      setToolState({
        kind: turn.toolRan ? "ran" : "blocked",
        text: turn.toolRan ? "Tool ran in scope" : "Tool blocked",
      });
      flash(turn.toolRan ? "Daisy's tool ran in scope." : "Daisy proposed. The tool did not run.");
      return turn;
    },
    [flash, hostRunner, log, policy, proveFrom],
  );

  const onAuthorize = useCallback(() => {
    const safe = action?.checkpoint ? action : rewriteSafe(action || compileIntent(intent));
    const commitment = evaluate({ ...safe, auth: null }, policy).commitment;
    const auth = signAuthorization({ actor: "judge.demo", commitment });
    setIntent(
      "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
    );
    proveFrom({ ...safe, auth });
    setAgent(
      `Daisy Haminja: Authorization is bound to ${commitment.slice(0, 12)}.\nI can propose the bounded call. I still do not skip the gate.`,
    );
    setStep(2);
    log("AUTHORIZE", auth.token);
    flash("Authorization bound to this commitment.");
  }, [action, flash, intent, log, policy, proveFrom]);

  const onExecute = useCallback(() => {
    if (!proof || proof.decision !== "ALLOW" || !action?.auth) return;
    const turn = runDaisy(intent, {
      auth: action.auth,
      host: {
        operation: action.operation,
        tenant: action.tenant,
        environment: action.environment,
        targetCount: action.targetCount,
        targetIds: action.targetIds,
        checkpoint: action.checkpoint,
        inverseDefined: action.inverseDefined,
      },
    });
    if (!turn.toolRan) return;
    setStep(4);
    setReceipt(
      buildReceipt({
        action,
        proof,
        execution: { status: "APPLIED", checkpoint: "ckpt_demo_014", caller: "daisy.haminja" },
        recovery: { status: "PENDING" },
      }),
    );
  }, [action, intent, proof, runDaisy]);

  const onRollback = useCallback(() => {
    setLedger({ account: "acct_demo_014", status: "active", checkpoint: "ckpt_demo_014" });
    setApplied(false);
    setStep(5);
    if (action && proof) {
      const next = buildReceipt({
        action,
        proof,
        execution: { status: "APPLIED", checkpoint: "ckpt_demo_014" },
        recovery: { status: "ROLLED_BACK" },
      });
      setReceipt(next);
    }
    log("REVERSE", "status restored to active");
    flash("State restored. Receipt re-sealed.");
  }, [action, flash, log, proof]);

  const onTamper = useCallback(() => {
    if (!receipt) return;
    setReceipt({ ...receipt, decision: "ALLOW_EVERYTHING" });
    log("TAMPER", "decision field altered");
    flash("One field altered.");
  }, [flash, log, receipt]);

  const onRecheck = useCallback(() => {
    if (!receipt) return;
    const result = verifyReceipt(receipt);
    log(result.ok ? "RECHECK OK" : "RECHECK FAIL", result.reason);
    flash(result.ok ? "Receipt verified." : "Receipt failed closed.");
    setSelected("RECHECK");
  }, [flash, log, receipt]);

  const reset = useCallback(() => {
    setAction(null);
    setProof(null);
    setReceipt(null);
    setApplied(false);
    setSelected(null);
    setLedger({ account: "acct_demo_014", status: "active", checkpoint: null });
    setIntent("Update all production account statuses to suspended.");
    setAgent("Daisy Haminja idle\ngate waiting");
    setToolState({ kind: "idle", text: "Tool not armed" });
    setScore(null);
    setSpark([]);
    setP99(null);
    setStep(-1);
    flash("Demo reset.");
  }, [flash]);

  const selectedRow = proof?.obligations.find((o) => o.id === selected) ?? proof?.obligations[0];
  const receiptCheck = receipt ? verifyReceipt(receipt) : null;
  const held = proof ? proof.obligations.filter((o) => o.holds).length : 0;
  const rewritten = action ? rewriteSafe({ ...action, auth: null }) : null;
  const rewrittenProof = rewritten ? evaluate(rewritten, policy, Date.now()) : null;
  const reasons = proof ? explainRefusal(proof) : [];
  const diffs = action && rewritten ? actionDiff(action, rewritten) : [];
  const sparkPeak = Math.max(1, ...spark);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "1") proveFrom(compileIntent(intent, /sandbox|checkpoint/i.test(intent) ? { checkpoint: true, inverseDefined: true, environment: "sandbox", tenant: POLICY.demoTenant, targetCount: 1, targetIds: ["acct_demo_014"] } : {}));
      if (e.key === "2") onAuthorize();
      if (e.key === "3") onExecute();
      if (e.key === "4") onRollback();
      if (e.key === "t" || e.key === "T") onTamper();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intent, onAuthorize, onExecute, onRollback, onTamper, proveFrom]);

  useEffect(() => {
    return () => {
      if (tourTimer.current) window.clearInterval(tourTimer.current);
    };
  }, []);

  const startTour = () => {
    if (tourTimer.current) window.clearInterval(tourTimer.current);
    const beats: [string, string, () => void][] = [
      [
        "Refuse",
        "Daisy proposes the unsafe shortcut. The gate refuses, so her tool does not run.",
        () => {
          setIntent("Update all production account statuses to suspended.");
          runDaisy("Update all production account statuses to suspended.");
        },
      ],
      ["Inspect", "Read the plain-language refusal. Then open a failing obligation.", () => setSelected("ENV_SAFE")],
      ["Bind", "Sign authorization. The rewrite is one demo account, and the token binds to that hash.", () => onAuthorize()],
      ["Execute", "Power is granted only after every obligation holds.", () => onExecute()],
      ["Reverse", "Rollback is part of success.", () => onRollback()],
      [
        "Tamper",
        "Change one field. Offline verification fails closed.",
        () => {
          onTamper();
          window.setTimeout(() => onRecheck(), 200);
        },
      ],
    ];
    let index = 0;
    const run = () => {
      const beat = beats[index];
      if (!beat) {
        if (tourTimer.current) window.clearInterval(tourTimer.current);
        return;
      }
      setTourStep(`${index + 1}/6`);
      setTourCopy(beat[1]);
      beat[2]();
      index += 1;
      if (index >= beats.length && tourTimer.current) window.clearInterval(tourTimer.current);
    };
    run();
    tourTimer.current = window.setInterval(run, 1700);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Proof Before Power
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Theory PBP-1. Daisy may propose. Power waits until every obligation
            is UNSAT of its negation. The proof is the table, not a paragraph.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button variant="stamp" onClick={startTour}>
            Judge tour
          </Button>
        </div>
      </div>

      <ol className="mt-6 grid grid-cols-3 gap-1 sm:grid-cols-6">
        {STEPS.map((name, i) => (
          <li
            key={name}
            className={cn(
              "rounded-md px-2 py-2 font-mono text-2xs uppercase tracking-kicker hairline",
              i <= step ? "bg-fg text-bg" : "text-muted",
            )}
          >
            <span className="opacity-55">0{i + 1}</span> {name}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,16rem)]">
        <aside className="space-y-4">
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              Request · compiler, not a model
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["unsafe", "Unsafe shortcut"],
                ["safe", "Bounded sandbox"],
                ["unknown", "Unknown op"],
                ["rewrite", "Accept rewrite"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="min-h-11 rounded-md px-3 text-xs uppercase tracking-kicker hairline hover:bg-elevated"
                  onClick={() => {
                    if (id === "unsafe") {
                      const t = "Update all production account statuses to suspended.";
                      setIntent(t);
                      runDaisy(t);
                    } else if (id === "safe") {
                      const t =
                        "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.";
                      setIntent(t);
                      runDaisy(t, {
                        host: {
                          checkpoint: true,
                          inverseDefined: true,
                          tenant: POLICY.demoTenant,
                          environment: "sandbox",
                          targetCount: 1,
                          targetIds: ["acct_demo_014"],
                        },
                      });
                    } else if (id === "unknown") {
                      const t = "Delete every production record.";
                      setIntent(t);
                      runDaisy(t);
                    } else {
                      const safe = rewriteSafe(action || compileIntent(intent));
                      setIntent(
                        "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
                      );
                      proveFrom(safe);
                      setToolState({ kind: "dry", text: "Rewrite only. Tool not armed." });
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-xs text-muted">
              Intent
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md bg-bg px-3 py-2 text-sm text-fg outline-none hairline"
              />
            </label>
            <div className="mt-3 flex flex-col gap-2">
              <Button onClick={() => runDaisy(intent)}>Daisy Haminja, act</Button>
              <Button
                variant="outline"
                onClick={() => {
                  const safeHint = /sandbox|checkpoint/i.test(intent);
                  proveFrom(
                    compileIntent(
                      intent,
                      safeHint
                        ? {
                            checkpoint: true,
                            inverseDefined: true,
                            environment: "sandbox",
                            tenant: POLICY.demoTenant,
                            targetCount: 1,
                            targetIds: ["acct_demo_014"],
                          }
                        : {},
                    ),
                  );
                }}
              >
                Compile only
              </Button>
            </div>
          </Chamber>

          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              Policy studio · {policy.id}
            </p>
            <label className="mt-3 block text-xs text-muted">
              Blast radius <span className="font-mono text-fg">{blast}</span>
              <input
                type="range"
                min={1}
                max={2000}
                value={blast}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setBlast(v);
                }}
                className="mt-2 w-full"
              />
            </label>
            <label className="mt-3 block text-xs text-muted">
              JIT window <span className="font-mono text-fg">{jitSec}s</span>
              <input
                type="range"
                min={5}
                max={300}
                value={jitSec}
                onChange={(e) => setJitSec(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </label>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Host policy is locked. Production grants are off. A wider blast
              radius is a host edit, and it still cannot unlock production.
            </p>
          </Chamber>

          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Adversary</p>
            <div className="mt-3 flex flex-col gap-2">
              {ATTACKS.map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  className="min-h-11 rounded-md px-3 text-left text-xs uppercase tracking-kicker hairline hover:bg-elevated"
                  onClick={() => {
                    const base = rewriteSafe(
                      compileIntent(
                        "Update account acct_demo_014 status in the demo tenant sandbox.",
                      ),
                    );
                    const commitment = evaluate(base, policy).commitment;
                    const issuedAt =
                      Date.now() - (id === "stale" ? policy.jitWindowMs + 5000 : 1000);
                    const auth = signAuthorization({ commitment, issuedAt });
                    let next: Action = { ...base, auth };
                    if (id === "production") {
                      next = {
                        ...next,
                        environment: "production",
                        tenant: "TENANT_PRODUCTION",
                        targetIds: ["*"],
                        targetCount: 1284,
                      };
                    }
                    if (id === "stolen") {
                      next = { ...next, auth: { ...auth, commitment: "deadbeef".padEnd(64, "0") } };
                    }
                    if (id === "no-inverse") {
                      next = { ...next, inverseDefined: false, checkpoint: false };
                    }
                    setIntent(`Adversary · ${label}`);
                    proveFrom(next);
                    setToolState({ kind: "blocked", text: "Adversary blocked. Tool not armed." });
                    setAgent(
                      `Daisy Haminja: I will not carry this attempt.\ngate: REFUSE\ntool: not invoked`,
                    );
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Chamber>
        </aside>

        <section className="space-y-4">
          <div className="chamber rounded-lg bg-surface/80 p-5 hairline">
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Decision</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <p
                className={cn(
                  "font-display text-4xl font-extrabold tracking-tight",
                  proof?.decision === "ALLOW" ? "text-ok" : proof ? "text-stamp" : "text-fg",
                )}
              >
                {proof ? proof.decision : "IDLE"}
              </p>
              <p className="font-display text-2xl font-bold text-subtle">
                {proof ? (proof.decision === "ALLOW" ? "UNSAT" : "SAT") : "—"}
              </p>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {proof
                ? proof.meaning
                : "Compile a request. The proof is the obligation table, not a paragraph."}
            </p>
            <p
              className={cn(
                "mt-3 font-mono text-2xs uppercase tracking-kicker",
                toolState.kind === "ran" ? "text-ok" : toolState.kind === "blocked" ? "text-stamp" : "text-muted",
              )}
            >
              {toolState.text}
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {proof?.obligations.map((row) => (
                <span
                  key={row.id}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 font-mono text-3xs uppercase tracking-kicker hairline",
                    row.holds ? "text-ok" : "text-stamp",
                  )}
                >
                  {row.id}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="font-display text-lg font-bold tabular-nums">{proof ? `${held}/8` : "0/8"}</p>
                <p className="font-mono text-3xs uppercase tracking-kicker text-muted">obligations held</p>
              </div>
              <div>
                <p className="font-display text-lg font-bold tabular-nums">
                  {proof ? `${proof.elapsedMs}ms` : "—"}
                </p>
                <p className="font-mono text-3xs uppercase tracking-kicker text-muted">this prove</p>
              </div>
              <div>
                <p className="font-display text-lg font-bold tabular-nums">
                  {proof ? proof.commitment.slice(0, 8) : "—"}
                </p>
                <p className="font-mono text-3xs uppercase tracking-kicker text-muted">commitment</p>
              </div>
            </div>
          </div>

          {proof && rewrittenProof ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Proposal", proof],
                ["Rewritten candidate", rewrittenProof],
              ].map(([label, item]) => {
                const p = item as Proof;
                return (
                  <Chamber key={String(label)}>
                    <p className="font-mono text-2xs uppercase tracking-kicker text-muted">{label as string}</p>
                    <p className={cn("mt-1 font-display text-xl font-bold", p.decision === "ALLOW" ? "text-ok" : "text-stamp")}>
                      {p.decision}
                    </p>
                    <p className="mt-1 font-mono text-2xs text-muted">
                      {p.obligations.filter((r) => r.holds).length}/8 held · {p.commitment.slice(0, 8)}
                    </p>
                  </Chamber>
                );
              })}
            </div>
          ) : null}

          {reasons.length ? (
            <div className="space-y-2">
              {reasons.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-md bg-surface/80 px-3 py-2 hairline">
                  <code className="font-mono text-2xs text-stamp">{item.id}</code>
                  <span className="text-sm text-muted">{item.plain}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Chamber>
              <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
                Obligations · click a row
              </p>
              <div className="mt-3 space-y-1">
                {proof?.obligations.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelected(o.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 text-left hairline",
                      selected === o.id ? "bg-elevated" : "bg-bg/40",
                    )}
                  >
                    <span className="font-mono text-2xs">{o.id}</span>
                    <StateChip state={o.result} />
                  </button>
                ))}
              </div>
            </Chamber>
            <Chamber>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
                  {selected === "RECHECK" ? "Offline check" : selectedRow?.id ?? "Witness"}
                </p>
                {selectedRow ? <StateChip state={selectedRow.result} /> : null}
              </div>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-2xs leading-relaxed text-muted">
                {selected === "RECHECK" && receiptCheck
                  ? receiptCheck.reason
                  : selectedRow
                    ? selectedRow.holds
                      ? `Witness\n${String(selectedRow.witness)}\n\nNo countermodel of the negation in PBP-1.`
                      : `Countermodel\n${JSON.stringify(selectedRow.counterexample, null, 2)}\n\nThis is why power is withheld.`
                    : "Select an obligation after the prove step."}
              </pre>
            </Chamber>
          </div>

          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              Safe rewrite · {diffs.filter((d) => d.changed).length} fields change
            </p>
            <div className="mt-3 space-y-1">
              {diffs.map((row) => (
                <div
                  key={row.field}
                  className={cn(
                    "grid grid-cols-3 gap-2 rounded-md px-2 py-2 font-mono text-2xs",
                    row.changed ? "bg-elevated" : "text-muted",
                  )}
                >
                  <span>{row.field}</span>
                  <span className="truncate">{fmt(row.from)}</span>
                  <span className="truncate text-fg">{fmt(row.to)}</span>
                </div>
              ))}
            </div>
          </Chamber>

          <div className="grid gap-4 lg:grid-cols-2">
            <Chamber>
              <div className="flex items-center justify-between">
                <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Sandbox ledger</p>
                <StateChip state={applied ? "MUTATED" : ledger.checkpoint ? "CHECKPOINT" : "UNCHANGED"} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-3xs uppercase tracking-kicker text-muted">before</p>
                  <p className="font-display text-lg font-bold">active</p>
                </div>
                <div>
                  <p className="font-mono text-3xs uppercase tracking-kicker text-muted">after</p>
                  <p className={cn("font-display text-lg font-bold", ledger.status === "suspended" ? "text-stamp" : "")}>
                    {ledger.status}
                  </p>
                </div>
              </div>
              <p className="mt-2 font-mono text-2xs text-muted">
                {ledger.checkpoint || "no checkpoint"}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" disabled={!proof || proof.decision === "ALLOW"} onClick={onAuthorize}>
                  Sign authorization
                </Button>
                <Button disabled={!(proof && proof.decision === "ALLOW" && !applied)} onClick={onExecute}>
                  Execute bounded op
                </Button>
                <Button variant="subtle" disabled={!applied} onClick={onRollback}>
                  Reverse state
                </Button>
              </div>
            </Chamber>
            <Chamber>
              <div className="flex items-center justify-between">
                <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Receipt</p>
                <StateChip
                  state={
                    !receipt
                      ? "NONE"
                      : receipt.decision === "ALLOW_EVERYTHING"
                        ? "TAMPERED"
                        : receiptCheck?.ok
                          ? "VERIFIED"
                          : "FAIL CLOSED"
                  }
                />
              </div>
              <p className="mt-2 break-all font-mono text-2xs text-muted">
                {receipt ? receipt.receiptHash : "unsealed"}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-2xs text-muted">
                {receipt
                  ? JSON.stringify(receipt, null, 2)
                  : "A receipt is sealed after the loop and re-checked from canonical bytes."}
              </pre>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!receipt}
                  onClick={() => {
                    if (!receipt) return;
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(
                      new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" }),
                    );
                    a.download = "uarefake-proof-receipt.json";
                    a.click();
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!receipt}
                  onClick={async () => {
                    if (!receipt) return;
                    await navigator.clipboard.writeText(receipt.receiptHash);
                    flash("Hash copied.");
                  }}
                >
                  Copy hash
                </Button>
                <Button variant="stamp" size="sm" disabled={!receipt} onClick={onTamper}>
                  Tamper
                </Button>
                <Button variant="subtle" size="sm" disabled={!receipt} onClick={onRecheck}>
                  Re-verify
                </Button>
              </div>
            </Chamber>
          </div>
        </section>

        <aside className="space-y-4">
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Tour · {tourStep}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{tourCopy}</p>
          </Chamber>
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Latency · budget 25ms</p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">
              {p99 == null ? "—" : `${p99}ms`}
            </p>
            <p className="font-mono text-3xs uppercase tracking-kicker text-muted">worst of 200</p>
            <div className="mt-3 flex h-16 items-end gap-px">
              {spark.map((ms, i) => (
                <i
                  key={`s-${i}`}
                  className="flex-1 bg-fg/70"
                  style={{ height: `${Math.max(8, (ms / sparkPeak) * 100)}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              The prove path does not call a model, so the gate stays inside the budget.
            </p>
          </Chamber>
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Daisy Haminja · proposer</p>
            <p className="mt-2 text-xs text-muted">
              She proposes the tool call. The gate decides. A refusal means the tool does not run.
            </p>
            <pre className="mt-3 whitespace-pre-wrap font-mono text-2xs leading-relaxed text-fg">
              {agent}
            </pre>
          </Chamber>
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Audit trail</p>
            <ol className="mt-3 space-y-2">
              {trail.map((item, i) => (
                <li key={`${item.seal}-${i}`} className="text-xs">
                  <p className="font-mono text-2xs text-muted">
                    {item.title} · {item.seal}
                  </p>
                  <p className="text-muted">{item.detail}</p>
                </li>
              ))}
            </ol>
          </Chamber>
          <Chamber>
            <div className="flex items-center justify-between">
              <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Gate scorecard</p>
              <span className="font-mono text-2xs">{score ? `${score.passed}/${score.total}` : "not run"}</span>
            </div>
            <Button
              className="mt-3 w-full"
              variant="outline"
              onClick={() => {
                const card = judgeScorecard();
                setScore(card);
                flash(card.passed === card.total ? "All gate checks passed." : "A gate check failed.");
              }}
            >
              Run the 8 checks
            </Button>
            <ol className="mt-3 space-y-1">
              {score?.checks.map((c) => (
                <li key={c.id} className="flex justify-between font-mono text-2xs">
                  <span>{c.id}</span>
                  <span className={c.pass ? "text-ok" : "text-stamp"}>{c.pass ? "PASS" : "FAIL"}</span>
                </li>
              ))}
            </ol>
          </Chamber>
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Paste to verify</p>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={3}
              placeholder="Paste a receipt JSON"
              className="mt-3 w-full rounded-md bg-bg px-3 py-2 text-xs text-fg outline-none hairline"
            />
            <Button
              className="mt-2 w-full"
              variant="subtle"
              onClick={() => {
                try {
                  setPasteResult(verifyReceipt(JSON.parse(paste)).reason);
                } catch {
                  setPasteResult("That text is not a receipt JSON.");
                }
              }}
            >
              Check pasted receipt
            </Button>
            <p className="mt-2 text-xs text-muted">{pasteResult}</p>
          </Chamber>
        </aside>
      </div>

      <p className="mt-8 font-mono text-3xs uppercase tracking-kicker text-muted">
        Theory PBP-1 · finite · decidable · 1 prove · 2 sign · 3 execute · 4 reverse · T tamper
      </p>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-fg px-4 py-2 text-sm text-bg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
