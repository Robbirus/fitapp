import Svg, { Rect, Text as SvgText } from "react-native-svg";

export default function Bar({
  label,
  consumed,
  goal,
  color,
  unit,
  width = 300,
  height = 40,
}) {
  const progress = Math.min(consumed / goal, 1);
  const fillWidth = progress * width;

  const safeConsumed = String(consumed).trim();
  const safeGoal = String(goal).trim();
  const safeUnit = String(unit || "").trim();

  const valueText = `${safeConsumed} ${safeUnit} / ${safeGoal} ${safeUnit}`;

  return (
    <Svg width={width} height={height}>
      {/* background */}
      <Rect x="0" y="18" width={width} height="12" rx="6" fill="#e0e0e0" />
      {/* filling */}
      <Rect x="0" y="18" width={fillWidth} height="12" rx="6" fill={color} />
      {/* left label */}
      <SvgText x="0" y="14" fontSize="11" fill="#555">
        {label}
      </SvgText>
      {/* right value */}
      <SvgText x={width} y="14" fontSize="12" fill="#555" textAnchor="end">
        {valueText}
      </SvgText>
    </Svg>
  );
}
