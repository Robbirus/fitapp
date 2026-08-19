import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Text, View } from "react-native";

import { Dimensions } from "react-native";

export default function Gauge({
  value,
  min,
  max,
  zones,
  width = Dimensions.get("window").width - 40,
  height = 60,
}) {
  const barHeight = 20;
  const barY = height - barHeight;

  const clamped = Math.min(Math.max(value, min), max);
  const cursorX = ((clamped - min) / (max - min)) * width;

  let previousEnd = min;

  return (
    <View>
      <Svg width={width} height={height}>
        {zones.map((zone, index) => {
          let zoneX = ((previousEnd - min) / (max - min)) * width;
          let zoneWidth = ((zone.end - previousEnd) / (max - min)) * width;
          previousEnd = zone.end;

          return (
            <Rect
              key={index}
              x={zoneX}
              y={barY}
              width={zoneWidth}
              height={barHeight}
              fill={zone.color}
            />
          );
        })}

        <Rect
          x={cursorX - 1.5}
          y={barY}
          width="3"
          height={barHeight + 10}
          fill="#1F1A17"
        />

        <SvgText
          x={cursorX}
          y={barY - 10}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
        >
          {value.toFixed(2)}
        </SvgText>
      </Svg>

      <View
        style={{
          width: width,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {zones.map((zone, index) => (
          <Text key={index} style={{ color: zone.color }}>
            {zone.label}
          </Text>
        ))}
      </View>

      <View
        style={{
          width: width,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text>{min.toFixed(2)}</Text>
        {zones.map((zone, index) => (
          <Text key={index}>{zone.end.toFixed(2)}</Text>
        ))}
      </View>
    </View>
  );
}
