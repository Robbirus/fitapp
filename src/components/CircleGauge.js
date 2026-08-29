import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";
import { View } from "react-native";

export default function Gauge({
  value,
  min,
  max,
  zones,
  size = 260,
}) {
  const strokeWidth = 24;
  const radii = size / 2 - strokeWidth;
  const centerX = size / 2;
  const centerY = size / 2;

  /**
   *
   * @param {number} angle in degrees
   * @param {number} radii
   *
   * @returns {{x: number, y: number}} point
   *
   * Convert an angle into a point (x, y) on the circle
   */
  function pointOnCircle(angle, radii) {
    const angleRad = (angle * Math.PI) / 180;
    const x = centerX + radii * Math.cos(angleRad);
    const y = centerY - radii * Math.sin(angleRad); // "-" so 90° points up, not down

    return { x, y };
  }

  /**
   *
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {number} radii
   * @returns {string} an SVG path "d" attribute describing the arc
   */
  function drawArcPath(startAngle, endAngle, radii) {
    const p1 = pointOnCircle(startAngle, radii);
    const p2 = pointOnCircle(endAngle, radii);

    return `M ${p1.x} ${p1.y} A ${radii} ${radii} 0 0 1 ${p2.x} ${p2.y}`;
  }

  /**
   * Maps a data value (between min and max) to an angle
   * on the gauge: 180° (left) -> 0° (right)
   */
  function convertValueToAngle(v) {
    const clamped = Math.min(Math.max(v, min), max);
    const fraction = (clamped - min) / (max - min);

    return 180 - fraction * 180;
  }

  let previousEnd = min;

  const arcs = zones.map((zone) => {
    const startAngle = convertValueToAngle(previousEnd);
    const endAngle = convertValueToAngle(zone.end);

    previousEnd = zone.end;

    return (
      <Path
        key={zone.end}
        d={drawArcPath(startAngle, endAngle, radii)}
        stroke={zone.color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  const angleArrow = convertValueToAngle(value);
  const tipArrow = pointOnCircle(angleArrow, radii - strokeWidth - 10);

  return (
    <View>
      <Svg width={size} height={size / 2 + 40}>
        {arcs}

        <Line
          x1={centerX}
          y1={centerY}
          x2={tipArrow.x}
          y2={tipArrow.y}
          stroke="#1F1A17"
          strokeWidth={4}
          strokeLinecap="round"
        />

        <Circle cx={centerX} cy={centerY} r={8} fill="#1F1A17" />

        <SvgText
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
        >
          {value.toFixed(1)}
        </SvgText>
      </Svg>
    </View>
  );
}