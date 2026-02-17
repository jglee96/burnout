function requireClientEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env "${key}". Set it and restart app.`);
  }
  return value;
}

export function getClientEnv() {
  return {
    supabaseUrl: requireClientEnv("VITE_SUPABASE_URL"),
    supabasePublishableKey: requireClientEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL
  };
}

