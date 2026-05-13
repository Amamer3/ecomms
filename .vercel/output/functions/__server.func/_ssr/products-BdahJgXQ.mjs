import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as formatGhs } from "./format-money-D3U6Lvgy.mjs";
import { b as useCart } from "./router-Da0tdzn1.mjs";
import { P as Plus } from "../_libs/lucide-react.mjs";
const tagStyles = {
  Fresh: "bg-primary/10 text-primary",
  Organic: "bg-primary/15 text-primary",
  Frozen: "bg-sky-500/10 text-sky-700",
  Bestseller: "bg-accent/20 text-accent-foreground"
};
function ProductCard({ product }) {
  const { add } = useCart();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-7xl transition-transform duration-500 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: product.emoji }) }),
      product.tag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagStyles[product.tag]}`, children: product.tag })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: product.vendor }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-0.5 text-base font-semibold leading-tight text-foreground", children: product.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-end justify-between pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-foreground", children: formatGhs(product.price) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: product.unit })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => add(product),
            "aria-label": `Add ${product.name} to cart`,
            className: "grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-105 hover:shadow-[var(--shadow-glow)] active:scale-95",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" })
          }
        )
      ] })
    ] })
  ] });
}
const categories = [
  { name: "Fresh Produce", emoji: "🥬", blurb: "Farm-direct fruits & veggies" },
  { name: "Meat & Seafood", emoji: "🥩", blurb: "Cuts & catches of the day" },
  { name: "Dairy & Eggs", emoji: "🥚", blurb: "Cold-chain fresh" },
  { name: "Bakery", emoji: "🥖", blurb: "Baked this morning" },
  { name: "Pantry", emoji: "🥫", blurb: "Everyday essentials" },
  { name: "Frozen", emoji: "🧊", blurb: "Snap-frozen goodness" },
  { name: "Beverages", emoji: "🥤", blurb: "Sip and refresh" },
  { name: "Household", emoji: "🧴", blurb: "Care for your home" }
];
const products = [
  { id: "p1", name: "Vine Tomatoes", vendor: "Akwa Farms", price: 4.5, unit: "/ kg", category: "Fresh Produce", emoji: "🍅", tag: "Organic" },
  { id: "p2", name: "Hass Avocados", vendor: "Green Hills Co-op", price: 6, unit: "/ 4 pcs", category: "Fresh Produce", emoji: "🥑", tag: "Fresh" },
  { id: "p3", name: "Baby Spinach", vendor: "Akwa Farms", price: 3.2, unit: "/ bunch", category: "Fresh Produce", emoji: "🥬" },
  { id: "p4", name: "Sweet Bananas", vendor: "Tropic Growers", price: 2.8, unit: "/ kg", category: "Fresh Produce", emoji: "🍌", tag: "Bestseller" },
  { id: "p5", name: "Free-range Eggs", vendor: "Sunrise Coop", price: 5.5, unit: "/ dozen", category: "Dairy & Eggs", emoji: "🥚", tag: "Organic" },
  { id: "p6", name: "Whole Milk", vendor: "Pure Dairy", price: 3, unit: "/ litre", category: "Dairy & Eggs", emoji: "🥛" },
  { id: "p7", name: "Greek Yogurt", vendor: "Pure Dairy", price: 4.2, unit: "/ 500g", category: "Dairy & Eggs", emoji: "🍶" },
  { id: "p8", name: "Sourdough Loaf", vendor: "Hearth Bakery", price: 5, unit: "/ loaf", category: "Bakery", emoji: "🍞", tag: "Fresh" },
  { id: "p9", name: "Buttery Croissants", vendor: "Hearth Bakery", price: 6.4, unit: "/ 4 pcs", category: "Bakery", emoji: "🥐" },
  { id: "p10", name: "Atlantic Salmon", vendor: "Coast Catch", price: 14.5, unit: "/ 500g", category: "Meat & Seafood", emoji: "🐟", tag: "Fresh" },
  { id: "p11", name: "Chicken Breast", vendor: "Greenfield Poultry", price: 9, unit: "/ kg", category: "Meat & Seafood", emoji: "🍗" },
  { id: "p12", name: "Beef Mince", vendor: "Highland Butcher", price: 11, unit: "/ kg", category: "Meat & Seafood", emoji: "🥩" },
  { id: "p13", name: "Jasmine Rice", vendor: "Pantry Plus", price: 12, unit: "/ 5 kg", category: "Pantry", emoji: "🍚", tag: "Bestseller" },
  { id: "p14", name: "Olive Oil", vendor: "Mediterra", price: 9.8, unit: "/ 1L", category: "Pantry", emoji: "🫒" },
  { id: "p15", name: "Pasta Penne", vendor: "Mediterra", price: 2.4, unit: "/ 500g", category: "Pantry", emoji: "🍝" },
  { id: "p16", name: "Frozen Berries", vendor: "Arctic Harvest", price: 7.5, unit: "/ 500g", category: "Frozen", emoji: "🍓", tag: "Frozen" },
  { id: "p17", name: "Frozen Pizza", vendor: "Forno Express", price: 6.8, unit: "/ each", category: "Frozen", emoji: "🍕", tag: "Frozen" },
  { id: "p18", name: "Cold Brew Coffee", vendor: "Roast Lab", price: 4.5, unit: "/ 330ml", category: "Beverages", emoji: "☕" },
  { id: "p19", name: "Sparkling Water", vendor: "Clear Springs", price: 1.8, unit: "/ 1L", category: "Beverages", emoji: "💧" },
  { id: "p20", name: "Dish Soap", vendor: "EcoHome", price: 3.5, unit: "/ 750ml", category: "Household", emoji: "🧴" },
  { id: "p21", name: "Laundry Pods", vendor: "EcoHome", price: 12, unit: "/ 30 pcs", category: "Household", emoji: "🧺" },
  { id: "p22", name: "Bell Peppers", vendor: "Green Hills Co-op", price: 4, unit: "/ 3 pcs", category: "Fresh Produce", emoji: "🫑", tag: "Organic" }
];
export {
  ProductCard as P,
  categories as c,
  products as p
};
