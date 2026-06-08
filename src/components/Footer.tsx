import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 bg-secondary/40 sm:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo size="lg" className="h-9" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Everything for your kitchen and home — delivered fresh, fast, and fairly priced.
            </p>
          </div>
          <FooterCol title="Shop" links={[["/shop", "All categories"], ["/shop", "Fresh produce"], ["/shop", "Frozen"], ["/shop", "Pantry"]]} />
          <FooterCol title="Partners" links={[["/vendors", "Become a vendor"], ["/delivery", "Drive with us"], ["/", "Wholesale"]]} />
          <FooterCol title="Company" links={[["/", "About"], ["/", "Press"], ["/", "Contact"]]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
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
