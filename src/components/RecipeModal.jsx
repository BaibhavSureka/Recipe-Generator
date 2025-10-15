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
    <div className="text-sm text-muted-foreground grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div className="bg-muted/50 border border-border rounded p-2">
        <div className="text-muted-foreground text-xs">Calories</div>
        <div className="font-semibold text-foreground">{scaled.calories}</div>
      </div>
      <div className="bg-muted/50 border border-border rounded p-2">
        <div className="text-muted-foreground text-xs">Protein</div>
        <div className="font-semibold text-foreground">{scaled.protein} g</div>
      </div>
      <div className="bg-muted/50 border border-border rounded p-2">
        <div className="text-muted-foreground text-xs">Carbs</div>
        <div className="font-semibold text-foreground">{scaled.carbs} g</div>
      </div>
      <div className="bg-muted/50 border border-border rounded p-2">
        <div className="text-muted-foreground text-xs">Fat</div>
        <div className="font-semibold text-foreground">{scaled.fat} g</div>
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
          className={`text-2xl transition-colors ${s <= value ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground/30"}`}
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
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 sm:p-6 md:p-8 z-50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card text-card-foreground w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border-2 border-border/50 relative flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Fixed Header with Close Button */}
        <div className="sticky top-0 z-20 px-4 py-3 sm:px-6 sm:py-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span>🌍</span>
                  <span>{recipe.cuisine}</span>
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <span>📊</span>
                  <span className="capitalize">{recipe.difficulty}</span>
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{recipe.cook_time_mins} min</span>
                </span>
              </p>
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group" 
              onClick={onClose} 
              aria-label="Close recipe"
            >
              <span className="text-xl sm:text-lg group-hover:rotate-90 transition-transform">✕</span>
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain rounded-b-2xl">

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 pb-6">
          {/* Rating and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Rate:</span>
              <Stars value={rating} onChange={onRate} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFavorite}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isFavorite 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "border-2 border-border hover:bg-accent hover:border-primary"
                }`}
              >
                {isFavorite ? "❤️ Saved" : "🤍 Save"}
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">Servings:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value || 1))}
                  className="w-14 bg-transparent text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary rounded"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                window.print()
              }}
              className="px-4 py-3 rounded-lg border-2 border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent hover:border-primary transition-all bg-background"
            >
              🖨️ <span>Print Recipe</span>
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
              className="px-4 py-3 rounded-lg border-2 border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent hover:border-primary transition-all bg-background"
            >
              🔗 <span>Share</span>
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
              className="px-4 py-3 rounded-lg border-2 border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent hover:border-primary transition-all bg-background"
            >
              🛒 <span>Shopping List</span>
            </button>
          </div>

          {/* Ingredients Section */}
          <div className="bg-gradient-to-br from-primary/5 to-transparent p-4 sm:p-5 rounded-xl border border-primary/20">
            <h4 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
              <span className="text-2xl">🥘</span>
              <span>Ingredients</span>
            </h4>
            <ul className="space-y-2.5 text-sm sm:text-base">
              {recipe.ingredients.map((it, idx) => (
                <li key={idx} className="flex items-start gap-3 text-card-foreground">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="flex-1">
                    <span className="font-semibold text-primary">
                      {typeof it.qty === "number" ? Math.round(it.qty * factor * 100) / 100 : it.qty}{" "}
                      {it.unit ? `${it.unit} ` : ""}
                    </span>
                    <span className="text-foreground">{it.name}</span>
                    {it.note && <span className="text-muted-foreground text-xs"> ({it.note})</span>}
                    {it._subbed && <span className="text-amber-600 dark:text-amber-400 text-xs font-medium"> • subbed</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Section */}
          <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-4 sm:p-5 rounded-xl border border-blue-500/20">
            <h4 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span>Instructions</span>
            </h4>
            <ol className="space-y-3 text-sm sm:text-base">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-card-foreground">
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{i + 1}.</span>
                  <span className="flex-1">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition Section */}
          <div className="bg-gradient-to-br from-green-500/5 to-transparent p-4 sm:p-5 rounded-xl border border-green-500/20">
            <h4 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>Nutrition (per serving)</span>
            </h4>
            <Nutrition nutrition={recipe.nutrition} factor={factor} />
          </div>

          {missingWithSubs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-foreground">💡 Ingredient Substitutions</h4>
              <div className="space-y-2">
                {missingWithSubs.map((item, idx) => (
                  <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                    <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Don't have <span className="font-semibold">{item.ingredient}</span>?
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
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
    </div>
  )
}
