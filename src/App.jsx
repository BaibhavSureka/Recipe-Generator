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
    
    // Filter out recipes with 0% match when user has ingredients
    let filtered = ingredients.length > 0 
      ? res.filter((r) => r.matchPercent > 0)
      : res
    
    // Apply search query filter
    if (!query.trim()) return filtered
    const q = query.toLowerCase()
    return filtered.filter((r) => r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q))
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
          {ingredients.length === 0 && (
            <div className="mb-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground mb-1">Get Started!</h3>
                  <p className="text-sm text-muted-foreground">
                    Add ingredients manually or use AI to detect them from photos. The more ingredients you add, the better recipe matches you'll get!
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>🍽️</span>
                  <span>Recipe Results</span>
                </h2>
                {mounted && ingredients.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Matching with: <span className="font-medium text-primary">{ingredients.join(", ")}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {mounted && (
                  <p className="text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border font-medium">
                    {matched.length} recipe{matched.length === 1 ? "" : "s"}
                  </p>
                )}
                {mounted && (diet.vegetarian || diet.vegan || diet.glutenFree || diet.dairyFree) && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    🥗 Dietary Filters Active
                  </span>
                )}
              </div>
            </div>
            
            {mounted && ingredients.length > 0 && matched.length > 0 && (
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">💡 Smart Matching:</span> Recipes are sorted by ingredient match percentage. Higher percentages mean you have more of the required ingredients!
                </p>
              </div>
            )}
            
            {!mounted ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-muted-foreground">Loading recipes...</p>
              </div>
            ) : matched.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-16 px-4">
                {ingredients.length === 0 ? (
                  // No ingredients added yet
                  <>
                    <div className="text-8xl mb-6 animate-bounce">�‍🍳</div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Let's Get Cooking!</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Add your ingredients above to discover amazing recipes you can make
                    </p>
                    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-2 border-primary/30 rounded-2xl p-6">
                      <p className="text-sm font-semibold text-primary mb-2">💡 Pro Tip</p>
                      <p className="text-sm text-card-foreground">
                        Use the AI photo recognition to quickly detect ingredients, or type them manually!
                      </p>
                    </div>
                  </>
                ) : (
                  // Ingredients added but no matches
                  <>
                    <div className="text-7xl mb-6">🎨</div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">No Perfect Matches Yet</h3>
                    <p className="text-lg text-muted-foreground mb-4">
                      Your ingredients: <span className="font-semibold text-primary">{ingredients.join(", ")}</span>
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
                      <p className="text-base font-semibold text-amber-900 dark:text-amber-200 mb-3">
                        🤔 Here's what you can do:
                      </p>
                      <ul className="text-left space-y-2 text-sm text-amber-800 dark:text-amber-300">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span><strong>Remove dietary filters</strong> to see more options</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span><strong>Increase max cooking time</strong> for more recipes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span><strong>Add more common ingredients</strong> like onion, garlic, or oil</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">4.</span>
                          <span><strong>Try removing some ingredients</strong> to broaden your search</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        setDiet(initialDiet)
                        setFilters({ difficulty: "any", maxTime: 120 })
                      }}
                      className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg"
                    >
                      🔄 Reset All Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
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
            )}
          </div>
        </section>

        {mounted && suggestions.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">💡 Suggestions for you</h2>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {mounted ? new Date().getFullYear() : '2025'} Smart Recipe Generator | Made with ❤️</p>
          <p className="text-center sm:text-left">Powered by AI • React • TensorFlow.js</p>
        </div>
      </footer>

      {mounted && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onRate={(stars) => rateRecipe(String(selectedRecipe.id), stars)}
          rating={ratings[String(selectedRecipe.id)] || 0}
          onToggleFavorite={() => toggleFavorite(String(selectedRecipe.id))}
          isFavorite={favorites.includes(String(selectedRecipe.id))}
          userIngredients={ingredients}
          substitutions={SUBS}
        />
      )}
    </div>
  )
}
