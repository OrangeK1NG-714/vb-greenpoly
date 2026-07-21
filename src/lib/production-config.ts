const DEVELOPMENT_AUTH_SECRET = "local-development-only-not-for-production";
const DEVELOPMENT_ADMIN_PASSWORD = "changeme123";
const MIN_AUTH_SECRET_LENGTH = 32;
const MIN_PRODUCTION_PASSWORD_LENGTH = 12;

type Environment = Record<string, string | undefined>;

function isProduction(env: Environment) {
  return env.NODE_ENV === "production";
}

export function getAuthSecret(env: Environment = process.env): string {
  const secret = env.AUTH_SECRET;

  if (
    isProduction(env) &&
    (!secret || secret === DEVELOPMENT_AUTH_SECRET || secret.length < MIN_AUTH_SECRET_LENGTH)
  ) {
    throw new Error(
      `AUTH_SECRET must be a unique string of at least ${MIN_AUTH_SECRET_LENGTH} characters in production.`
    );
  }

  return secret || DEVELOPMENT_AUTH_SECRET;
}

export function getSeedAdminCredentials(env: Environment = process.env) {
  const email = env.SEED_ADMIN_EMAIL || "admin@greenpoly.com";
  const password = env.SEED_ADMIN_PASSWORD || DEVELOPMENT_ADMIN_PASSWORD;

  if (
    isProduction(env) &&
    (password === DEVELOPMENT_ADMIN_PASSWORD || password.length < MIN_PRODUCTION_PASSWORD_LENGTH)
  ) {
    throw new Error(
      `SEED_ADMIN_PASSWORD must be a unique string of at least ${MIN_PRODUCTION_PASSWORD_LENGTH} characters in production.`
    );
  }

  return { email, password };
}
