import { AnimatePresence, motion } from "framer-motion";
import { Package, Plus, Snowflake, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

const quickAdds = ["eggs", "milk", "chicken", "rice", "pasta", "salt", "pepper", "basil"];
const units = ["item", "g", "oz", "cup", "lb"];
const storageOptions = [
  { value: "fridge", label: "Fridge" },
  { value: "pantry", label: "Pantry" },
  { value: "spices", label: "Spice Rack" }
];
const pantryNames = new Set([
  "rice",
  "pasta",
  "flour",
  "sugar",
  "oats",
  "beans",
  "lentils",
  "bread",
  "cereal",
  "oil",
  "vinegar",
  "honey",
  "peanut butter"
]);
const spiceNames = new Set([
  "salt",
  "pepper",
  "paprika",
  "cumin",
  "cinnamon",
  "oregano",
  "basil",
  "thyme",
  "rosemary",
  "chili powder",
  "garlic powder",
  "onion powder"
]);

export function Fridge({
  ingredients,
  quickLabels,
  onAdd,
  onRemove,
  onAddQuickLabel,
  onRemoveQuickLabel,
  loading
}) {
  const [open, setOpen] = useState(true);
  const [pantryOpen, setPantryOpen] = useState(true);
  const [spiceOpen, setSpiceOpen] = useState(true);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const [location, setLocation] = useState("fridge");
  const [customLabel, setCustomLabel] = useState("");

  const visibleQuickAdds = useMemo(
    () => [...new Set([...quickAdds, ...(quickLabels || [])])],
    [quickLabels]
  );

  const groupedIngredients = useMemo(() => {
    const groups = {
      fridge: [],
      pantry: [],
      spices: []
    };

    ingredients.forEach((ingredient) => {
      const name = ingredient.name.toLowerCase();
      if (ingredient.location === "spices" || ingredient.location === "spice") {
        groups.spices.push(ingredient);
      } else if (ingredient.location === "pantry") {
        groups.pantry.push(ingredient);
      } else if (ingredient.location === "fridge") {
        groups.fridge.push(ingredient);
      } else if (spiceNames.has(name)) {
        groups.spices.push(ingredient);
      } else if (pantryNames.has(name)) {
        groups.pantry.push(ingredient);
      } else {
        groups.fridge.push(ingredient);
      }
    });

    return groups;
  }, [ingredients]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await onAdd({ name, quantity, unit, location });
    setName("");
    setQuantity(1);
  }

  async function handleAddLabel(event) {
    event.preventDefault();
    if (!customLabel.trim()) return;
    await onAddQuickLabel(customLabel);
    setCustomLabel("");
  }

  return (
    <section className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,330px)_minmax(210px,1fr)_minmax(190px,0.8fr)_minmax(230px,280px)]">
      <div className="relative w-full">
        <div className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-mint/60 via-white to-tomato/20 blur-xl" />
        <div className="relative h-full min-h-[500px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#dce8e3] p-3 shadow-soft">
          <div className="absolute inset-3 rounded-[1.35rem] bg-gradient-to-b from-white to-[#edf2ef]" />
          <div className="relative h-full rounded-[1.15rem] border border-white bg-[#f8fbf9] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-basil">Fridge</p>
                <h2 className="text-xl font-black leading-tight">Fresh</h2>
              </div>
              <button
                onClick={() => setOpen((value) => !value)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-basil"
                aria-label={open ? "Close fridge" : "Open fridge"}
                title={open ? "Close fridge" : "Open fridge"}
              >
                <Snowflake size={18} />
              </button>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[#d7e4dc] bg-gradient-to-b from-[#edf7f1] to-white">
              <IngredientGrid
                ingredients={groupedIngredients.fridge}
                onRemove={onRemove}
                emptyText="Cold ingredients will land here."
                className="absolute inset-4"
              />

              <motion.div
                className="absolute inset-0 z-10 origin-left rounded-2xl border border-white/70 bg-gradient-to-br from-[#e8f4ef] via-[#c8ded4] to-[#9db8ac] shadow-[22px_0_50px_rgba(23,32,26,0.16)]"
                animate={{ rotateY: open ? 78 : 0, x: open ? -28 : 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
                style={{ transformPerspective: 1200 }}
              >
                <div className="absolute right-5 top-1/2 h-28 w-3 -translate-y-1/2 rounded-full bg-white/80 shadow-inner" />
                <div className="absolute inset-y-5 left-1/2 w-px bg-white/45" />
                <div className="absolute right-6 top-8 h-10 w-10 rounded-full bg-white/45" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <StorageRack
        title="Pantry"
        eyebrow="Shelf-stable"
        icon={<Package size={18} />}
        ingredients={groupedIngredients.pantry}
        onRemove={onRemove}
        emptyText="Rice, pasta, flour and dry goods will land here."
        variant="pantry"
        open={pantryOpen}
        onToggleOpen={() => setPantryOpen((value) => !value)}
      />

      <StorageRack
        title="Spice Rack"
        eyebrow="Seasoning"
        icon={<Sparkles size={18} />}
        ingredients={groupedIngredients.spices}
        onRemove={onRemove}
        emptyText="Salt, pepper, herbs and spices will land here."
        variant="basket"
        open={spiceOpen}
        onToggleOpen={() => setSpiceOpen((value) => !value)}
      />

      <aside className="rounded-2xl border border-white/80 bg-white/72 p-4 shadow-soft backdrop-blur">
        <h3 className="text-lg font-black leading-tight">Add ingredients</h3>
        <form onSubmit={handleSubmit} className="mt-3 grid gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            list="ingredient-suggestions"
            placeholder="eggs, basil, tofu..."
            className="h-10 min-w-0 rounded-xl border border-[#dce8e3] bg-white px-3 text-sm font-semibold outline-none transition focus:border-basil focus:ring-4 focus:ring-mint/40"
          />
          <datalist id="ingredient-suggestions">
            {quickAdds.map((item) => (
              <option value={item} key={item} />
            ))}
          </datalist>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#dce8e3] bg-white p-1">
            {storageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocation(option.value)}
                className={`min-h-9 rounded-lg px-2 text-[11px] font-black transition ${
                  location === option.value ? "bg-basil text-white shadow-glow" : "text-steel hover:bg-[#edf7f1]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_auto] gap-2">
            <input
              type="number"
              min="0"
              step="0.5"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="h-10 min-w-0 rounded-xl border border-[#dce8e3] bg-white px-3 text-sm font-semibold outline-none focus:border-basil"
            />
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="h-10 min-w-0 rounded-xl border border-[#dce8e3] bg-white px-2 text-sm font-semibold outline-none focus:border-basil"
            >
              {units.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button
              disabled={loading}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-basil text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Add ingredient"
              title="Add ingredient"
            >
              <Plus size={19} />
            </button>
          </div>
        </form>

        <form onSubmit={handleAddLabel} className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            value={customLabel}
            onChange={(event) => setCustomLabel(event.target.value)}
            placeholder="Custom quick label"
            className="h-10 min-w-0 rounded-xl border border-[#dce8e3] bg-white px-3 text-xs font-bold outline-none transition focus:border-basil focus:ring-4 focus:ring-mint/40"
          />
          <button
            disabled={loading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce8e3] bg-white text-basil transition hover:-translate-y-0.5 disabled:opacity-60"
            aria-label="Add quick label"
            title="Add quick label"
          >
            <Plus size={16} />
          </button>
        </form>

        <div className="mt-3 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden pr-1">
          {visibleQuickAdds.map((item) => {
            const removable = quickLabels?.includes(item);

            return (
              <div key={item} className="group relative">
                <button
                  type="button"
                  onClick={() => onAdd({ name: item, quantity: 1, unit: "item", location })}
                  className="min-h-9 w-full rounded-xl border border-[#dce8e3] bg-white px-2 py-2 pr-7 text-left text-xs font-bold capitalize text-steel transition hover:-translate-y-0.5 hover:border-basil hover:text-basil"
                  title={`Add ${item} to ${storageOptions.find((option) => option.value === location)?.label}`}
                >
                  {item}
                </button>
                {removable && (
                  <button
                    type="button"
                    onClick={() => onRemoveQuickLabel(item)}
                    className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-steel transition hover:bg-tomato hover:text-white"
                    aria-label={`Remove ${item} quick label`}
                    title={`Remove ${item}`}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

function StorageRack({
  title,
  eyebrow,
  icon,
  ingredients,
  onRemove,
  emptyText,
  variant = "shelf",
  open = true,
  onToggleOpen
}) {
  const isPantry = variant === "pantry";
  const isBasket = variant === "basket";

  return (
    <aside
      className={`flex min-h-[500px] flex-col rounded-2xl border p-4 shadow-soft backdrop-blur ${
        isPantry
          ? "border-[#a66b3d]/30 bg-[#8a5b36]/18"
          : isBasket
            ? "border-[#c99867]/45 bg-[#fff6e8]/78"
            : "border-white/80 bg-white/72"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${isPantry ? "text-[#8a4d24]" : "text-basil"}`}>
            {eyebrow}
          </p>
          <h3 className="text-xl font-black leading-tight">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          disabled={!isPantry && !isBasket}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
            isPantry
              ? "bg-[#6f4021] text-white hover:-translate-y-0.5"
              : isBasket
                ? "bg-[#f2dcc0] text-[#8a4d24] hover:-translate-y-0.5"
                : "bg-[#edf7f1] text-basil"
          }`}
          aria-label={isPantry || isBasket ? (open ? `Close ${title}` : `Open ${title}`) : title}
          title={isPantry || isBasket ? (open ? `Close ${title}` : `Open ${title}`) : title}
        >
          {icon}
        </button>
      </div>

      <div
        className={`relative mt-4 flex-1 overflow-hidden ${
          isBasket
            ? "rounded-[1.5rem] border-2 border-[#b67843] bg-[#f4d3aa] p-4 shadow-inner"
            : isPantry
              ? "rounded-2xl border border-[#8a5b36]/45 bg-gradient-to-b from-[#d2a06b] to-[#8d5832] p-3"
              : "rounded-2xl border border-[#dce8e3] bg-gradient-to-b from-[#f7f3e8] to-white p-3"
        }`}
      >
        {isBasket && <div className="pointer-events-none absolute inset-x-5 top-5 h-2 rounded-full bg-[#a46535]/35" />}

        <IngredientGrid
          ingredients={ingredients}
          onRemove={onRemove}
          emptyText={emptyText}
          compact={isBasket}
          className={`relative z-10 h-full ${isBasket ? "pt-6" : ""}`}
          emptyClassName={isPantry ? "border-[#f3d3ad]/60 bg-white/20 text-white" : "border-[#c9d8d0] bg-white/55 text-steel"}
        />

        {isPantry && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20">
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 origin-left rounded-l-2xl border-r border-[#5c321a]/50 bg-gradient-to-br from-[#9b5f31] via-[#7b4825] to-[#5d341d] shadow-[14px_0_28px_rgba(23,32,26,0.18)]"
              animate={{ rotateY: open ? -82 : 0, x: open ? -22 : 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              style={{ transformPerspective: 1000 }}
            >
              <div className="absolute inset-3 rounded-xl border border-[#d2a06b]/40" />
              <div className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#f1c27d]" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 origin-right rounded-r-2xl border-l border-[#5c321a]/50 bg-gradient-to-bl from-[#9b5f31] via-[#7b4825] to-[#5d341d] shadow-[-14px_0_28px_rgba(23,32,26,0.18)]"
              animate={{ rotateY: open ? 82 : 0, x: open ? 22 : 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              style={{ transformPerspective: 1000 }}
            >
              <div className="absolute inset-3 rounded-xl border border-[#d2a06b]/40" />
              <div className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#f1c27d]" />
            </motion.div>
          </div>
        )}

        {isBasket && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 origin-top rounded-[1.35rem] border-2 border-[#a46535] bg-[#d99f64] shadow-[0_16px_30px_rgba(23,32,26,0.18)]"
            animate={{ rotateX: open ? 0 : 0, y: open ? "-108%" : "0%" }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            style={{ transformPerspective: 1000 }}
          >
            <div className="absolute inset-x-8 top-4 h-2 rounded-full bg-[#8d5832]/45" />
            <div className="absolute inset-x-4 bottom-4 h-3 rounded-full bg-white/20" />
          </motion.div>
        )}
      </div>
    </aside>
  );
}

function IngredientGrid({
  ingredients,
  onRemove,
  emptyText,
  compact = false,
  className = "",
  emptyClassName = "border-[#c9d8d0] bg-white/55 text-steel"
}) {
  return (
    <div className={className}>
      {ingredients.length ? (
        <div className="grid max-h-full grid-cols-2 gap-2 overflow-x-hidden overflow-y-auto overscroll-contain pr-1">
          <AnimatePresence>
            {ingredients.map((ingredient) => (
              <IngredientTile
                key={ingredient._id}
                ingredient={ingredient}
                onRemove={onRemove}
                compact={compact}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className={`grid h-full min-h-[240px] place-items-center rounded-xl border border-dashed p-4 text-center ${emptyClassName}`}>
          <p className="max-w-[13rem] text-sm font-semibold leading-6">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

function IngredientTile({ ingredient, onRemove, compact = false }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.86 }}
      className={`group flex flex-col justify-between rounded-xl border border-white/80 bg-white/90 shadow-sm ${compact ? "min-h-16 p-2 text-xs" : "min-h-16 p-3 text-sm"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="break-words font-black capitalize leading-tight">{ingredient.name}</span>
        <button
          onClick={() => onRemove(ingredient._id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-steel opacity-0 transition hover:bg-tomato hover:text-white group-hover:opacity-100 focus:opacity-100"
          aria-label={`Remove ${ingredient.name}`}
          title={`Remove ${ingredient.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <span className="mt-2 text-xs font-semibold text-steel">
        {ingredient.quantity} {ingredient.unit}
      </span>
    </motion.div>
  );
}
