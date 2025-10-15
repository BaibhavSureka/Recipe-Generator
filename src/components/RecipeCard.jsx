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
  return (
    <article className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-neutral-900 text-pretty">{recipe.title}</h3>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`px-2 py-1 rounded-md text-sm ${isFavorite ? "bg-primary text-white" : "border border-neutral-300"}`}
        >
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>
      <p className="text-sm text-neutral-600 mt-1">
        {recipe.cuisine} • {recipe.difficulty} • {recipe.cook_time_mins} min
      </p>
      <div className="text-xs text-neutral-500 mt-1">{recipe.tags?.join(" • ")}</div>

      <div className="mt-3 flex items-center justify-between">
        <Stars value={rating} onChange={onRate} />
        <span className="text-xs px-2 py-1 rounded bg-neutral-100">
          Match: {(recipe._matchScore * 100).toFixed(0)}%
        </span>
      </div>

      {recipe._canMakeWithSubs && (
        <div className="text-xs mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Can make with substitutions
        </div>
      )}

      <button onClick={onOpen} className="mt-4 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
        View recipe
      </button>
    </article>
  )
}
