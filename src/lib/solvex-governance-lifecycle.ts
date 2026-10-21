export const SOLVEX_LIFECYCLE_STATES = [
  "PROPOSED",
  "REVIEWED",
  "AUTHORIZED",
  "RUNNING",
  "VALIDATING",
  "COMPLETED",
  "REJECTED",
  "BLOCKED",
  "FAILED",
  "CANCELLED",
  "NEEDS_REVIEW",
  "RECOVERY_REQUIRED",
] as const;

export type SolvexLifecycleState = (typeof SOLVEX_LIFECYCLE_STATES)[number];

const transitions: Record<SolvexLifecycleState, readonly SolvexLifecycleState[]> = {
  PROPOSED: ["REVIEWED", "REJECTED", "CANCELLED", "NEEDS_REVIEW"],
  REVIEWED: ["AUTHORIZED", "REJECTED", "BLOCKED", "CANCELLED", "NEEDS_REVIEW"],
  AUTHORIZED: ["RUNNING", "BLOCKED", "CANCELLED", "NEEDS_REVIEW"],
  RUNNING: ["VALIDATING", "FAILED", "BLOCKED", "NEEDS_REVIEW"],
  VALIDATING: ["COMPLETED", "FAILED", "BLOCKED", "NEEDS_REVIEW"],
  COMPLETED: [],
  REJECTED: [],
  BLOCKED: ["REVIEWED", "CANCELLED", "NEEDS_REVIEW"],
  FAILED: ["RECOVERY_REQUIRED", "NEEDS_REVIEW"],
  CANCELLED: [],
  NEEDS_REVIEW: ["REVIEWED", "REJECTED", "CANCELLED"],
  RECOVERY_REQUIRED: ["AUTHORIZED", "CANCELLED", "NEEDS_REVIEW"],
};

export type SolvexTransitionContext = {
  reason?: string;
  authorization?: {
    actor: string;
    actorType: "human";
    authorizationId: string;
    authorizedAt: string;
  };
  execution?: {
    executionId: string;
    authorizationId: string;
  };
  verification?: {
    verified: true;
    evidenceRef: string;
  };
};

export class SolvexLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SolvexLifecycleError";
  }
}

export function allowedLifecycleTransitions(
  state: SolvexLifecycleState,
): readonly SolvexLifecycleState[] {
  return transitions[state];
}

export function canTransitionLifecycle(
  from: SolvexLifecycleState,
  to: SolvexLifecycleState,
): boolean {
  return transitions[from].includes(to);
}

/**
 * Validate one governance transition. This function records no state and performs
 * no external work; callers must persist the returned target and evidence atomically.
 */
export function transitionLifecycle(
  from: SolvexLifecycleState,
  to: SolvexLifecycleState,
  context: SolvexTransitionContext = {},
): { from: SolvexLifecycleState; to: SolvexLifecycleState; context: SolvexTransitionContext } {
  if (!canTransitionLifecycle(from, to)) {
    throw new SolvexLifecycleError(`Illegal lifecycle transition: ${from} -> ${to}`);
  }

  if (to === "AUTHORIZED") {
    const authorization = context.authorization;
    if (
      !authorization ||
      authorization.actorType !== "human" ||
      !authorization.actor.trim() ||
      !authorization.authorizationId.trim() ||
      !authorization.authorizedAt.trim()
    ) {
      throw new SolvexLifecycleError("AUTHORIZATION_REQUIRED: a recorded human authorization is required.");
    }
  }

  if (to === "RUNNING") {
    const execution = context.execution;
    if (
      !execution ||
      !execution.executionId.trim() ||
      !execution.authorizationId.trim() ||
      execution.authorizationId !== context.authorization?.authorizationId
    ) {
      throw new SolvexLifecycleError("EXECUTION_AUTHORIZATION_MISMATCH: execution must reference the supplied human authorization.");
    }
  }

  if (to === "COMPLETED") {
    const verification = context.verification;
    if (!verification?.verified || !verification.evidenceRef.trim()) {
      throw new SolvexLifecycleError("VERIFICATION_REQUIRED: completion requires positive verification evidence.");
    }
  }

  if (["REJECTED", "BLOCKED", "FAILED", "CANCELLED", "NEEDS_REVIEW", "RECOVERY_REQUIRED"].includes(to)) {
    if (!context.reason?.trim()) {
      throw new SolvexLifecycleError(`REASON_REQUIRED: transition to ${to} requires a non-empty reason.`);
    }
  }

  return { from, to, context };
}
