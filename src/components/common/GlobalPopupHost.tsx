import React from "react";
import { X, CheckCircle2, AlertTriangle, Info, HelpCircle } from "lucide-react";

type PopupDetail = {
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export function openPopup(detail: PopupDetail) {
  window.dispatchEvent(new CustomEvent("pfc:popup", { detail }));
}

export const GlobalPopupHost: React.FC = () => {
  const [popup, setPopup] = React.useState<PopupDetail | null>(null);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<PopupDetail>;
      setPopup(custom.detail);
    };
    window.addEventListener("pfc:popup", handler);
    return () => window.removeEventListener("pfc:popup", handler);
  }, []);

  if (!popup) return null;

  const close = () => setPopup(null);
  const Icon =
    popup.type === "success" ? CheckCircle2 :
    popup.type === "warning" ? AlertTriangle :
    popup.type === "confirm" ? HelpCircle : Info;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-[2px]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div role="dialog" aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl overflow-hidden animate-[pfc-in_.18s_ease-out]">
        <div className="flex items-start gap-4 p-5">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Icon size={21}/>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-lg">{popup.title}</h2>
            {popup.message && <p className="mt-1.5 text-sm leading-6 text-stone-500 dark:text-stone-400">{popup.message}</p>}
          </div>
          <button aria-label="Close" onClick={close} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">
            <X size={18}/>
          </button>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          {popup.type === "confirm" && (
            <button onClick={close} className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold">
              {popup.cancelLabel || "Cancel"}
            </button>
          )}
          <button onClick={() => { popup.onConfirm?.(); close(); }}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-700">
            {popup.confirmLabel || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};
