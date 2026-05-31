import { AnimatePresence, motion } from "framer-motion";
import { Clock, Heart, Search, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";

const mealTypes = ["breakfast", "lunch", "dinner"];
const complexities = ["simple", "complex", "both"];

export function RecipePanel({
  ingredients,
  filters,
  setFilters,
  recipes,
  pantryScore,
  loading,
  onSearch,
  favorites,
  onToggleFavorite
}) {
  const [view, setView] = useState("matches");
  const favoriteIds = new Set(favorites.map((favorite) => favorite.recipeId));
  const favoriteRecipes = useMemo(
    () =>
      favorites.map((favorite) => ({
        id: favorite.recipeId,
        title: favorite.title,
        image: favorite.image,
        cookTime: favorite.cookTime,
        sourceUrl: favorite.sourceUrl,
        matchRatio: favorite.matchRatio,
        overlapScore: favorite.overlapScore,
        usedIngredients: favorite.usedIngredients || [],
        missingIngredients: favorite.missingIngredients || [],
        complexity: favorite.complexity || "saved",
        canCookNow: (favorite.missingIngredients || []).length === 0
      })),
    [favorites]
  );
  const visibleRecipes = view === "favorites" ? favoriteRecipes : recipes;

  return (
    <section className="rounded-2xl border border-white/80 bg-white/72 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-basil">Recipes</p>
          <h2 className="text-2xl font-black">Match what is inside</h2>
        </div>
        <button
          onClick={onSearch}
          disabled={loading || ingredients.length === 0}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-basil disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={18} />
          Show Me Recipes
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Segmented label="Meal type" values={mealTypes} active={filters.mealType} onChange={(mealType) => setFilters((current) => ({ ...current, mealType }))} />
        <Segmented label="Complexity" values={complexities} active={filters.complexity} onChange={(complexity) => setFilters((current) => ({ ...current, complexity }))} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Ingredient match" value={`${pantryScore}%`} />
        <Metric label="Ingredients" value={ingredients.length} />
        <Metric label="Favorites" value={favorites.length} />
      </div>

      <div className="mt-5 inline-grid rounded-xl border border-[#dce8e3] bg-white p-1 sm:grid-cols-2">
        <button
          onClick={() => setView("matches")}
          className={`h-10 rounded-lg px-4 text-sm font-black transition ${
            view === "matches" ? "bg-basil text-white shadow-glow" : "text-steel hover:bg-[#edf7f1]"
          }`}
        >
          Best Matches
        </button>
        <button
          onClick={() => setView("favorites")}
          className={`h-10 rounded-lg px-4 text-sm font-black transition ${
            view === "favorites" ? "bg-basil text-white shadow-glow" : "text-steel hover:bg-[#edf7f1]"
          }`}
        >
          Favorites
        </button>
      </div>

      <div className="mt-6 min-h-[320px]">
        {loading ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-[#c9d8d0] bg-white/55">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-basil border-t-transparent" />
          </div>
        ) : visibleRecipes.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-[#c9d8d0] bg-white/55 text-center">
            <div className="max-w-sm px-6">
              <SlidersHorizontal className="mx-auto mb-3 text-basil" />
              <p className="text-lg font-black">
                {view === "favorites" ? "Saved recipes will appear here." : "Your recipe matches will appear here."}
              </p>
              <p className="mt-2 text-sm leading-6 text-steel">
                {view === "favorites"
                  ? "Tap the heart on any recipe match to save it here."
                  : "Add ingredients, choose a meal, and search when you are ready."}
              </p>
            </div>
          </div>
        ) : (
          <motion.div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" initial="hidden" animate="show">
            <AnimatePresence>
              {visibleRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  isFavorite={favoriteIds.has(String(recipe.id))}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Segmented({ label, values, active, onChange }) {
  return (
    <div className="rounded-xl border border-[#dce8e3] bg-white p-2">
      <p className="mb-2 px-1 text-xs font-black uppercase tracking-[0.2em] text-steel">{label}</p>
      <div className="grid grid-cols-3 gap-1">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`h-10 rounded-lg text-sm font-black capitalize transition ${
              active === value ? "bg-basil text-white shadow-glow" : "text-steel hover:bg-[#edf7f1]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f1f8f4] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-steel">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function RecipeCard({ recipe, index, isFavorite, onToggleFavorite }) {
  const usedIngredients = recipe.usedIngredients || [];
  const missingIngredients = recipe.missingIngredients || [];
  const neededCount = usedIngredients.length + missingIngredients.length;
  const matchPercent = Math.round((usedIngredients.length / Math.max(neededCount, 1)) * 100);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl border border-[#dce8e3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={recipe.image} alt="" className="h-full w-full object-cover" />
        <button
          onClick={() => onToggleFavorite(recipe)}
          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur transition ${
            isFavorite ? "bg-tomato text-white" : "bg-white/85 text-ink hover:bg-white"
          }`}
          aria-label={isFavorite ? "Remove favorite" : "Save favorite"}
          title={isFavorite ? "Remove favorite" : "Save favorite"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{recipe.complexity}</Badge>
            {recipe.canCookNow && <Badge tone="green">cook now</Badge>}
          </div>
          <h3 className="line-clamp-2 text-xl font-black leading-tight">{recipe.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold text-steel">
          <span className="inline-flex items-center gap-1">
            <Clock size={16} /> {recipe.cookTime || 30} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={16} /> {matchPercent}% match
          </span>
        </div>
        <p className="text-sm font-bold text-steel">
          {usedIngredients.length} matched / {neededCount || 1} needed
        </p>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-steel">Missing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingIngredients.length ? (
              missingIngredients.slice(0, 5).map((ingredient) => (
                <span key={ingredient} className="rounded-full bg-[#fff3ef] px-3 py-1 text-xs font-black capitalize text-tomato">
                  {ingredient}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-[#e5f8ee] px-3 py-1 text-xs font-black text-basil">
                Nothing missing
              </span>
            )}
          </div>
        </div>
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink font-black text-white transition hover:bg-basil"
        >
          View Recipe
        </a>
      </div>
    </motion.article>
  );
}

function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${tone === "green" ? "bg-[#e5f8ee] text-basil" : "bg-[#edf1ef] text-steel"}`}>
      {children}
    </span>
  );
}
