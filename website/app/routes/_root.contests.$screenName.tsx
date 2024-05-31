import { Box, Container, Typography } from "@mui/material";
import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ContestCard from "~/component/ContestCard";
import { ContestDetails, getContestDetails } from "~/lib/data/contestdetails";
import Range from "~/lib/range";
import { Colors, colorNames, getColor } from "~/lib/ratings";

export const meta: MetaFunction = () => {
  return [
    { title: "TODO - ac-predictor" },
    // { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function Index() {
  const data = useLoaderData<typeof loader>();


  return (
    <Container>
      WIP
      {/** Userを登録した場合には自分の位置を表示する */}
      {/**  */}
    </Container>
  );
}
