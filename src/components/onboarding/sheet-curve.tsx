import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { styled } from "nativewind";

const StyledPath = styled(Path, {
  className: {
    target: false,
    nativeStyleMapping: { color: "fill" },
  },
});

export interface SheetCurveProps {
  className?: string;
}

export function SheetCurve({ className = "text-surface" }: SheetCurveProps) {
  const { width } = useWindowDimensions();
  const height = 64;

  const d = `M 0 ${height} L 0 24 Q 0 0 24 0 C ${width * 0.45} 0 ${width * 0.72} 32 ${width - 32} 56 Q ${width} 64 ${width} 64 L 0 ${height} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <StyledPath d={d} className={className} />
    </Svg>
  );
}
