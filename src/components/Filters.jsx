"use client"

export default function Filters({ diet, onDiet, filters, onFilters }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-6">
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <p className="font-semibold mb-3 flex items-center gap-2">
          <span>🥗</span>
          <span>Dietary preferences</span>
        </p>
        <div className="flex flex-col gap-2.5 text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={diet.vegetarian}
              onChange={(e) => onDiet({ ...diet, vegetarian: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="group-hover:text-primary transition">🌱 Vegetarian</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={diet.vegan}
              onChange={(e) => onDiet({ ...diet, vegan: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="group-hover:text-primary transition">🥬 Vegan</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={diet.glutenFree}
              onChange={(e) => onDiet({ ...diet, glutenFree: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="group-hover:text-primary transition">🌾 Gluten-free</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={diet.dairyFree}
              onChange={(e) => onDiet({ ...diet, dairyFree: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="group-hover:text-primary transition">🥛 Dairy-free</span>
          </label>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <p className="font-semibold mb-3 flex items-center gap-2">
          <span>⚙️</span>
          <span>Filters</span>
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <label className="flex flex-col">
            <span className="mb-2 font-medium">Difficulty</span>
            <select
              value={filters.difficulty}
              onChange={(e) => onFilters({ ...filters, difficulty: e.target.value })}
              className="border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="any">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="mb-2 font-medium">Max time (min)</span>
            <input
              type="number"
              min="0"
              value={filters.maxTime}
              onChange={(e) => onFilters({ ...filters, maxTime: Number(e.target.value || 0) })}
              className="border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
