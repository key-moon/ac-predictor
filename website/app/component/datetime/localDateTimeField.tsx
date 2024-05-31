import { Box, NoSsr, TextField, Typography } from "@mui/material";
import { formatInTimeZone } from "date-fns-tz";
import React, { ComponentProps, useState } from "react";
import { getLocalTimezone } from "~/lib/util";

const LocalDateTimeField: React.FC<
  Omit<ComponentProps<typeof TextField>, "type" | "defaultValue"> & { defaultValue?: Date }
> = props => {
  const { defaultValue, name, onChange, ...rest } = props;

  const format = (timezone: string) =>
    defaultValue && formatInTimeZone(defaultValue, timezone, "yyyy-MM-dd@HH:mm:ss").replace("@", "T");

  const [isoString, setISOString] = useState<string | undefined>(defaultValue && defaultValue.toISOString());

  return <NoSsr fallback={<Box><Typography>loading...</Typography></Box>}>
    <TextField
      type="datetime-local"
      defaultValue={format(getLocalTimezone())}
      onChange={event => {
        setISOString(new Date(event.target.value).toISOString());
        if (onChange) onChange(event); 
      }}
      {...rest}
    />
    <input hidden={true} type="string" name={name} readOnly value={isoString} />
  </NoSsr>;
};

export default LocalDateTimeField;
