export type Category =
  | "Fresh Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Bakery"
  | "Pantry"
  | "Frozen"
  | "Beverages"
  | "Household";

export type Product = {
  id: string;
  name: string;
  vendor: string;
  price: number;
  unit: string;
  category: Category;
  emoji: string;
  tag?: "Fresh" | "Organic" | "Frozen" | "Bestseller";
};

export const categories: { name: Category; emoji: string; blurb: string }[] = [
  { name: "Fresh Produce", emoji: "🥬", blurb: "Farm-direct fruits & veggies" },
  { name: "Meat & Seafood", emoji: "🥩", blurb: "Cuts & catches of the day" },
  { name: "Dairy & Eggs", emoji: "🥚", blurb: "Cold-chain fresh" },
  { name: "Bakery", emoji: "🥖", blurb: "Baked this morning" },
  { name: "Pantry", emoji: "🥫", blurb: "Everyday essentials" },
  { name: "Frozen", emoji: "🧊", blurb: "Snap-frozen goodness" },
  { name: "Beverages", emoji: "🥤", blurb: "Sip and refresh" },
  { name: "Household", emoji: "🧴", blurb: "Care for your home" },
];

export const products: Product[] = [
  { id: "p1", name: "Vine Tomatoes", vendor: "Akwa Farms", price: 4.5, unit: "/ kg", category: "Fresh Produce", emoji: "🍅", tag: "Organic" },
  { id: "p2", name: "Hass Avocados", vendor: "Green Hills Co-op", price: 6.0, unit: "/ 4 pcs", category: "Fresh Produce", emoji: "🥑", tag: "Fresh" },
  { id: "p3", name: "Baby Spinach", vendor: "Akwa Farms", price: 3.2, unit: "/ bunch", category: "Fresh Produce", emoji: "🥬" },
  { id: "p4", name: "Sweet Bananas", vendor: "Tropic Growers", price: 2.8, unit: "/ kg", category: "Fresh Produce", emoji: "🍌", tag: "Bestseller" },
  { id: "p5", name: "Free-range Eggs", vendor: "Sunrise Coop", price: 5.5, unit: "/ dozen", category: "Dairy & Eggs", emoji: "🥚", tag: "Organic" },
  { id: "p6", name: "Whole Milk", vendor: "Pure Dairy", price: 3.0, unit: "/ litre", category: "Dairy & Eggs", emoji: "🥛" },
  { id: "p7", name: "Greek Yogurt", vendor: "Pure Dairy", price: 4.2, unit: "/ 500g", category: "Dairy & Eggs", emoji: "🍶" },
  { id: "p8", name: "Sourdough Loaf", vendor: "Hearth Bakery", price: 5.0, unit: "/ loaf", category: "Bakery", emoji: "🍞", tag: "Fresh" },
  { id: "p9", name: "Buttery Croissants", vendor: "Hearth Bakery", price: 6.4, unit: "/ 4 pcs", category: "Bakery", emoji: "🥐" },
  { id: "p10", name: "Atlantic Salmon", vendor: "Coast Catch", price: 14.5, unit: "/ 500g", category: "Meat & Seafood", emoji: "🐟", tag: "Fresh" },
  { id: "p11", name: "Chicken Breast", vendor: "Greenfield Poultry", price: 9.0, unit: "/ kg", category: "Meat & Seafood", emoji: "🍗" },
  { id: "p12", name: "Beef Mince", vendor: "Highland Butcher", price: 11.0, unit: "/ kg", category: "Meat & Seafood", emoji: "🥩" },
  { id: "p13", name: "Jasmine Rice", vendor: "Pantry Plus", price: 12.0, unit: "/ 5 kg", category: "Pantry", emoji: "🍚", tag: "Bestseller" },
  { id: "p14", name: "Olive Oil", vendor: "Mediterra", price: 9.8, unit: "/ 1L", category: "Pantry", emoji: "🫒" },
  { id: "p15", name: "Pasta Penne", vendor: "Mediterra", price: 2.4, unit: "/ 500g", category: "Pantry", emoji: "🍝" },
  { id: "p16", name: "Frozen Berries", vendor: "Arctic Harvest", price: 7.5, unit: "/ 500g", category: "Frozen", emoji: "🍓", tag: "Frozen" },
  { id: "p17", name: "Frozen Pizza", vendor: "Forno Express", price: 6.8, unit: "/ each", category: "Frozen", emoji: "🍕", tag: "Frozen" },
  { id: "p18", name: "Cold Brew Coffee", vendor: "Roast Lab", price: 4.5, unit: "/ 330ml", category: "Beverages", emoji: "☕" },
  { id: "p19", name: "Sparkling Water", vendor: "Clear Springs", price: 1.8, unit: "/ 1L", category: "Beverages", emoji: "💧" },
  { id: "p20", name: "Dish Soap", vendor: "EcoHome", price: 3.5, unit: "/ 750ml", category: "Household", emoji: "🧴" },
  { id: "p21", name: "Laundry Pods", vendor: "EcoHome", price: 12.0, unit: "/ 30 pcs", category: "Household", emoji: "🧺" },
  { id: "p22", name: "Bell Peppers", vendor: "Green Hills Co-op", price: 4.0, unit: "/ 3 pcs", category: "Fresh Produce", emoji: "🫑", tag: "Organic" },
];
