export interface CaretProps {
  /**
   * Rotation angle in degrees.
   * Supports specific 45-degree increments (0, 45, 90, 135, 180, 225, 270, 315)
   * or any custom number.
   * Default is 0 (pointing right).
   */
  rotation?: number;
  /** Size of the icon in pixels or string (e.g. '24px', '2rem'). Default: 24 */
  size?: number | string;
  /** Color of the icon stroke. Default: 'currentColor' */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * A Caret (arrow) component that returns an SVG.
 * It can be oriented in 45 degree increments via the `rotation` prop.
 * Base orientation (0 degrees) points right (>).
 */
export function Caret({
  rotation = 0,
  size = 24,
  stroke = "currentColor",
  fill = "currentColor",
  className = "",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="8 19 20 12 8 5" transform={`rotate(${rotation} 12 12)`} />
    </svg>
  );
}
