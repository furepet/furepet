import { Capacitor } from "@capacitor/core";
import { SignInWithApple, SignInWithAppleOptions } from "@capacitor-community/apple-sign-in";
import { supabase } from "@/integrations/supabase/client";

const log = (...args: unknown[]) => console.info("[AppleNative]", ...args);
const errLog = (...args: unknown[]) => console.error("[AppleNative]", ...args);

export const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/** Generate a cryptographically secure random nonce (raw string). */
const generateRawNonce = (length = 32): string => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += charset[bytes[i] % charset.length];
  return out;
};

/** SHA-256 hash and return lowercase hex (Apple expects hex of UTF-8 nonce). */
const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export interface NativeAppleResult {
  error?: Error;
  firstName?: string;
  email?: string;
}

/**
 * Native iOS Apple Sign-In using @capacitor-community/apple-sign-in,
 * then exchanges the identity token with Supabase via signInWithIdToken.
 */
export const signInWithAppleNative = async (): Promise<NativeAppleResult> => {
  try {
    log("starting native flow");

    const rawNonce = generateRawNonce(32);
    const hashedNonce = await sha256Hex(rawNonce);
    log("nonce generated", { rawLen: rawNonce.length, hashedLen: hashedNonce.length });

    const options: SignInWithAppleOptions = {
      clientId: "com.furepet.app",
      redirectURI: "https://furepet.lovable.app/~oauth",
      scopes: "email name",
      state: crypto.randomUUID(),
      nonce: hashedNonce,
    };
    log("requesting Apple credentials", { clientId: options.clientId });

    const result = await SignInWithApple.authorize(options);
    log("Apple response received", {
      hasIdentityToken: Boolean(result?.response?.identityToken),
      hasEmail: Boolean(result?.response?.email),
      hasGivenName: Boolean(result?.response?.givenName),
      user: result?.response?.user,
    });

    const identityToken = result?.response?.identityToken;
    if (!identityToken) {
      const e = new Error("Apple did not return an identity token");
      errLog(e.message);
      return { error: e };
    }

    log("calling supabase.auth.signInWithIdToken");
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
      nonce: rawNonce,
    });

    if (error) {
      errLog("supabase signInWithIdToken error", error);
      return { error };
    }

    log("session created", { userId: data?.user?.id });

    // Apple only sends name/email on FIRST sign-in. Fallback to email-derived name.
    const givenName = result?.response?.givenName?.trim();
    const familyName = result?.response?.familyName?.trim();
    const email = result?.response?.email ?? data?.user?.email ?? undefined;

    let firstName = givenName || "";
    if (!firstName && email) {
      firstName = email.split("@")[0] || "";
    }

    // Persist first_name to user_metadata so AuthContext picks it up.
    if (firstName && data?.user) {
      try {
        await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            ...(familyName ? { last_name: familyName } : {}),
          },
        });
        log("user_metadata updated with first_name");
      } catch (metaErr) {
        errLog("failed to update user_metadata", metaErr);
      }
    }

    return { firstName, email };
  } catch (e) {
    errLog("native flow threw", e);
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
};
