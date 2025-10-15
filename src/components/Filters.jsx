"use client"

export default function Filters({ diet, onDiet, filters, onFilters }) {
  return (
    <div className="w-full">
      {/* Mobile: Stack vertically, Tablet+: Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 sm:mt-6">
        {/* Dietary Preferences Card */}
        <div className="bg-muted/30 border-2 border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
          <p className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
            <span className="text-2xl">🥗</span>
            <span>Dietary Preferences</span>
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
              <input
                type="checkbox"
                checked={diet.vegetarian}
                onChange={(e) => onDiet({ ...diet, vegetarian: e.target.checked })}
                className="w-6 h-6 rounded-md border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition font-semibold text-base">🌱 Vegetarian</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
              <input
                type="checkbox"
                checked={diet.vegan}
                onChange={(e) => onDiet({ ...diet, vegan: e.target.checked })}
                className="w-6 h-6 rounded-md border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition font-semibold text-base">🥬 Vegan</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
              <input
                type="checkbox"
                checked={diet.glutenFree}
                onChange={(e) => onDiet({ ...diet, glutenFree: e.target.checked })}
                className="w-6 h-6 rounded-md border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition font-semibold text-base">🌾 Gluten-free</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary/20">
              <input
                type="checkbox"
                checked={diet.dairyFree}
                onChange={(e) => onDiet({ ...diet, dairyFree: e.target.checked })}
                className="w-6 h-6 rounded-md border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition font-semibold text-base">🥛 Dairy-free</span>
            </label>
          </div>
        </div>

        {/* Cooking Filters Card */}
        <div className="bg-muted/30 border-2 border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all">
          <p className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
            <span className="text-2xl">⚙️</span>
            <span>Cooking Filters</span>
          </p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-3">
              <span className="font-bold text-base flex items-center gap-2 text-foreground">
                <span className="text-xl">📊</span>
                <span>Difficulty Level</span>
              </span>
              <select
                value={filters.difficulty}
                onChange={(e) => onFilters({ ...filters, difficulty: e.target.value })}
                className="border-2 border-border rounded-xl px-4 py-3.5 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer hover:border-primary/50 text-base"
              >
                <option value="any">🎯 Any Level</option>
                <option value="easy">😊 Easy</option>
                <option value="medium">👨‍🍳 Medium</option>
                <option value="hard">🔥 Hard</option>
              </select>
            </label>
            
            <label className="flex flex-col gap-3">
              <span className="font-bold text-base flex items-center gap-2 text-foreground">
                <span className="text-xl">⏱️</span>
                <span>Max Cooking Time</span>
              </span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="5"
                  value={filters.maxTime}
                  onChange={(e) => onFilters({ ...filters, maxTime: Number(e.target.value || 0) })}
                  className="w-full border-2 border-border rounded-xl px-4 py-3.5 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50 text-base"
                  placeholder="e.g., 120"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none font-medium">
                  minutes
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
