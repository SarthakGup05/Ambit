import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import type { auth } from "../../../server/src/auth.js";

import Constants from "expo-constants";

const getLocalDevUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return "http://localhost:8080";
  const ip = hostUri.split(":")[0];
  return `http://${ip}:8080`;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? getLocalDevUrl() : "http://localhost:8080");

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "ambit",
      storagePrefix: "ambit_auth",
      storage: SecureStore,
    }),
    inferAdditionalFields<typeof auth>()
  ]
});
