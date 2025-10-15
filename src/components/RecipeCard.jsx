"use client"

function Stars({ value = 0, onChange }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${value} out of 5 stars`}>
      {stars.map((s) => (
        <button
          key={s}
          onClick={() => onChange?.(s)}
          className={`text-xl ${s <= value ? "text-amber-500" : "text-neutral-300"}`}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
          title={`${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function RecipeCard({ recipe, onOpen, isFavorite, onToggleFavorite, rating, onRate }) {
  const matchPercentage = Math.round((recipe._matchScore || 0) * 100)
  
  return (
    <article className="bg-card border border-border rounded-lg p-4 flex flex-col transition-all hover:shadow-lg hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-card-foreground text-pretty">{recipe.title}</h3>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`px-2 py-1 rounded-md text-sm transition ${
            isFavorite ? "bg-primary text-white" : "border border-border hover:bg-muted"
          }`}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {recipe.cuisine} • {recipe.difficulty} • {recipe.cook_time_mins} min
      </p>
      <div className="text-xs text-muted-foreground mt-1">{recipe.tags?.join(" • ")}</div>

      <div className="mt-3 flex items-center justify-between">
        <Stars value={rating} onChange={onRate} />
        <span className={`text-xs px-2 py-1 rounded font-semibold ${
          matchPercentage >= 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
          matchPercentage >= 50 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
          "bg-muted text-muted-foreground"
        }`}>
          {matchPercentage}% match
        </span>
      </div>

      {recipe._canMakeWithSubs && (
        <div className="text-xs mt-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
          💡 Can make with substitutions
        </div>
      )}

      <button 
        onClick={onOpen} 
        className="mt-4 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition font-medium"
      >
        View recipe →
      </button>
    </article>
  )
}
