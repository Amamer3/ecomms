import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/api";
import { categoryEmoji } from "@/lib/catalog-display";
import { CatalogDataTable, CatalogPageHeader } from "@/components/catalog/catalog-ui";

export const Route = createFileRoute("/catalog/categories")({
  component: CatalogCategoriesPage,
  head: () => ({ meta: [{ title: "Categories — GoMarket" }] }),
});

function CatalogCategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  return (
    <div>
      <CatalogPageHeader
        title="Marketplace categories"
        description="Product groupings used across stores — perishable, frozen, pantry, and more."
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading categories…</p>
      ) : (
        <CatalogDataTable
          title={`${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
          headers={["Name", "Slug", "Type", "Sort"]}
          rows={categories.map((c) => [
            <span key={c.id}>
              {categoryEmoji(c.type)} {c.name}
            </span>,
            c.slug,
            c.type,
            String(c.sortOrder),
          ])}
        />
      )}
    </div>
  );
}
