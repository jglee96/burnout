import { supabase } from "@/shared/api/supabase-client";

export async function signInWithGoogle(redirectPath = "/app/day") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${redirectPath}`
    }
  });

  if (error) {
    throw new Error(
      `Google sign-in failed (${error.message}). Retry sign-in flow.`
    );
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed (${error.message}). Retry logout action.`);
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(
      `Session read failed (${error.message}). Refresh and re-authenticate.`
    );
  }
  return data.session;
}
