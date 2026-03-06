import { Coordinates } from "./Coordinates";
import { Alarm } from "./Alarm";
import { Jog } from "./Jog";
import { useGrbl } from "../contexts/grbl";
import { GrblState } from "../lib/grbl";
import { GenericBox, type Intent } from "./icons/Button";
import { WebSocketState } from "../lib/ws";
import { useSwipeable } from "../hooks/useSwipeable";

const STATE_INTENT_MAP: Record<string, Intent> = {
  [GrblState.ALARM]: "danger",
  [GrblState.HOLD_0]: "warning",
  [GrblState.JOG]: "primary",
  [GrblState.RUN]: "primary",
};

export function StatusBox({ dragHandlers }: { dragHandlers?: ReturnType<typeof useSwipeable>["dragHandlers"] }) {
  const { state, connectionState } = useGrbl();
  
  return (
    <div {...dragHandlers} className="shrink-0 w-full col-span-3 select-none">
      <GenericBox
        intent={state ? STATE_INTENT_MAP[state] || "secondary" : "secondary"}
        className="w-full font-mono text-2xl font-bold uppercase pointer-events-none"
      >
        {connectionState === WebSocketState.OPEN ? state : connectionState}
      </GenericBox>
    </div>
  );
}

export function Controls({ dragHandlers }: { dragHandlers?: ReturnType<typeof useSwipeable>["dragHandlers"] }) {
  const { send, mPos, spindle, feed, state } = useGrbl();

  return (
    <>
      <StatusBox dragHandlers={dragHandlers} />
      <div className="touch-none flex-1 flex flex-col space-y-4">
        <Coordinates position={mPos} spindle={spindle} feed={feed} />

        {(state === GrblState.ALARM || state === GrblState.HOLD_0) && <Alarm />}
        {(state === undefined || state === GrblState.JOG || state === GrblState.IDLE) && (
          <Jog state={state} send={send} />
        )}
      </div>
    </>
  );
}