import "./App.css";

import { Coordinates } from "./components/Coordinates";
import { useGrbl } from "./contexts/grbl";
import { Alarm } from "./components/Alarm";
import { GrblState } from "./lib/grbl";
import { Jog } from "./components/Jog";
import { GenericBox, type Intent } from "./components/icons/Button";
import clsx from "clsx";
import { WebSocketState } from "./lib/ws";

const STATE_INTENT_MAP: Record<string, Intent> = {
  [GrblState.ALARM]: "danger",
  [GrblState.HOLD_0]: "warning",
  [GrblState.JOG]: "primary",
  [GrblState.RUN]: "primary",
};

function App() {
  const { send, mPos, spindle, feed, state, connectionState } = useGrbl();

  return (
    <>
      <div className="flex-1 p-2 space-y-4">
        <Coordinates position={mPos} spindle={spindle} feed={feed} />
        <GenericBox
          intent={state ? STATE_INTENT_MAP[state] || "secondary" : "secondary"}
          className={clsx("w-full font-mono text-2xl font-bold col-span-3 uppercase")}
        >
          {connectionState === WebSocketState.OPEN ? state : connectionState}
        </GenericBox>

        {(state === GrblState.ALARM || state === GrblState.HOLD_0) && <Alarm />}
        {(state === undefined || state === GrblState.JOG || state === GrblState.IDLE) && (
          <Jog state={state} send={send} />
        )}
      </div>
      <div className="font-mono text-gray-600 text-center p-1">jogNC</div>
    </>
  );
}

export default App;
