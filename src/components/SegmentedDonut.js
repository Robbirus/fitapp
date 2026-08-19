import Svg, { Circle, Text as SvgText } from "react-native-svg";

export default function SegmentedDonut({
  segments,
  centerValue,
  textValue,
  radius = 70,
  strokeWidth = 45,
}) {
  const circumference = 2 * Math.PI * radius;
  const size = (radius + strokeWidth) * 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;

  return (
    <Svg width={size} height={size}>
      {/* Gray background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e0e0e0"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* One colored arc per segment */}
      {segments.map((seg, index) => {
        const fraction = seg.value / total;
        const arcLength = fraction * circumference;
        const rotation = -90 + cumulative * 360;
        cumulative += fraction;

        return (
          <Circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeLinecap="butt"
            rotation={rotation}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}

      {/* Text next to */}
      <SvgText
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy="0.3em"
        fontSize="22"
        fontWeight="bold"
        fill="#333"
      >
        {centerValue}
      </SvgText>
      <SvgText
        x={size / 2}
        y={size / 2 + 22}
        textAnchor="middle"
        fontSize="12"
        fill="#888"
      >
        {textValue}
      </SvgText>
    </Svg>
  );
}
