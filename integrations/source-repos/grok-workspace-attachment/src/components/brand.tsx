import { Link } from "@tanstack/react-router";
import { ENGINE_NAME } from "@/lib/solvex/identity";
import { cn } from "@/lib/utils";

export function Wordmark({
  domain,
  className,
  size = "md",
}: {
  domain?: "com" | "space" | "registry";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-display font-extrabold tracking-tight text-fg",
        size === "sm" && "text-base",
        size === "md" && "text-lg",
        size === "lg" && "text-2xl",
        className,
      )}
    >
      {ENGINE_NAME}
      {domain ? (
        <span className="font-mono text-xs font-normal tracking-normal text-muted">
          .{domain}
        </span>
      ) : null}
    </span>
  );
}

export function Stamp({
  children = "ENGINE",
  tone = "stamp",
  className,
}: {
  children?: string;
  tone?: "stamp" | "ok";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-12 items-center justify-center border-2 px-2.5 py-1 font-display text-sm font-extrabold uppercase tracking-mark",
        tone === "stamp"
          ? "border-stamp text-stamp"
          : "border-ok text-ok rotate-6",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LogoLink({
  domain,
}: {
  domain?: "com" | "space" | "registry";
}) {
  const to =
    domain === "space" ? "/space" : domain === "registry" ? "/registry" : "/";
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-sm bg-fg font-display text-3xs font-extrabold tracking-tight text-bg"
      >
        U
      </span>
      <Wordmark domain={domain} size="sm" />
    </Link>
  );
}
