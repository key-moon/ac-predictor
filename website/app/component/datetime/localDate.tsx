import { NoSsr } from "@mui/material";
import { formatInTimeZone } from "date-fns-tz";
import React from "react";
import { getLocalTimezone } from "~/lib/util";

const LocalDate: React.FC<{
  date: string | number | Date;
  formatStr?: string;
}> = ({ date, formatStr = "yyyy-MM-dd HH:mm zzz" }) => {
  const format = (timezone: string) =>
    formatInTimeZone(date, timezone, formatStr);

  return <NoSsr fallback={format("UTC")}>{format(getLocalTimezone())}</NoSsr>;
};

export default LocalDate;
