import { motion } from "framer-motion";
import { LogOut, Salad } from "lucide-react";
import { useEffect, useState } from "react";
import { Fridge } from "../components/Fridge";
import { RecipePanel } from "../components/RecipePanel";
import { useAuth } from "../context/auth";
import { api } from "../lib/api";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [quickLabels, setQuickLabels] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [pantryScore, setPantryScore] = useState(0);
  const [loadingFridge, setLoadingFridge] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    mealType: "dinner",
    complexity: "both"
  });

  useEffect(() => {
    Promise.all([api.getFridge(), api.getFavorites()])
      .then(([fridgeData, favoriteData]) => {
        setIngredients(fridgeData.fridge.ingredients || []);
        setQuickLabels(fridgeData.fridge.quickLabels || []);
        setFavorites(favoriteData.favorites || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingFridge(false));
  }, []);

  async function handleAdd(ingredient) {
    try {
      setError("");
      const data = await api.addIngredient(ingredient);
      setIngredients(data.fridge.ingredients);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(ingredientId) {
    try {
      setError("");
      const data = await api.removeIngredient(ingredientId);
      setIngredients(data.fridge.ingredients);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddQuickLabel(label) {
    try {
      setError("");
      const data = await api.addQuickLabel(label);
      setQuickLabels(data.quickLabels || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveQuickLabel(label) {
    try {
      setError("");
      const data = await api.removeQuickLabel(label);
      setQuickLabels(data.quickLabels || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSearch() {
    try {
      setError("");
      setLoadingRecipes(true);
      const data = await api.searchRecipes({
        ingredients: ingredients.map((ingredient) => ingredient.name),
        mealType: filters.mealType,
        complexity: filters.complexity
      });
      setRecipes(data.recipes);
      setPantryScore(data.pantryScore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRecipes(false);
    }
  }

  async function handleToggleFavorite(recipe) {
    try {
      const exists = favorites.some((favorite) => favorite.recipeId === String(recipe.id));
      const data = exists ? await api.removeFavorite(recipe.id) : await api.saveFavorite(recipe);
      setFavorites(data.favorites);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3e8] text-ink">
      <div className="fixed inset-0 bg-[linear-gradient(135deg,#fffaf0,#e8f4ef_48%,#faeee6)]" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white shadow-glow">
              <Salad size={23} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-basil">FridgeChef</p>
              <h1 className="text-2xl font-black leading-tight">Welcome, {user?.name?.split(" ")[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar && <img src={user.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover" />}
            <button
              onClick={logout}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-4 font-black text-steel transition hover:-translate-y-0.5 hover:border-tomato hover:text-tomato"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl border border-tomato/25 bg-[#fff3ef] px-4 py-3 font-bold text-tomato"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-6">
          <Fridge
            ingredients={ingredients}
            quickLabels={quickLabels}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onAddQuickLabel={handleAddQuickLabel}
            onRemoveQuickLabel={handleRemoveQuickLabel}
            loading={loadingFridge}
          />
          <RecipePanel
            ingredients={ingredients}
            filters={filters}
            setFilters={setFilters}
            recipes={recipes}
            pantryScore={pantryScore}
            loading={loadingRecipes}
            onSearch={handleSearch}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>
    </main>
  );
}
