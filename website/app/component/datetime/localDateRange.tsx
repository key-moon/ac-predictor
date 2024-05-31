import { NoSsr } from "@mui/material";
import { formatInTimeZone } from "date-fns-tz";
import React from "react";
import { getLocalTimezone } from "~/lib/util";

const LocalDateRange: React.FC<{
  startDate: string | number | Date;
  endDate: string | number | Date;
  dateFormatStr?: string;
  timeFormatStr?: string;
  timeZoneFormatStr?: string;
}> = ({
  startDate,
  endDate,
  dateFormatStr = "yyyy-MM-dd",
  timeFormatStr = "HH:mm",
  timeZoneFormatStr = "zzz",
}) => {
  const format = (timezone: string) => {
    const startDateStr = formatInTimeZone(startDate, timezone, dateFormatStr);
    const startTimeStr = formatInTimeZone(startDate, timezone, timeFormatStr);
    const endDateStr = formatInTimeZone(endDate, timezone, dateFormatStr);
    const endTimeStr = formatInTimeZone(endDate, timezone, timeFormatStr);
    const tzStr = formatInTimeZone(startDate, timezone, timeZoneFormatStr);
    if (startDateStr === endDateStr) {
      return `${startDateStr} ${startTimeStr} - ${endTimeStr} ${tzStr}`;
    } else {
      return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr} ${tzStr}`;
    }
  };

  return <NoSsr fallback={format("UTC")}>{format(getLocalTimezone())}</NoSsr>;
};

export default LocalDateRange;
