import { GenericBox } from "./icons/Button";

function CoordinateRow({ label, value, precision = 3 }: { label: string; value?: number; precision?: number }) {
  return (
    <div class="flex justify-between font-mono text-xl">
      <span className="font-semibold text-gray-400">{label}</span>
      <span>{value?.toFixed(precision) ?? "-"}</span>
    </div>
  );
}

export function Coordinates({ position, spindle, feed }: { position?: number[]; spindle?: number; feed?: number }) {
  return (
    <div class="w-full text-white grid grid-cols-3 gap-4">
      <GenericBox className="col-span-2">
        <CoordinateRow label="X" value={position?.[0]} />
        <CoordinateRow label="Y" value={position?.[1]} />
        <CoordinateRow label="Z" value={position?.[2]} />
      </GenericBox>
      <GenericBox>
        <CoordinateRow label="S" value={spindle} precision={0} />
        <CoordinateRow label="F" value={feed} precision={0} />
      </GenericBox>
    </div>
  );
}
