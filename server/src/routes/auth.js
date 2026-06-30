import express from "express";
import passport from "passport";
import { env } from "../config/env.js";
import { createAuthToken, getAuthenticatedUser } from "../services/authToken.js";

export const authRouter = express.Router();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${env.clientUrl}/login?error=oauth_failed`
  }),
  (req, res) => {
    const redirectUrl = new URL("/auth/callback", env.clientUrl);
    redirectUrl.searchParams.set("token", createAuthToken(req.user));
    res.redirect(redirectUrl.toString());
  }
);

authRouter.get("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.json({ user: null });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return next(error);
  }
});
