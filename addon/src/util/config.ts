import hasOwnProperty from "./hasOwnProperty";

const configKey = "ac-predictor-config";

type Config = {
  useResults: boolean,
  hideDuringContest: boolean
  isDebug: boolean,
  useFinalResultOnVirtual: boolean
};

const defaultConfig: Config = {
  useResults: true,
  hideDuringContest: false,
  isDebug: false,
  useFinalResultOnVirtual: false
};

function getConfigObj(): Config {
  const val = localStorage.getItem(configKey) ?? "{}";
  let config;
  try {
    config = JSON.parse(val);
  }
  catch {
    console.warn("invalid config found", val);
    config = {};
  }
  return { ...defaultConfig, ...config };
}

function storeConfigObj(config: Config) {
  localStorage.setItem(configKey, JSON.stringify(config));
}

export function getConfig(configKey: keyof Config) {
  return getConfigObj()[configKey];
}

export function setConfig<KeyT extends (keyof Config)>(key: KeyT, value: Config[KeyT]) {
  const config = getConfigObj();
  config[key] = value;
  storeConfigObj(config);
}
