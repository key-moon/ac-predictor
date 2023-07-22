export default async function getAPerfs(contestScreenName: string): Promise<{ [userScreenName: string]: number }> {
  const result = await fetch(`https://data.ac-predictor.com/aperfs/${contestScreenName}.json`);
  if (!result.ok) {
    throw new Error(`Failed to fetch aperfs: ${result.status}`);
  }
  return await result.json();
}
