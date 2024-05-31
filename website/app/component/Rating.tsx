import React from 'react';
import { Typography } from '@mui/material';

export function ColorizedRatingText({ rating }: { rating: number }): JSX.Element {
  let color = '';
  if (rating >= 4) {
    color = 'green';
  } else if (rating >= 2) {
    color = 'orange';
  } else {
    color = 'red';
  }

  return <Typography style={{ color }}>{rating}</Typography>;
}
