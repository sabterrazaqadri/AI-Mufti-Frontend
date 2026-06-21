import { betterAuth } from "better-auth";
import { jwt, bearer } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth server instance.
 *
 * - Users/sessions live in the same Neon Postgres database.
 * - The `jwt` plugin exposes a JWKS endpoint (/api/auth/jwks) and a token
 *   endpoint (/api/auth/token) so the separate Python (FastAPI) backend can
 *   verify a signed token instead of trusting a client-supplied id.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  plugins: [jwt(), bearer()],
});
