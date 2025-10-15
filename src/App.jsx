"use client"

import { useEffect, useMemo, useState } from "react"
import IngredientRecognizer from "./components/IngredientRecognizer.jsx"
import IngredientsInput from "./components/IngredientsInput.jsx"
import Filters from "./components/Filters.jsx"
import RecipeCard from "./components/RecipeCard.jsx"
import RecipeModal from "./components/RecipeModal.jsx"
import { recipes as RECIPES } from "./data/recipes.js"
import { substitutions as SUBS } from "./data/substitutions.js"
import { matchRecipes } from "./lib/match.js"

const initialDiet = { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false }

function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const val = localStorage.getItem(key)
      return val ? JSON.parse(val) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

export default function App() {
  const [ingredients, setIngredients] = usePersistentState("sr_ingredients", [])
  const [diet, setDiet] = usePersistentState("sr_diet", initialDiet)
  const [filters, setFilters] = usePersistentState("sr_filters", { difficulty: "any", maxTime: 120 })
  const [query, setQuery] = usePersistentState("sr_query", "")
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [darkMode, setDarkMode] = usePersistentState("sr_darkMode", false)
  const [mounted, setMounted] = useState(false)

  const [favorites, setFavorites] = usePersistentState("sr_favorites", [])
  const [ratings, setRatings] = usePersistentState("sr_ratings", {}) // { [id]: number }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const rateRecipe = (id, stars) => {
    setRatings((prev) => ({ ...prev, [id]: stars }))
  }

  const matched = useMemo(() => {
    const res = matchRecipes({
      recipes: RECIPES,
      userIngredients: ingredients,
      diet,
      filters,
      substitutions: SUBS,
      ratings,
    })
    if (!query.trim()) return res
    const q = query.toLowerCase()
    return res.filter((r) => r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q))
  }, [ingredients, diet, filters, query, ratings])

  const suggestions = useMemo(() => {
    // Recommend recipes similar to user's highest-rated cuisine or ingredient overlap
    const topRatedIds = Object.entries(ratings)
      .filter(([, v]) => v >= 4)
      .map(([k]) => k)
    if (topRatedIds.length === 0) return []
    const topRated = RECIPES.filter((r) => topRatedIds.includes(String(r.id)))
    const cuisines = new Set(topRated.map((r) => r.cuisine))
    const top = matchRecipes({
      recipes: RECIPES,
      userIngredients: ingredients,
      diet,
      filters,
      substitutions: SUBS,
      ratings,
    })
    return top.filter((r) => cuisines.has(r.cuisine) && !topRatedIds.includes(String(r.id))).slice(0, 6)
  }, [ratings, ingredients, diet, filters])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-balance">🍳 Smart Recipe Generator</h1>
          <div className="flex gap-2 items-center">
            {mounted && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 rounded-md border border-border hover:bg-accent transition"
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            )}
            <a href="#recipes" className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition">
              Browse Recipes
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <span>Recognize Ingredients from Photo</span>
              </h2>
              <IngredientRecognizer
                onRecognized={(items) => {
                  // Merge without duplicates
                  setIngredients((prev) => {
                    const set = new Set(prev.map((x) => x.toLowerCase()))
                    items.forEach((i) => set.add(i.toLowerCase()))
                    return Array.from(set)
                  })
                }}
              />
            </div>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🥗</span>
                <span>Add Ingredients & Preferences</span>
              </h2>
              <IngredientsInput ingredients={ingredients} onChange={setIngredients} query={query} onQuery={setQuery} />
              <div className="mt-4">
                <Filters diet={diet} onDiet={setDiet} filters={filters} onFilters={setFilters} />
              </div>
            </div>
          </div>
        </section>

        <section id="recipes" className="bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🍽️</span>
                <span>Recipe Results</span>
              </h2>
              <p className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">
                {matched.length} recipe{matched.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matched.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  isFavorite={favorites.includes(String(r.id))}
                  rating={ratings[String(r.id)] || 0}
                  onToggleFavorite={() => toggleFavorite(String(r.id))}
                  onRate={(stars) => rateRecipe(String(r.id), stars)}
                  onOpen={() => setSelectedRecipe(r)}
                />
              ))}
            </div>
          </div>
        </section>

        {suggestions.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Suggestions for you</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((r) => (
                <RecipeCard
                  key={`s-${r.id}`}
                  recipe={r}
                  isFavorite={favorites.includes(String(r.id))}
                  rating={ratings[String(r.id)] || 0}
                  onToggleFavorite={() => toggleFavorite(String(r.id))}
                  onRate={(stars) => rateRecipe(String(r.id), stars)}
                  onOpen={() => setSelectedRecipe(r)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted-foreground flex items-center justify-between">
          <p>© {new Date().getFullYear()} Smart Recipe Generator | Made with ❤️</p>
          <p className="hidden sm:block">Powered by AI • React • TensorFlow.js</p>
        </div>
      </footer>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onRate={(stars) => rateRecipe(String(selectedRecipe.id), stars)}
          rating={ratings[String(selectedRecipe.id)] || 0}
          onToggleFavorite={() => toggleFavorite(String(selectedRecipe.id))}
          isFavorite={favorites.includes(String(selectedRecipe.id))}
          userIngredients={ingredients}
          substitutions={SUBSTITUTIONS}
        />
      )}
    </div>
  )
}
