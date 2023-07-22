
const PATH_PREFIX = "/contests/";

export default function getContestScreenName() {
  const location = document.location.pathname;
  if (!location.startsWith(PATH_PREFIX)) {
    throw Error("not on the contest page");
  }
  return location.substring(PATH_PREFIX.length).split("/")[0];
}
