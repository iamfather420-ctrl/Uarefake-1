import { ENGINE_EXPANSION, ENGINE_LETTERS } from "@/lib/solvex/identity";
import { cn } from "@/lib/utils";

export function EngineExpansion({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-4",
        compact && "gap-1.5",
        className,
      )}
    >
      {ENGINE_LETTERS.map((item, i) => (
        <li
          key={`${item.letter}-${item.word}`}
          className="rounded-lg bg-surface/80 px-3 py-2.5 hairline"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <p className="font-display text-xl font-extrabold leading-none text-stamp">
            {item.letter}
          </p>
          <p className="mt-1 font-mono text-2xs uppercase tracking-kicker text-muted">
            {item.word}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function EngineRunes({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex flex-wrap gap-x-3 gap-y-1 font-mono text-2xs uppercase tracking-kicker text-muted",
        className,
      )}
    >
      {ENGINE_LETTERS.map((item) => (
        <span key={`${item.letter}-${item.word}`}>
          <span className="text-stamp">{item.letter}</span>
          <span className="ml-1">{item.word}</span>
        </span>
      ))}
    </p>
  );
}

export function EngineLine({ className }: { className?: string }) {
  return (
    <p className={cn("max-w-xl text-sm leading-relaxed text-muted", className)}>
      {ENGINE_EXPANSION}
    </p>
  );
}
