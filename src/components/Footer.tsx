import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold">Randy's</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Everything for your kitchen and home — delivered fresh, fast, and fairly priced.
            </p>
          </div>
          <FooterCol title="Shop" links={[["/shop", "All categories"], ["/shop", "Fresh produce"], ["/shop", "Frozen"], ["/shop", "Pantry"]]} />
          <FooterCol title="Partners" links={[["/vendors", "Become a vendor"], ["/delivery", "Drive with us"], ["/", "Wholesale"]]} />
          <FooterCol title="Company" links={[["/", "About"], ["/", "Press"], ["/", "Contact"]]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Randy's Commerce. All rights reserved.</p>
          <p>Built for fresh living.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map(([to, label], i) => (
          <li key={i}>
            <Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
