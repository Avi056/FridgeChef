import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { env } from "./config/env.js";
import { configurePassport } from "./config/passport.js";
import { verifyPinecone } from "./config/pinecone.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { fridgeRouter } from "./routes/fridge.js";
import { recipesRouter } from "./routes/recipes.js";

const app = express();

configurePassport();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: env.nodeEnv === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "FridgeChef API" });
});

app.use("/auth", authRouter);
app.use("/api/fridge", fridgeRouter);
app.use("/api/recipes", recipesRouter);
app.use(notFound);
app.use(errorHandler);

verifyPinecone()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`FridgeChef API listening on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
