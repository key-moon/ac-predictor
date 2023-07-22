export default function addStyle(styleSheet: string) {
  const styleElem = document.createElement("style");
  styleElem.textContent = styleSheet;
  document.getElementsByTagName("head")[0].append(styleElem);
}
