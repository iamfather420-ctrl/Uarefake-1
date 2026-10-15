import { createFileRoute } from "@tanstack/react-router";
import { KernelChamber } from "@/components/kernel-chamber";

export const Route = createFileRoute("/space/kernel")({ component: KernelPage });

function KernelPage() {
  return <KernelChamber />;
}
