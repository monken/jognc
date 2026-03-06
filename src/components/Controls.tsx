import { Coordinates } from "./Coordinates";
import { Alarm } from "./Alarm";
import { Jog } from "./Jog";
import { useGrbl } from "../contexts/grbl";
import { GrblState } from "../lib/grbl";

export function Controls() {
  const { send, mPos, spindle, feed, state } = useGrbl();

  return (
    <div className="touch-none flex-1 flex flex-col space-y-4">
      <Coordinates position={mPos} spindle={spindle} feed={feed} />

      {(state === GrblState.ALARM || state === GrblState.HOLD_0) && <Alarm />}
      {(state === undefined || state === GrblState.JOG || state === GrblState.IDLE) && (
        <Jog state={state} send={send} />
      )}
    </div>
  );
}