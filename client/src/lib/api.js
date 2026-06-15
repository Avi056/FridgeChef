const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL must be set in client/.env or Netlify build environment variables.");
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  apiUrl: API_URL,
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout"),
  getFridge: () => request("/api/fridge"),
  addIngredient: (ingredient) =>
    request("/api/fridge/add-ingredient", {
      method: "POST",
      body: JSON.stringify(ingredient)
    }),
  removeIngredient: (ingredientId) =>
    request(`/api/fridge/remove-ingredient/${ingredientId}`, { method: "DELETE" }),
  addQuickLabel: (label) =>
    request("/api/fridge/quick-labels", {
      method: "POST",
      body: JSON.stringify({ label })
    }),
  removeQuickLabel: (label) =>
    request(`/api/fridge/quick-labels/${encodeURIComponent(label)}`, { method: "DELETE" }),
  searchRecipes: (payload) =>
    request("/api/recipes/search", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getFavorites: () => request("/api/recipes/favorites"),
  saveFavorite: (recipe) =>
    request("/api/recipes/favorites", {
      method: "POST",
      body: JSON.stringify({
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        cookTime: recipe.cookTime,
        sourceUrl: recipe.sourceUrl,
        matchRatio: recipe.matchRatio,
        overlapScore: recipe.overlapScore,
        usedIngredients: recipe.usedIngredients,
        missingIngredients: recipe.missingIngredients,
        complexity: recipe.complexity
      })
    }),
  removeFavorite: (recipeId) =>
    request(`/api/recipes/favorites/${recipeId}`, { method: "DELETE" })
};
