import "./App.css";

import clsx from "clsx";
import { useSwipeable } from "./hooks/useSwipeable";
import { Controls } from "./components/Controls";
import { Settings } from "./components/Settings";
import { ReloadPrompt } from "./components/ReloadPrompt";

function App() {
  const { scrollRef, activePage, scrollHandlers, dragHandlers } = useSwipeable(2);

  const pages = [<Controls key="controls" dragHandlers={dragHandlers} />, <Settings key="settings" dragHandlers={dragHandlers} />];

  return (
    <>
      <ReloadPrompt />
      <div 
        ref={scrollRef}
        {...scrollHandlers}
        className={clsx(
          "flex-1 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {pages.map((page, idx) => (
          <div key={idx} className="w-full shrink-0 snap-center p-2 flex flex-col space-y-4">
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
