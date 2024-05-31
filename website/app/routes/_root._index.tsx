import { Box, Container, Typography } from "@mui/material";
import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContestCard from "~/component/ContestCard";
import { ContestDetails, getContestDetails } from "~/lib/data/contestdetails";
import Range from "~/lib/range";
import { Colors, colorNames, getColor } from "~/lib/ratings";

export const meta: MetaFunction = () => {
  return [
    { title: "ac-predictor" },
    // { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const contestDetails = await getContestDetails();

  // for test
  contestDetails.push(
    ...[2800, 2400, 2000, 1600, 1200, 800, 400, 1, 0].map(
      val => new ContestDetails(getColor(val), getColor(val), "algorithm", new Date(Date.now() - 60 * 1000), 1e5, new Range(0, val))
    )
  );

  return json({ contestDetails: contestDetails.map(details => details.toSerializable()) });
}

export default function Index() {
  const { contestDetails } = useLoaderData<typeof loader>();

  const parsedDetails = contestDetails.map(details => ContestDetails.fromSerialiable(details));

  const runningContests = parsedDetails.filter(details => details.duringContest(new Date())).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const upcomingContests = parsedDetails.filter(details => details.beforeContest(new Date())).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const ContestsElem = ({ name, contests }: { name: string, contests: ContestDetails[] }) => (
    <Box sx={{ textAlign: 'center', marginTop: 4, padding: 3, borderRadius: '20px', border: '3px solid #ccc' }}>
      <Box>
        <Typography variant="h2" gutterBottom>
          {name}
        </Typography>
        {
          contests.map(contest => 
            <ContestCard
              contestName={contest.contestName}
              contestScreenName={contest.contestScreenName}
              startTime={contest.startTime}
              endTime={contest.endTime}
              contestType={contest.contestType}
              contestColor={getColor(contest.ratedrange.end)}
            />
          )
        }
      </Box>
    </Box>
  );

  return (
    <Container>
      {runningContests.length != 0 ? <ContestsElem name="Running Contests" contests={runningContests}/> : undefined}
      {upcomingContests.length != 0 ? <ContestsElem name="Upcoming Contests" contests={upcomingContests}/> : undefined}
    </Container>
  );
}
