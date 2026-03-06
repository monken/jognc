import { useRegisterSW } from "virtual:pwa-register/preact";
import { GenericBox } from "./icons/Button";

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <GenericBox className="w-full flex flex-col gap-3 shadow-2xl p-4 bg-gray-900 pointer-events-auto">
        <div className="text-white font-mono text-sm text-center">
          New update available!
        </div>
        <div className="flex gap-2 w-full mt-2">
          <button
            className="flex-1 px-4 py-2 border-2 border-gray-600 text-gray-300 rounded-sm font-mono text-sm uppercase font-bold active:bg-gray-800 transition-colors"
            onClick={() => setNeedRefresh(false)}
          >
            Close
          </button>
          <button
            className="flex-1 px-4 py-2 border-2 border-white bg-lime-600 text-white rounded-sm font-mono text-sm uppercase font-bold active:bg-lime-700 transition-colors"
            onClick={() => updateServiceWorker(true)}
          >
            Update
          </button>
        </div>
      </GenericBox>
    </div>
  );
}
