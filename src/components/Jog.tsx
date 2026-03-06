import { Square } from "./icons";
import { CaretButton, CycleButton, IconButton, ToggleButton } from "./icons/Button";
import { GrblState } from "../lib/grbl";
import { useCallback, useRef } from "preact/hooks";
import { jogSettings, updateJogSettings } from "../signals/jog";

const AXES = ["X", "Y", "Z", "A", "B", "C"];

const FEED_SPEED_OPTIONS: { label: string; icon: string; value: Record<string, number> }[] = [
  {
    label: "F3000",
    icon: "RAPID",
    value: { F: 3000, X: 5, Y: 5, Z: 1 },
  },
  {
    label: "F1500",
    icon: "NORM",
    value: { F: 1500, X: 2, Y: 2, Z: 0.4 },
  },
  {
    label: "F500",
    icon: "SLOW",
    value: { F: 500, X: 1, Y: 1, Z: 0.2 },
  },
  {
    label: "F100",
    icon: "CREEP",
    value: { F: 100, X: 0.5, Y: 0.5, Z: 0.1 },
  },
];

export function Jog({ state, send }: { state: GrblState | undefined; send: (cmd: string) => Promise<void> }) {
  const joggingRef = useRef([0, 0, 0, 0, 0, 0]);
  const incremental = jogSettings.value.incremental;
  const fsIdx = jogSettings.value.fsIdx;
  const fs = FEED_SPEED_OPTIONS[fsIdx].value;

  const stop = useCallback(() => {
    joggingRef.current = [0, 0, 0, 0, 0, 0];
    send("\x85");
  }, [send]);

  const updateJogging = useCallback(
    (axis: number, value: number) => {
      joggingRef.current[axis] = joggingRef.current[axis] + value;
      if (joggingRef.current.every((v) => v === 0)) {
        if (!incremental) send("\x85");
      } else {
        const axes = Object.fromEntries(joggingRef.current.map((a, i) => [AXES[i], a]));
        const cmd = `$J=G91 G21 ${Object.entries(axes)
          .filter(([, v]) => v !== 0)
          .map(([a]) => `${a}${(incremental ? (fs[a] ?? 0) : 1000) * Math.sign(axes[a])}`)
          .join(" ")} F${fs.F}`;
        send("\x85");
        send(cmd);
      }
    },
    [send, incremental, fs],
  );

  return (
    <div className="bg-black grid grid-cols-3 gap-4 select-none touch-none">
      <CycleButton disabled={state === undefined} value={fsIdx} cycles={FEED_SPEED_OPTIONS} onChange={(v) => updateJogSettings("fsIdx", v)} />
      <CaretButton
        label="Z+"
        rotation={270}
        disabled={state === undefined}
        onPress={() => updateJogging(2, 1)}
        onRelease={() => updateJogging(2, -1)}
      />
      <CaretButton
        label="Y+"
        rotation={315}
        disabled={state === undefined}
        onPress={() => updateJogging(1, 1)}
        onRelease={() => updateJogging(1, -1)}
      />
      <CaretButton
        label="X-"
        rotation={180}
        disabled={state === undefined}
        onPress={() => updateJogging(0, -1)}
        onRelease={() => updateJogging(0, 1)}
      />
      <ToggleButton label="INC" disabled={state === undefined} active={incremental} onChange={(v) => updateJogSettings("incremental", v)} />
      <CaretButton
        label="X+"
        rotation={0}
        disabled={state === undefined}
        onPress={() => updateJogging(0, 1)}
        onRelease={() => updateJogging(0, -1)}
      />
      <CaretButton
        label="Y-"
        rotation={135}
        disabled={state === undefined}
        onPress={() => updateJogging(1, -1)}
        onRelease={() => updateJogging(1, 1)}
      />
      <CaretButton
        label="Z-"
        rotation={90}
        disabled={state === undefined}
        onPress={() => updateJogging(2, -1)}
        onRelease={() => updateJogging(2, 1)}
      />
      <IconButton
        label="Stop"
        icon={<Square />}
        onClick={stop}
        disabled={state === undefined || state === GrblState.IDLE}
      />
    </div>
  );
}
