import clsx from "clsx";

function CoordinateRow({ label, value, precision = 3 }: { label: string; value?: number; precision?: number }) {
  return (
    <div class="flex justify-between font-mono text-xl">
      <span className="font-semibold text-gray-400">{label}</span>
      <span>{value?.toFixed(precision) ?? '-'}</span>
    </div>
  );
}

export function Coordinates({ position, spindle, feed }: { position?: number[]; spindle?: number; feed?: number }) {
  return (
    <div class="w-full text-white grid grid-cols-3 gap-4">
      <div className={clsx("border-2 relative p-2 col-span-2", "bg-gray-800 text-white border-white")}>
          <CoordinateRow label="X" value={position?.[0]} />
          <CoordinateRow label="Y" value={position?.[1]} />
          <CoordinateRow label="Z" value={position?.[2]} />
        </div>
      <div className={clsx("border-2 relative p-2 ", "bg-gray-800 text-white border-white")}>
          <CoordinateRow label="S" value={spindle} precision={0} />
          <CoordinateRow label="F" value={feed} precision={0} />
        </div>
      </div>
  );
}
