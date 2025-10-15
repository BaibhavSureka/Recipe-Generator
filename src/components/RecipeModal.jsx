"use client"

import { useMemo, useState } from "react"

function Nutrition({ nutrition, factor }) {
  const scaled = useMemo(() => {
    const n = nutrition || {}
    const f = factor || 1
    return {
      calories: Math.round((n.calories || 0) * f),
      protein: Math.round((n.protein || 0) * f),
      carbs: Math.round((n.carbs || 0) * f),
      fat: Math.round((n.fat || 0) * f),
    }
  }, [nutrition, factor])

  return (
    <div className="text-sm text-neutral-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div className="bg-neutral-50 border border-neutral-200 rounded p-2">
        <div className="text-neutral-500 text-xs">Calories</div>
        <div className="font-semibold">{scaled.calories}</div>
      </div>
      <div className="bg-neutral-50 border border-neutral-200 rounded p-2">
        <div className="text-neutral-500 text-xs">Protein</div>
        <div className="font-semibold">{scaled.protein} g</div>
      </div>
      <div className="bg-neutral-50 border border-neutral-200 rounded p-2">
        <div className="text-neutral-500 text-xs">Carbs</div>
        <div className="font-semibold">{scaled.carbs} g</div>
      </div>
      <div className="bg-neutral-50 border border-neutral-200 rounded p-2">
        <div className="text-neutral-500 text-xs">Fat</div>
        <div className="font-semibold">{scaled.fat} g</div>
      </div>
    </div>
  )
}

function Stars({ value = 0, onChange }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          onClick={() => onChange?.(s)}
          className={`text-2xl ${s <= value ? "text-amber-500" : "text-neutral-300"}`}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function RecipeModal({ recipe, onClose, onRate, rating, onToggleFavorite, isFavorite, userIngredients, substitutions }) {
  const [servings, setServings] = useState(recipe.servings || 2)
  const factor = (servings || recipe.servings || 2) / (recipe.servings || 2)

  // Determine missing ingredients and their substitutions
  const missingWithSubs = useMemo(() => {
    if (!userIngredients || !substitutions) return []
    const normalize = (str) => String(str || "").toLowerCase().trim()
    const userSet = new Set(userIngredients.map(normalize))
    
    return recipe.ingredients
      .filter((ing) => {
        const name = normalize(ing.name || ing)
        return !userSet.has(name)
      })
      .map((ing) => {
        const name = normalize(ing.name || ing)
        const subs = substitutions[name] || []
        return subs.length > 0 ? { ingredient: ing.name, substitutes: subs } : null
      })
      .filter(Boolean)
  }, [recipe.ingredients, userIngredients, substitutions])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl">
        <div className="p-4 border-b border-neutral-200 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{recipe.title}</h3>
            <p className="text-sm text-neutral-600">
              {recipe.cuisine} • {recipe.difficulty} • {recipe.cook_time_mins} min
            </p>
            <div className="mt-1 text-xs text-neutral-500">{recipe.tags?.join(" • ")}</div>
          </div>
          <button className="px-3 py-1 rounded-md border border-neutral-300" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Stars value={rating} onChange={onRate} />
              <button
                onClick={onToggleFavorite}
                className={`px-3 py-1 rounded-md text-sm ${
                  isFavorite ? "bg-primary text-white" : "border border-neutral-300"
                }`}
              >
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Servings</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value || 1))}
                className="w-20 border border-neutral-300 rounded-md px-2 py-1"
              />
            </div>
          </div>

          {/* Bonus Features */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                window.print()
              }}
              className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm flex items-center gap-2 hover:bg-neutral-50"
            >
              🖨️ Print Recipe
            </button>
            <button
              onClick={() => {
                const url = window.location.href
                if (navigator.share) {
                  navigator.share({
                    title: recipe.title,
                    text: `Check out this ${recipe.cuisine} recipe: ${recipe.title}`,
                    url: url,
                  })
                } else {
                  navigator.clipboard.writeText(url)
                  alert("Recipe link copied to clipboard!")
                }
              }}
              className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm flex items-center gap-2 hover:bg-neutral-50"
            >
              🔗 Share
            </button>
            <button
              onClick={() => {
                const list = recipe.ingredients
                  .map((ing) => {
                    const qty = typeof ing.qty === "number" ? Math.round(ing.qty * factor * 100) / 100 : ing.qty
                    return `${qty} ${ing.unit || ""} ${ing.name}`.trim()
                  })
                  .join("\n")
                navigator.clipboard.writeText(`Shopping List for ${recipe.title}:\n\n${list}`)
                alert("Shopping list copied to clipboard!")
              }}
              className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm flex items-center gap-2 hover:bg-neutral-50"
            >
              🛒 Shopping List
            </button>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Ingredients</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {recipe.ingredients.map((it, idx) => (
                <li key={idx}>
                  {typeof it.qty === "number" ? Math.round(it.qty * factor * 100) / 100 : it.qty}{" "}
                  {it.unit ? `${it.unit} ` : ""}
                  {it.name}
                  {it.note ? ` (${it.note})` : ""}
                  {it._subbed ? " • subbed" : ""}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Instructions</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {recipe.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Nutrition (per serving)</h4>
            <Nutrition nutrition={recipe.nutrition} factor={factor} />
          </div>

          {missingWithSubs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">💡 Ingredient Substitutions</h4>
              <div className="space-y-2">
                {missingWithSubs.map((item, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="text-sm font-medium text-amber-900">
                      Don't have <span className="font-semibold">{item.ingredient}</span>?
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      Try: {item.substitutes.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
