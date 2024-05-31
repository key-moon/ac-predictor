import React, { useEffect, useState } from "react";
import TimeDelta from "./datetime/timeDelta";
import type { SvgIconProps, TypographyProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import { AvTimer, HourglassTop } from "@mui/icons-material";

const ContestTimer: React.FC<
  {
    startDate: string | number | Date;
    endDate: string | number | Date;
    contentOnOver: string;
    iconProps?: SvgIconProps;
    timeDeltaProps?: Omit<React.ComponentProps<typeof TimeDelta>, "msec" | "innerComponent">;
  } & Omit<TypographyProps, "key">
> = ({ startDate, endDate, contentOnOver, iconProps, timeDeltaProps, ...other }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();

  const InnerComponent: React.FC<{
    value: string;
    unit: string;
    isFirst: boolean;
    isLast: boolean;
  }> = ({ value, unit, isFirst, isLast }) => {
    return (
      <Stack direction="row" alignItems="baseline">
        <Typography {...other} textAlign="right" suppressHydrationWarning>
          {value}
        </Typography>
        <Typography {...other} fontSize="95%">
          {unit}
        </Typography>
      </Stack>
    );
  };

  if (now < endTime) {
    const [anchorTime, Icon] =
      now < startTime ? [startTime, HourglassTop] : [endTime, AvTimer];
    return (
      <Stack direction="row" justifyContent="flex-end">
        <Icon {...iconProps} />
        <TimeDelta
          msec={anchorTime - now}
          gap={0.9}
          innerComponent={InnerComponent}
          minWidth={130}
          {...timeDeltaProps}
        />
      </Stack>
    );
  } else {
    return <>{contentOnOver}</>;
  }
};

export default ContestTimer;
