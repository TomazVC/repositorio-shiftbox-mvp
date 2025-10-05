import Constants from "expo-constants";

export interface Environment {
  API_URL: string;
  APP_VERSION: string;
  ENVIRONMENT: "development" | "production";
  TIMEOUT: number;
}

const resolveApiUrl = (fallback: string): string => {
  const runtimeUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    (Constants?.expoConfig?.extra as Record<string, any> | undefined)?.apiUrl ??
    (Constants?.manifest2?.extra as Record<string, any> | undefined)?.apiUrl;

  return typeof runtimeUrl === "string" && runtimeUrl.trim().length > 0
    ? runtimeUrl.trim()
    : fallback;
};

const shared: Pick<Environment, "APP_VERSION" | "TIMEOUT"> = {
  APP_VERSION: "0.1.0",
  TIMEOUT: 10000,
};

const development: Environment = {
  API_URL: resolveApiUrl("http://192.168.17.72:8000"),
  APP_VERSION: shared.APP_VERSION,
  ENVIRONMENT: "development",
  TIMEOUT: shared.TIMEOUT,
};

const production: Environment = {
  API_URL: resolveApiUrl("https://api.shiftbox.com.br"),
  APP_VERSION: shared.APP_VERSION,
  ENVIRONMENT: "production",
  TIMEOUT: 15000,
};

const environment: Environment = __DEV__ ? development : production;

export default environment;

export const { API_URL, APP_VERSION, ENVIRONMENT, TIMEOUT } = environment;
