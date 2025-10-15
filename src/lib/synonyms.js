// Simple mapping from model labels / user inputs -> canonical ingredient names
const CANONICAL = [
  "tomato",
  "onion",
  "garlic",
  "potato",
  "carrot",
  "bell pepper",
  "chicken",
  "beef",
  "egg",
  "milk",
  "butter",
  "olive oil",
  "flour",
  "rice",
  "pasta",
  "broccoli",
  "spinach",
  "mushroom",
  "cheese",
  "yogurt",
  "lemon",
  "lime",
  "apple",
  "banana",
  "cucumber",
  "zucchini",
  "salt",
  "pepper",
  "cumin",
  "coriander",
  "paprika",
  "ginger",
  "cilantro",
  "parsley",
  "chickpeas",
  "lentils",
  "beans",
  "tofu",
  "soy sauce",
  "vinegar",
  "honey",
  "sugar",
]

const MAP = {
  // common synonyms and mobilenet labels
  "granny smith": "apple",
  "bell pepper": "bell pepper",
  "sweet pepper": "bell pepper",
  capsicum: "bell pepper",
  scallion: "onion",
  shallot: "onion",
  "green onion": "onion",
  "spring onion": "onion",
  aubergine: "eggplant",
  eggplant: "eggplant",
  courgette: "zucchini",
  coriander: "cilantro",
  "ground beef": "beef",
  beefsteak: "beef",
  poultry: "chicken",
  yolk: "egg",
  dairy: "milk",
  yogurt: "yogurt",
  curd: "yogurt",
  maize: "corn",
  corn: "corn",
  chilli: "pepper",
  chili: "pepper",
  "chilli pepper": "pepper",
  ketchup: "tomato",
  "tomato sauce": "tomato",
  "tomato ketchup": "tomato",
  "bell pepper, sweet pepper": "bell pepper",
}

export function toCanonical(label) {
  if (!label) return null
  const low = String(label).toLowerCase()
  if (MAP[low]) return MAP[low]
  // simple contains matching
  for (const c of CANONICAL) {
    if (low.includes(c)) return c
  }
  // try splitting on commas and choosing first token
  const base = low.split(",")[0].trim()
  if (MAP[base]) return MAP[base]
  return null
}
