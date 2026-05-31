import crypto from "node:crypto";
import { getPineconeIndex, persistenceVector } from "../config/pinecone.js";

function nowIso() {
  return new Date().toISOString();
}

function recordId(type, id) {
  return `${type}::${id}`;
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function userFromMetadata(metadata) {
  if (!metadata) return null;
  return {
    id: metadata.userId,
    googleId: metadata.googleId,
    name: metadata.name,
    email: metadata.email,
    avatar: metadata.avatar,
    favorites: parseJson(metadata.favoritesJson, []),
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt
  };
}

function fridgeFromMetadata(metadata, userId) {
  return {
    id: metadata?.fridgeId || userId,
    userId,
    ingredients: parseJson(metadata?.ingredientsJson, []),
    quickLabels: parseJson(metadata?.quickLabelsJson, []),
    createdAt: metadata?.createdAt,
    updatedAt: metadata?.updatedAt
  };
}

async function fetchMetadata(id) {
  const response = await getPineconeIndex().fetch([id]);
  return response.records?.[id]?.metadata || null;
}

async function upsertRecord(id, metadata) {
  await getPineconeIndex().upsert([
    {
      id,
      values: persistenceVector(),
      metadata
    }
  ]);
}

export async function findUserById(userId) {
  return userFromMetadata(await fetchMetadata(recordId("user", userId)));
}

export async function upsertOAuthUser({ googleId, name, email, avatar }) {
  const id = String(googleId);
  const existing = await findUserById(id);
  const timestamp = nowIso();
  const user = {
    id,
    googleId: id,
    name,
    email,
    avatar,
    favorites: existing?.favorites || [],
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp
  };

  await upsertRecord(recordId("user", id), {
    type: "user",
    userId: id,
    googleId: id,
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || "",
    favoritesJson: JSON.stringify(user.favorites),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });

  await getOrCreateFridge(id);

  return user;
}

export async function getOrCreateFridge(userId) {
  const id = recordId("fridge", userId);
  const existing = await fetchMetadata(id);

  if (existing) {
    return fridgeFromMetadata(existing, userId);
  }

  const timestamp = nowIso();
  const fridge = {
    id: userId,
    userId,
    ingredients: [],
    quickLabels: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await saveFridge(fridge);
  return fridge;
}

export async function saveFridge(fridge) {
  const timestamp = nowIso();
  const createdAt = fridge.createdAt || timestamp;

  await upsertRecord(recordId("fridge", fridge.userId), {
    type: "fridge",
    userId: fridge.userId,
    fridgeId: fridge.id || fridge.userId,
    ingredientsJson: JSON.stringify(fridge.ingredients || []),
    quickLabelsJson: JSON.stringify(fridge.quickLabels || []),
    createdAt,
    updatedAt: timestamp
  });

  return {
    ...fridge,
    createdAt,
    updatedAt: timestamp
  };
}

export async function addIngredient(userId, ingredient) {
  const fridge = await getOrCreateFridge(userId);
  const existing = fridge.ingredients.find((item) => item.name === ingredient.name);

  if (existing) {
    existing.quantity += ingredient.quantity;
    existing.unit = ingredient.unit || existing.unit;
    existing.location = ingredient.location || existing.location || "fridge";
    existing.addedAt = nowIso();
  } else {
    fridge.ingredients.push({
      _id: crypto.randomUUID(),
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      location: ingredient.location || "fridge",
      addedAt: nowIso()
    });
  }

  return saveFridge(fridge);
}

export async function removeIngredient(userId, ingredientId) {
  const fridge = await getOrCreateFridge(userId);
  fridge.ingredients = fridge.ingredients.filter((ingredient) => ingredient._id !== ingredientId);
  return saveFridge(fridge);
}

export async function addQuickLabel(userId, label) {
  const fridge = await getOrCreateFridge(userId);
  const cleanLabel = String(label || "").trim().toLowerCase();

  if (!cleanLabel) {
    const error = new Error("Label is required");
    error.status = 400;
    throw error;
  }

  fridge.quickLabels = [...new Set([...(fridge.quickLabels || []), cleanLabel])].slice(0, 24);
  return saveFridge(fridge);
}

export async function removeQuickLabel(userId, label) {
  const fridge = await getOrCreateFridge(userId);
  const cleanLabel = String(label || "").trim().toLowerCase();
  fridge.quickLabels = (fridge.quickLabels || []).filter((item) => item !== cleanLabel);
  return saveFridge(fridge);
}

export async function getFavorites(userId) {
  const user = await findUserById(userId);
  return user?.favorites || [];
}

export async function saveFavorite(userId, favorite) {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const exists = user.favorites.some((item) => item.recipeId === String(favorite.recipeId));
  const favorites = exists
    ? user.favorites
    : [...user.favorites, { ...favorite, recipeId: String(favorite.recipeId), savedAt: nowIso() }];

  await upsertRecord(recordId("user", userId), {
    type: "user",
    userId,
    googleId: user.googleId,
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || "",
    favoritesJson: JSON.stringify(favorites),
    createdAt: user.createdAt,
    updatedAt: nowIso()
  });

  return favorites;
}

export async function removeFavorite(userId, recipeId) {
  const user = await findUserById(userId);
  if (!user) return [];

  const favorites = user.favorites.filter((favorite) => favorite.recipeId !== String(recipeId));
  await upsertRecord(recordId("user", userId), {
    type: "user",
    userId,
    googleId: user.googleId,
    name: user.name || "",
    email: user.email || "",
    avatar: user.avatar || "",
    favoritesJson: JSON.stringify(favorites),
    createdAt: user.createdAt,
    updatedAt: nowIso()
  });

  return favorites;
}

export async function storeRecipeResults(userId, recipes, filters) {
  if (!recipes.length) return;

  const timestamp = nowIso();
  await getPineconeIndex().upsert(
    recipes.map((recipe) => ({
      id: recordId("recipe", `${userId}::${recipe.id}`),
      values: persistenceVector(),
      metadata: {
        type: "recipe",
        userId,
        recipeId: String(recipe.id),
        title: recipe.title || "",
        mealType: filters.mealType || "",
        complexity: recipe.complexity || "",
        canCookNow: Boolean(recipe.canCookNow),
        overlapScore: Number(recipe.overlapScore || 0),
        recipeJson: JSON.stringify(recipe),
        updatedAt: timestamp
      }
    }))
  );
}
