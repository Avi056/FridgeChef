import crypto from "node:crypto";
import { env } from "../config/env.js";
import { findUserById } from "../repositories/pineconeRepository.js";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function sign(value) {
  return crypto.createHmac("sha256", env.sessionSecret).update(value).digest("base64url");
}

function signaturesMatch(received, expected) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function createAuthToken(user) {
  const payload = encode({
    sub: user.id,
    exp: Date.now() + TOKEN_TTL_MS
  });
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export async function getUserFromAuthToken(req) {
  try {
    const header = req.get("authorization") || "";
    const [scheme, token] = header.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return null;
    }

    const [payload, receivedSignature] = token.split(".");
    if (!payload || !receivedSignature || !signaturesMatch(receivedSignature, sign(payload))) {
      return null;
    }

    const claims = decode(payload);
    if (!claims.sub || !claims.exp || Date.now() > claims.exp) {
      return null;
    }

    return findUserById(claims.sub);
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req) {
  if (req.isAuthenticated?.() && req.user) {
    return req.user;
  }

  const tokenUser = await getUserFromAuthToken(req);
  if (tokenUser) {
    req.user = tokenUser;
  }

  return tokenUser;
}
