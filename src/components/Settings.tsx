import { GenericBox } from "./icons/Button";
import { useSwipeable } from "../hooks/useSwipeable";

export function Settings({ dragHandlers }: { dragHandlers?: ReturnType<typeof useSwipeable>["dragHandlers"] }) {
  return (
    <>
      <div {...dragHandlers} className="shrink-0 w-full col-span-3 select-none">
        <GenericBox
          intent="secondary"
          className="w-full font-mono text-2xl font-bold uppercase pointer-events-none"
        >
          Settings
        </GenericBox>
      </div>
      <div className="touch-none flex-1 flex flex-col">
        <div className="text-white font-mono text-center p-4 border-2 border-gray-600 rounded-xs flex-1 flex items-center justify-center">
          Settings Screen placeholder
        </div>
      </div>
    </>
  );
}