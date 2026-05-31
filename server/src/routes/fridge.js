import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  addIngredient,
  addQuickLabel,
  getOrCreateFridge,
  removeIngredient,
  removeQuickLabel
} from "../repositories/pineconeRepository.js";

export const fridgeRouter = express.Router();

fridgeRouter.use(requireAuth);

fridgeRouter.get("/", async (req, res, next) => {
  try {
    const fridge = await getOrCreateFridge(req.user.id);
    res.json({ fridge });
  } catch (error) {
    next(error);
  }
});

fridgeRouter.post("/add-ingredient", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim().toLowerCase();
    const quantity = Number(req.body.quantity || 1);
    const unit = String(req.body.unit || "item").trim();
    const location = String(req.body.location || "fridge").trim().toLowerCase();

    if (!name) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    const fridge = await addIngredient(req.user.id, {
      name,
      quantity: Number.isFinite(quantity) ? quantity : 1,
      unit: unit || "item",
      location: ["fridge", "pantry", "spices", "spice"].includes(location) ? location : "fridge"
    });
    res.status(201).json({ fridge });
  } catch (error) {
    next(error);
  }
});

fridgeRouter.delete("/remove-ingredient/:ingredientId", async (req, res, next) => {
  try {
    const fridge = await removeIngredient(req.user.id, req.params.ingredientId);
    res.json({ fridge });
  } catch (error) {
    next(error);
  }
});

fridgeRouter.post("/quick-labels", async (req, res, next) => {
  try {
    const fridge = await addQuickLabel(req.user.id, req.body.label);
    res.status(201).json({ quickLabels: fridge.quickLabels || [], fridge });
  } catch (error) {
    next(error);
  }
});

fridgeRouter.delete("/quick-labels/:label", async (req, res, next) => {
  try {
    const fridge = await removeQuickLabel(req.user.id, req.params.label);
    res.json({ quickLabels: fridge.quickLabels || [], fridge });
  } catch (error) {
    next(error);
  }
});
