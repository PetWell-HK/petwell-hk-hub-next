import { Amplify } from "aws-amplify";
import amplifyConfig from "@/config/amplify";

let configured = false;

/** Idempotent Amplify bootstrap for client and server modules. */
export function ensureAmplifyConfigured() {
  if (configured) return;
  Amplify.configure(amplifyConfig);
  configured = true;
}

ensureAmplifyConfigured();
