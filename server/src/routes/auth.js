import express from "express";
import passport from "passport";
import { env } from "../config/env.js";

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
    res.redirect(env.clientUrl);
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

authRouter.get("/me", (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});
