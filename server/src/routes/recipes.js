import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { calculatePantryScore, searchRecipes } from "../services/recipeService.js";
import {
  getFavorites,
  removeFavorite,
  saveFavorite,
  storeRecipeResults
} from "../repositories/pineconeRepository.js";

export const recipesRouter = express.Router();

recipesRouter.use(requireAuth);

recipesRouter.post("/search", async (req, res, next) => {
  try {
    const ingredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : [];
    const mealType = req.body.mealType || "dinner";
    const complexity = req.body.complexity || "both";

    const recipes = await searchRecipes({ ingredients, mealType, complexity });
    await storeRecipeResults(req.user.id, recipes, { mealType, complexity });
    const pantryScore = calculatePantryScore(recipes);

    res.json({ recipes, pantryScore });
  } catch (error) {
    next(error);
  }
});

recipesRouter.get("/favorites", async (req, res, next) => {
  try {
    const favorites = await getFavorites(req.user.id);
    res.json({ favorites });
  } catch (error) {
    next(error);
  }
});

recipesRouter.post("/favorites", async (req, res, next) => {
  try {
    const {
      recipeId,
      title,
      image,
      cookTime,
      sourceUrl,
      matchRatio,
      overlapScore,
      usedIngredients,
      missingIngredients,
      complexity
    } = req.body;
    if (!recipeId || !title) {
      return res.status(400).json({ message: "recipeId and title are required" });
    }

    const favorites = await saveFavorite(req.user.id, {
      recipeId: String(recipeId),
      title,
      image,
      cookTime,
      sourceUrl,
      matchRatio,
      overlapScore,
      usedIngredients,
      missingIngredients,
      complexity
    });

    res.status(201).json({ favorites });
  } catch (error) {
    next(error);
  }
});

recipesRouter.delete("/favorites/:recipeId", async (req, res, next) => {
  try {
    const favorites = await removeFavorite(req.user.id, req.params.recipeId);
    res.json({ favorites });
  } catch (error) {
    next(error);
  }
});
