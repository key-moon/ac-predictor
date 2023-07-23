type Rank = Map<string, number>;

export function normalizeRank(ranks: Rank): Rank {
  const rankValues = [...new Set(ranks.values()).values()];
  const rankToUsers = new Map<number, string[]>();
  for (const [userScreenName, rank] of ranks) {
    if (!rankToUsers.has(rank)) rankToUsers.set(rank, []);
    rankToUsers.get(rank)!.push(userScreenName);
  }

  rankValues.sort((a, b) => a - b);

  const res = new Map<string, number>();
  let currentRank = 1;
  for (const rank of rankValues) {
    const users = rankToUsers.get(rank)!;
    const averageRank = currentRank + (users.length - 1) / 2;
    for (const userScreenName of users) {
      res.set(userScreenName, averageRank);
    }
    currentRank += users.length;
  }
  return res;
}
