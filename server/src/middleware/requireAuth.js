import { getAuthenticatedUser } from "../services/authToken.js";

export async function requireAuth(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req);

    if (user) {
      return next();
    }

    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    return next(error);
  }
}
