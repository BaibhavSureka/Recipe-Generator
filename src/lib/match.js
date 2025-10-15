function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim()
    .replace(/s\b/g, ""); // crude singularization: carrots -> carrot
}

// Dietary blockers per tag
const DIET_BLOCK = {
  vegetarian: ["chicken", "beef", "pork", "fish", "shrimp", "bacon", "sausage"],
  vegan: [
    "chicken",
    "beef",
    "pork",
    "fish",
    "shrimp",
    "bacon",
    "sausage",
    "egg",
    "milk",
    "butter",
    "cheese",
    "yogurt",
    "honey",
  ],
  glutenFree: ["flour", "pasta", "bread", "noodle", "soy sauce (gluten)"],
  dairyFree: ["milk", "butter", "cheese", "yogurt"],
};

function violatesDiet(ingredientName, diet) {
  const name = normalize(ingredientName);
  if (diet.vegan && DIET_BLOCK.vegan.some((x) => name.includes(x))) return true;
  if (diet.vegetarian && DIET_BLOCK.vegetarian.some((x) => name.includes(x)))
    return true;
  if (diet.glutenFree && DIET_BLOCK.glutenFree.some((x) => name.includes(x)))
    return true;
  if (diet.dairyFree && DIET_BLOCK.dairyFree.some((x) => name.includes(x)))
    return true;
  return false;
}

export function matchRecipes({
  recipes,
  userIngredients,
  diet,
  filters,
  substitutions,
  ratings,
}) {
  const userSet = new Set(userIngredients.map(normalize));
  const subMap = substitutions || {};
  const results = [];

  for (const r of recipes) {
    // Filter by difficulty
    if (
      filters?.difficulty &&
      filters.difficulty !== "any" &&
      r.difficulty !== filters.difficulty
    )
      continue;
    // Filter by time
    if (filters?.maxTime != null && r.cook_time_mins > filters.maxTime)
      continue;

    // DIETARY FILTER: Check recipe tags AND ingredients
    const recipeTags = r.tags || [];
    let dietBlocked = false;

    // If user wants vegetarian, recipe must be tagged vegetarian OR vegan
    if (
      diet.vegetarian &&
      !recipeTags.includes("vegetarian") &&
      !recipeTags.includes("vegan")
    ) {
      dietBlocked = true;
    }
    // If user wants vegan, recipe must be tagged vegan
    if (diet.vegan && !recipeTags.includes("vegan")) {
      dietBlocked = true;
    }
    // If user wants gluten-free, recipe must be tagged gluten-free
    if (diet.glutenFree && !recipeTags.includes("gluten-free")) {
      dietBlocked = true;
    }
    // If user wants dairy-free, check ingredients
    if (diet.dairyFree) {
      const hasViolation = (r.ingredients || []).some((i) => {
        const name = normalize(i.name || i);
        return DIET_BLOCK.dairyFree.some((x) => name.includes(x));
      });
      if (hasViolation) dietBlocked = true;
    }

    if (dietBlocked) continue;

    const ing = (r.ingredients || []).map((i) => normalize(i.name || i));
    let matched = 0;
    let subbed = 0;

    // Match and substitution scoring
    for (const name of ing) {
      if (userSet.has(name)) {
        matched += 1;
      } else {
        const candidates = subMap[name] || [];
        const usable = candidates.find(
          (c) => userSet.has(normalize(c)) && !violatesDiet(c, diet)
        );
        if (usable) {
          subbed += 1;
        }
      }
    }

    const total = ing.length || 1;
    let score = matched / total;

    // If no ingredients provided, give base score to show all recipes
    if (userIngredients.length === 0) {
      score = 0.5; // Base score for browsing mode
    } else {
      // Boost recipes where user has more matching ingredients
      if (matched > 0) {
        score += matched * 0.05; // Extra boost for each matched ingredient
      }

      // Small boost for available substitutions
      score += Math.min(subbed, 2) * 0.03;
    }

    // Boost for user's prior high rating of same cuisine
    const avgCuisineRating = averageCuisineRating(r.cuisine, recipes, ratings);
    if (avgCuisineRating >= 4) score += 0.05;

    // Clamp to max 1.5 to allow highly matched recipes to rise to top
    if (score > 1.5) score = 1.5;

    const matchPercent = Math.round((matched / total) * 100);

    const tagged = {
      ...r,
      _matchScore: score,
      matchPercent: matchPercent, // Add matchPercent for filtering
      _canMakeWithSubs: subbed > 0 && matched < total,
    };
    results.push(tagged);
  }

  results.sort((a, b) => {
    if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
    // then by shorter cook time
    return a.cook_time_mins - b.cook_time_mins;
  });

  return results;
}

function averageCuisineRating(cuisine, recipes, ratings) {
  const ids = recipes
    .filter((r) => r.cuisine === cuisine)
    .map((r) => String(r.id));
  const vals = ids
    .map((id) => ratings?.[id])
    .filter((x) => typeof x === "number");
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
