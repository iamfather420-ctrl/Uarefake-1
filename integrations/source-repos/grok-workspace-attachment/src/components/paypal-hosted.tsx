import { useEffect, useRef } from "react";
import { PAYPAL_HOSTED } from "@/lib/solvex/identity";

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (opts: { hostedButtonId: string }) => {
        render: (selector: string) => Promise<unknown>;
      };
    };
  }
}

const SCRIPT_SRC = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_HOSTED.clientId}&components=hosted-buttons&enable-funding=venmo&currency=USD`;

export function PayPalHostedCheckout() {
  const mounted = useRef(false);

  useEffect(() => {
    const selector = `#${PAYPAL_HOSTED.containerId}`;
    let cancelled = false;

    async function renderButton() {
      if (cancelled || !window.paypal?.HostedButtons) return;
      const el = document.getElementById(PAYPAL_HOSTED.containerId);
      if (!el) return;
      el.innerHTML = "";
      try {
        await window.paypal.HostedButtons({
          hostedButtonId: PAYPAL_HOSTED.hostedButtonId,
        }).render(selector);
      } catch {
        /* Hosted Buttons throw if the container remounts mid-render. */
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-uarefake-paypal="hosted"]',
    );
    if (window.paypal?.HostedButtons) {
      void renderButton();
    } else if (existing) {
      existing.addEventListener("load", () => void renderButton());
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.uarefakePaypal = "hosted";
      script.addEventListener("load", () => void renderButton());
      document.body.appendChild(script);
    }

    mounted.current = true;
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl bg-surface p-4 hairline">
      <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
        DN-35 · PayPal hosted checkout
      </p>
      <p className="mt-2 text-sm text-muted">
        Live PayPal button. Capture happens at PayPal. This ledger will not mint
        a local success receipt without a provider callback.
      </p>
      <div id={PAYPAL_HOSTED.containerId} className="mt-4 min-h-16" />
    </div>
  );
}
