import { useMemo } from "react";
import { LineChart, LineChartData } from "./LineChart";
import { theme } from "../../lib/theme";

export interface AreaChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showValue?: boolean;
  curved?: boolean;
}

// AreaChart is just LineChart with showArea=true
export function AreaChart({
  data,
  width = 400,
  height = 200,
  color = theme.primary,
  showDots = true,
  showValue = true,
  curved = true,
}: AreaChartProps) {
  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      color={color}
      showArea={true}
      showDots={showDots}
      showValue={showValue}
      curved={curved}
    />
  );
}

export default AreaChart;