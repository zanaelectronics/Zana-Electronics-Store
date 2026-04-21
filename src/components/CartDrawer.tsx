import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, totalPrice, totalItems, isOpen, setOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser, addOrder, setPendingOrderProduct } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!currentUser) {
      setOpen(false);
      setPendingOrderProduct(items[0].product);
      navigate({ to: "/login" });
      return;
    }
    const order = await addOrder(items.map((i) => ({ product: i.product, quantity: i.quantity })));
    if (order) {
      clearCart();
      setOpen(false);
      toast.success(t("cart.orderPlaced"));
      navigate({ to: "/dashboard" });
    } else {
      toast.error(t("common.error"));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> {t("nav.cart")} ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
            <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
            <p>{t("cart.empty")}</p>
            <Button className="mt-4" onClick={() => { setOpen(false); navigate({ to: "/products" }); }}>
              {t("cart.browse")}
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6 py-2">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3 rounded-lg border p-3">
                    <img
                      src={item.product.image || ""}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight line-clamp-2">{item.product.name}</p>
                      <p className="text-sm text-primary font-semibold">
                        {item.product.price.toLocaleString()} {t("common.rwf")}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between font-semibold">
                <span>{t("payment.total")}</span>
                <span className="text-lg text-primary">{totalPrice.toLocaleString()} {t("common.rwf")}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                {t("cart.checkout")}
              </Button>
              <Button variant="ghost" className="w-full" size="sm" onClick={clearCart}>
                {t("cart.clear")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}