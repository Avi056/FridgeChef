import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { findUserById, upsertOAuthUser } from "../repositories/pineconeRepository.js";

export function configurePassport() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  if (!env.googleClientId || !env.googleClientSecret) {
    console.warn("Google OAuth credentials are missing. /auth/google will fail until configured.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const avatar = profile.photos?.[0]?.value;

          const user = await upsertOAuthUser({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}
