type Rank = { [userScreenName: string]: number };

export function normalizeRank(ranks: Rank): Rank {
  const rankValues = Object.values(ranks);
  const rankToUsers: { [rank: number]: string[] } = {};
  for (const userScreenName in ranks) {
    const rank = ranks[userScreenName];
    if (!rankToUsers[rank]) rankToUsers[rank] = [];
    rankToUsers[rank].push(userScreenName);
  }

  rankValues.sort();

  const res: Rank = {};
  let currentRank = 1;
  for (const rank of rankValues) {
    const users = rankToUsers[rank];
    const averageRank = currentRank + (users.length - 1) / 2;
    for (const userScreenName of users) {
      res[userScreenName] = averageRank;
    }
    currentRank += users.length;
  }
  return res;
}
