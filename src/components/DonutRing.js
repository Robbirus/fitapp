import Svg, { Circle, Text as SvgText } from "react-native-svg";

export default function DonutRing({ consumed, used, goal, textValue }) {
  const radius = 80;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const offset = circumference * (1 - progress);
  const remaining = goal - consumed + used;
  const size = (radius + strokeWidth) * 2;

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
      {/* Arc of progress */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#4CAF50"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
      {/* Text in center */}
      <SvgText
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy="0.3em"
        fontSize="22"
        fontWeight="bold"
        fill="#333"
      >
        {remaining}
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
