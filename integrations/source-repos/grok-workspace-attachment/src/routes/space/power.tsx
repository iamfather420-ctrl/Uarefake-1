import { createFileRoute } from "@tanstack/react-router";
import { PbpCockpit } from "@/components/pbp-cockpit";

export const Route = createFileRoute("/space/power")({ component: PowerPage });

function PowerPage() {
  return <PbpCockpit />;
}
