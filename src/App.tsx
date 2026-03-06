import "./App.css";

import { useGrbl } from "./contexts/grbl";
import { GrblState } from "./lib/grbl";
import { GenericBox, type Intent } from "./components/icons/Button";
import clsx from "clsx";
import { WebSocketState } from "./lib/ws";
import { useSwipeable } from "./hooks/useSwipeable";
import { Controls } from "./components/Controls";
import { Settings } from "./components/Settings";

const STATE_INTENT_MAP: Record<string, Intent> = {
  [GrblState.ALARM]: "danger",
  [GrblState.HOLD_0]: "warning",
  [GrblState.JOG]: "primary",
  [GrblState.RUN]: "primary",
};

function StatusBox({ dragHandlers }: { dragHandlers: ReturnType<typeof useSwipeable>["dragHandlers"] }) {
  const { state, connectionState } = useGrbl();
  
  return (
    <div {...dragHandlers} className="shrink-0 w-full col-span-3 touch-none select-none">
      <GenericBox
        intent={state ? STATE_INTENT_MAP[state] || "secondary" : "secondary"}
        className="w-full font-mono text-2xl font-bold uppercase pointer-events-none"
      >
        {connectionState === WebSocketState.OPEN ? state : connectionState}
      </GenericBox>
    </div>
  );
}

function App() {
  const { scrollRef, activePage, scrollHandlers, dragHandlers } = useSwipeable(2);

  const pages = [<Controls key="controls" />, <Settings key="settings" />];

  return (
    <>
      <div 
        ref={scrollRef}
        {...scrollHandlers}
        className={clsx(
          "flex-1 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {pages.map((page, idx) => (
          <div key={idx} className="w-full shrink-0 snap-center p-2 flex flex-col space-y-4">
            <StatusBox dragHandlers={dragHandlers} />
            {page}
          </div>
        ))}
      </div>
      
      <div className="shrink-0 flex flex-col items-center pb-2">
        <div className="flex space-x-2 mb-2">
          {[0, 1].map((idx) => (
            <div key={idx} className={clsx("w-2 h-2 rounded-full transition-colors", activePage === idx ? "bg-white" : "bg-gray-600")} />
          ))}
        </div>
        <div className="font-mono text-gray-600 text-xs">jogNC</div>
      </div>
    </>
  );
}

export default App;
