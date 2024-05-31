import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, CardActionArea, Tooltip, Grid, useTheme } from '@mui/material';
import { Alarm, AccessTime, ArrowForward } from '@mui/icons-material';
import ContestTimer from './ContestTimer';
import { ColorName, Colors } from '~/lib/ratings';

interface ContestCardProps {
  contestName: string;
  contestScreenName: string;
  startTime: Date;
  endTime: Date;
  contestType: 'algorithm' | 'heuristic';
  contestColor: ColorName;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default (({ contestName, contestScreenName, startTime, endTime, contestType, contestColor }) => {
  const theme = useTheme();

  return (
    <Card sx={{ marginBottom: 2, borderRadius: '8px', border: '1px solid #ccc', backgroundColor: Colors[contestColor][theme.palette.mode].background }}>
      <CardActionArea href={`/contests/${contestScreenName}`}>
        <CardContent>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={1}>
              <Tooltip title={capitalize(contestType)}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.background.paper,
                  marginRight: 2,
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}>
                  {contestType[0].toUpperCase()}
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="h6">{contestName}</Typography>
            </Grid>
            <Grid item xs={2}>
              <ContestTimer
                startDate={startTime}
                endDate={endTime}
                contentOnOver='Contest is over!'
                timeDeltaProps={{
                  color: theme.palette.mode === 'dark' ? 'primary' : 'secondary',
                }}
              />
            </Grid>
            <Grid item xs={1}>
              <ArrowForward />
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}) satisfies React.FC<ContestCardProps>;
