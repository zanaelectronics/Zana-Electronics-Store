import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore, type Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { currentUser, setPendingOrderProduct, addOrder } = useStore();
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!currentUser) {
      setPendingOrderProduct(product);
      navigate({ to: "/login" });
      return;
    }
    await addOrder([{ product, quantity: 1 }]);
    navigate({ to: "/dashboard" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {product.price.toLocaleString()} <span className="text-xs">{t("common.rwf")}</span>
          </span>
          <Button size="sm" onClick={handleOrder} className="gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            {t("products.order")}
          </Button>
        </div>
        {product.stock < 5 && (
          <p className="mt-2 text-xs text-destructive">Only {product.stock} left in stock!</p>
        )}
      </div>
    </motion.div>
  );
}
