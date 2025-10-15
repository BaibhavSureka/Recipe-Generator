"use client"

import { useState, useEffect } from "react"

export default function IngredientsInput({ ingredients, onChange, query, onQuery }) {
  const [input, setInput] = useState("")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const addItem = () => {
    const term = input.trim().toLowerCase()
    if (!term) return
    if (!ingredients.includes(term)) {
      onChange([...ingredients, term])
      setInput("")
    }
  }
  const removeItem = (name) => onChange(ingredients.filter((x) => x !== name))
  const clearAll = () => onChange([])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your ingredients</label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., tomato, onion, garlic"
            className="flex-1 border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            aria-label="Add ingredient"
          />
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition transform hover:scale-105 active:scale-95"
          >
            ➕ Add
          </button>
        </div>
      </div>

      {!mounted ? (
        <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-border text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : ingredients.length > 0 ? (
        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-destructive hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <li
                key={ing}
                className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm flex items-center gap-2 hover:bg-primary/20 transition group"
              >
                <span className="capitalize font-medium">{ing}</span>
                <button
                  className="text-muted-foreground hover:text-destructive transition group-hover:rotate-90 transform"
                  aria-label={`Remove ${ing}`}
                  onClick={() => removeItem(ing)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-border text-center text-sm text-muted-foreground">
          No ingredients added yet. Add some above or use AI detection! 🤖
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">🔍 Search recipes</label>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by title or cuisine..."
          className="w-full border border-border rounded-lg px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition"
          aria-label="Search recipes"
        />
      </div>
    </div>
  )
}
