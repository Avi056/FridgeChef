import axios from "axios";
import { env } from "../config/env.js";

function hasRecipeApiKey() {
  return Boolean(
    env.spoonacularApiKey &&
      env.spoonacularApiKey !== "your-spoonacular-api-key" &&
      env.spoonacularApiKey !== "replace-with-your-spoonacular-api-key"
  );
}

const COMPLEXITY_LIMITS = {
  simple: 30,
  complex: 999,
  both: 999
};

const mockRecipes = [
  {
    id: "mock-omelet",
    title: "Herb Fridge Omelet",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
    usedIngredients: ["eggs", "milk", "cheese"],
    missingIngredients: ["parsley"],
    cookTime: 18,
    complexity: "simple",
    dishTypes: ["breakfast"],
    rating: 92,
    popularity: 84,
    sourceUrl: "https://spoonacular.com/"
  },
  {
    id: "mock-pasta",
    title: "Creamy Pantry Pasta",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
    usedIngredients: ["pasta", "milk", "cheese", "chicken"],
    missingIngredients: ["garlic"],
    cookTime: 35,
    complexity: "complex",
    dishTypes: ["lunch", "dinner"],
    rating: 88,
    popularity: 91,
    sourceUrl: "https://spoonacular.com/"
  },
  {
    id: "mock-bowl",
    title: "Loaded Rice Breakfast Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    usedIngredients: ["rice", "eggs", "spinach"],
    missingIngredients: ["avocado"],
    cookTime: 24,
    complexity: "simple",
    dishTypes: ["breakfast", "lunch"],
    rating: 86,
    popularity: 78,
    sourceUrl: "https://spoonacular.com/"
  }
];

function normalizeIngredient(value) {
  return String(value || "").trim().toLowerCase();
}

function getComplexity(cookTime) {
  return Number(cookTime || 0) <= 30 ? "simple" : "complex";
}

function scoreRecipe(recipe, availableIngredients) {
  const available = new Set(availableIngredients.map(normalizeIngredient));
  const usedCount = recipe.usedIngredients.filter((name) => available.has(normalizeIngredient(name))).length;
  const missingCount = recipe.missingIngredients.length;
  return usedCount / Math.max(usedCount + missingCount, 1);
}

export function calculatePantryScore(recipes) {
  const totals = recipes.reduce(
    (current, recipe) => ({
      used: current.used + (recipe.usedIngredients?.length || 0),
      missing: current.missing + (recipe.missingIngredients?.length || 0)
    }),
    { used: 0, missing: 0 }
  );

  return Math.round((totals.used / Math.max(totals.used + totals.missing, 1)) * 100);
}

function matchesMealType(recipe, mealType) {
  if (!mealType) return true;
  const dishTypes = recipe.dishTypes || [];
  if (!dishTypes.length) return true;
  return dishTypes.map(normalizeIngredient).includes(normalizeIngredient(mealType));
}

function applyFilters(recipes, ingredients, mealType, complexity) {
  return recipes
    .filter((recipe) => {
      if (!matchesMealType(recipe, mealType)) return false;
      if (complexity === "simple") return recipe.complexity === "simple";
      if (complexity === "complex") return recipe.complexity === "complex";
      return true;
    })
    .map((recipe) => {
      const matchRatio = Number(scoreRecipe(recipe, ingredients).toFixed(3));
      const popularityScore = Number(recipe.popularity || recipe.rating || 0) / 100;

      return {
        ...recipe,
        mealType,
        matchRatio,
        overlapScore: Number((matchRatio * 0.9 + popularityScore * 0.1).toFixed(3)),
        canCookNow: recipe.missingIngredients.length === 0
      };
    })
    .sort((a, b) => b.matchRatio - a.matchRatio || b.usedIngredients.length - a.usedIngredients.length || b.popularity - a.popularity);
}

async function enrichRecipes(recipes) {
  if (!recipes.length) return [];

  const ids = recipes.map((recipe) => recipe.id).join(",");
  const { data } = await axios.get("https://api.spoonacular.com/recipes/informationBulk", {
    params: {
      apiKey: env.spoonacularApiKey,
      ids
    },
    timeout: 12000
  });

  const detailsById = new Map(data.map((recipe) => [String(recipe.id), recipe]));

  return recipes.map((recipe) => {
    const details = detailsById.get(String(recipe.id)) || {};
    const cookTime = details.readyInMinutes || 30;

    return {
      id: String(recipe.id),
      title: recipe.title,
      image: recipe.image || details.image,
      usedIngredients: recipe.usedIngredients.map((ingredient) => ingredient.name),
      missingIngredients: recipe.missedIngredients.map((ingredient) => ingredient.name),
      cookTime,
      complexity: getComplexity(cookTime),
      dishTypes: details.dishTypes || [],
      rating: Math.round(details.spoonacularScore || 0),
      popularity: Math.round(details.aggregateLikes || recipe.likes || 0),
      sourceUrl: details.sourceUrl || details.spoonacularSourceUrl
    };
  });
}

export async function searchRecipes({ ingredients, mealType = "dinner", complexity = "both" }) {
  const cleanIngredients = [...new Set(ingredients.map(normalizeIngredient).filter(Boolean))];

  if (!cleanIngredients.length) {
    return [];
  }

  if (!hasRecipeApiKey()) {
    return applyFilters(mockRecipes, cleanIngredients, mealType, complexity);
  }

  const { data } = await axios.get("https://api.spoonacular.com/recipes/findByIngredients", {
    params: {
      apiKey: env.spoonacularApiKey,
      ingredients: cleanIngredients.join(","),
      number: 48,
      ranking: 1,
      ignorePantry: true
    },
    timeout: 12000
  });

  const enriched = await enrichRecipes(data);
  const maxTime = COMPLEXITY_LIMITS[complexity] || COMPLEXITY_LIMITS.both;
  return applyFilters(
    enriched.filter((recipe) => recipe.cookTime <= maxTime),
    cleanIngredients,
    mealType,
    complexity
  );
}
