import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — ZANA Electronics" },
      { name: "description", content: "Browse our full catalog of phones, laptops, audio, gaming, and accessories." },
      { property: "og:title", content: "Products — ZANA Electronics" },
      { property: "og:description", content: "Browse our full catalog of electronics." },
    ],
  }),
  component: ProductsPage,
});

const categories = ["all", "phones", "laptops", "accessories", "audio", "gaming"] as const;

function ProductsPage() {
  const { t } = useI18n();
  const { products } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{t("products.title")}</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("products.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t(`products.category.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          No products found matching your criteria.
        </div>
      )}
    </div>
  );
}
