import jaJson from "./data/ja.json";
import enJson from "./data/en.json";

// should not be here
function getCurrentLanguage() {
  const elems = document.querySelectorAll("#navbar-collapse .dropdown > a");
  if (elems.length == 0) return "JA";
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].textContent?.includes("English")) return "EN";
    if (elems[i].textContent?.includes("日本語")) return "JA";
  }
  console.warn("language detection failed. fallback to English");
  return "EN";
}


const language = getCurrentLanguage();
const currentJson = { "EN": enJson, "JA": jaJson }[language];

export function getTranslation(label: keyof typeof currentJson) {
  return currentJson[label];
}

export function substitute(input: string) {
  for (const key in currentJson) {
    // @ts-ignore
    input = input.replaceAll(`{${key}}`, currentJson[key]);
  }
  return input;
}
