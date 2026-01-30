import clsx from "clsx";
import { GenericBox, IconButton } from "./icons/Button";
import { Unlock } from "./icons";
import { useGrbl } from "../contexts/grbl";

const ALL_PINS = ["X", "Y", "Z", "A", "P", "D", "H", "R", "S"];

export function Alarm() {
  const { pins, send } = useGrbl();
  return (
    <div className="w-full grid grid-cols-3 gap-4">
      <IconButton icon="Home" label="$H" onClick={() => send("$H")} />
      <IconButton icon={<Unlock />} label="$X" onClick={() => send("$X")} />
      <GenericBox className="grid grid-cols-3 gap-1 aspect-square p-1!">
        {ALL_PINS.map((pin) => (
          <div
            key={pin}
            className={clsx(
              "text-white aspect-square font-mono text-lg font-semibold flex items-center justify-center",
              pins?.includes(pin) ? "bg-rose-800" : "bg-gray-600",
            )}
          >
            {pin}
          </div>
        ))}
      </GenericBox>
    </div>
  );
}
