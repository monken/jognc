export function Square({ rotation = 0, className = "", stroke = "currentColor", fill = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" transform={`rotate(${rotation} 12 12)`} />
    </svg>
  );
}
