import type { StackProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import React from "react";

const units = [
  { base: 1000, unit: ["ms", "msecs", "milliseconds"], maxDigit: 3 },
  { base: 60, unit: ["s", "secs", "seconds"], maxDigit: 2 },
  { base: 60, unit: ["m", "mins", "minutes"], maxDigit: 2 },
  { base: 24, unit: ["h", "hours", "hours"], maxDigit: 2 },
  { base: Infinity, unit: ["d", "days", "days"], maxDigit: 0 },
];

const defaultInnerComponent: React.FC<{
  value: string;
  unit: string;
  isFirst: boolean;
  isLast: boolean;
}> = ({ value, unit, isFirst, isLast }) => {
  return (
    <>
      <Typography variant="inherit" component="span">
        {value}
      </Typography>
      {isLast ? null : (
        <Typography variant="inherit" component="span">
          :
        </Typography>
      )}
    </>
  );
};

const TimeDelta: React.FC<
  {
    msec: number;
    precision?: "ms" | "seconds" | "minutes" | "hours" | "days" | number;
    headMinUnit?: "ms" | "seconds" | "minutes" | "hours" | "days";
    headMaxUnit?: "ms" | "seconds" | "minutes" | "hours" | "days";
    unitType?: "shortest" | "short" | "long";
    zeroFill?: boolean;
    fillHead?: boolean; // true: 01h 02m 03s, false: 1h 02m 03s
    gap?: string | number;

    innerComponent?: React.FC<{
      value: string;
      unit: string;
      isFirst: boolean;
      isLast: boolean;
    }>;
  } & StackProps
> = ({
  msec,
  precision = "seconds",
  headMinUnit = "ms",
  headMaxUnit = "days",
  unitType = "shortest",
  zeroFill = true,
  fillHead = false,
  gap = "1px",
  innerComponent: Component = defaultInnerComponent,
  ...other
}) => {
  const isNegative = msec < 0;
  const rounded = Math.round(Math.abs(msec));

  const unitIndex = ["shortest", "short", "long"].indexOf(unitType);

  const result = [];

  let remain = rounded;
  let display = false;
  let minUnitAchieved = false;
  for (let i = 0; i < units.length; i++) {
    const { base, unit, maxDigit } = units[i];
    display ||= typeof(precision) == "string" ? unit.includes(precision) : true;
    minUnitAchieved ||= unit.includes(headMinUnit);

    const current = remain % base;
    remain = (remain - current) / base;

    if (!display) continue;

    const isHead =
      unit.includes(headMaxUnit) || (remain === 0 && minUnitAchieved);
    const isTail = result.length == 0;

    let currentStr = current.toString();
    if (zeroFill && (!isHead || fillHead)) {
      currentStr = currentStr.padStart(maxDigit, "0");
    }
    if (isHead && isNegative) {
      currentStr = "-" + currentStr;
    }
    const unitStr = unit[unitIndex];

    result.unshift(
      <Component
        key={unitStr}
        value={currentStr}
        unit={unitStr}
        isFirst={isHead}
        isLast={isTail}
      />
    );
    if (isHead) break;
  }
  if (typeof(precision) == "number") {
    while (precision < result.length) result.pop();
  }

  return (
    <Stack direction="row" alignItems="baseline" justifyContent="flex-end" gap={gap} {...other}>
      {result}
    </Stack>
  );
};

export default TimeDelta;
