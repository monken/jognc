import { Home } from "./icons";
import { CaretButton, CycleButton, IconButton, ToggleButton } from "./icons/Button";
import { GrblState } from "../lib/grbl";
import { useCallback, useRef, useState } from "preact/hooks";

const AXES = ["X", "Y", "Z", "A", "B", "C"];

export function Jog({ state, send }: { state: GrblState | undefined; send: (cmd: string) => Promise<void> }) {
  const jogging = useRef([0, 0, 0, 0, 0, 0]);
  const [incremental, setIncremental] = useState(false);

  const stop = useCallback(() => {
    jogging.current = [0, 0, 0, 0, 0, 0];
    send("\x85");
  }, [send]);

  const updateJogging = useCallback(
    (axis: number, value: number) => {
      const newJogging = [...jogging.current];
      newJogging[axis] = jogging.current[axis] + value;
      if (newJogging.every((v) => v === 0)) send("\x85");
      else {
        const limit = incremental ? 0.1 : 1000;
        const axes = Object.fromEntries(newJogging.map((a, i) => [AXES[i], a]));
        const cmd = `$J=G91 G21 ${Object.entries(axes)
          .filter(([, v]) => v !== 0)
          .map(([a, v]) => `${a}${v * limit}`)
          .join(" ")} F1000`;
        send("\x85");
        send(cmd);
      }
      jogging.current = newJogging;
    },
    [send, incremental],
  );

  return (
    <div className="bg-black grid grid-cols-3 gap-4 select-none touch-none">
      {state === GrblState.JOG ? (
        <IconButton label="Stop" icon="STop" onClick={stop} />
      ) : (
        <IconButton label="G28" icon={<Home />} onClick={() => send("G28")} disabled={state === undefined} />
      )}
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
      <ToggleButton label="INC" disabled={state === undefined} active={incremental} onChange={setIncremental} />
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
      <CycleButton
        disabled={state === undefined}
        cycles={[
          {
            label: "F3000",
            icon: "RAPID",
            value: { F: 3000, X: 3, Y: 3, Z: 1},
          },
          {
            label: "F1500",
            icon: "NORM",
          },
          {
            label: "F500",
            icon: "SLOW",
          },
          {
            label: "F100",
            icon: "CREEP",
          },
        ]}
      />
    </div>
  );
}
