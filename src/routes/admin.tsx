import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Package, ShoppingCart, Users, CreditCard, Plus, Trash2, CheckCircle2, Clock, Truck, Edit } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore, type Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ZANA Electronics" },
      { name: "description", content: "Admin dashboard for managing ZANA store." },
    ],
  }),
  component: AdminPage,
});

type AdminTab = "products" | "orders" | "users" | "payments";

function AdminPage() {
  const { t } = useI18n();
  const { currentUser, products, orders, users, addProduct, deleteProduct, updateOrderStatus } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", image: "", category: "phones" as Product["category"], stock: "" });

  if (!currentUser || currentUser.role !== "admin") {
    navigate({ to: "/login" });
    return null;
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    addProduct({
      name: newProduct.name,
      description: newProduct.description,
      price: parseInt(newProduct.price),
      image: newProduct.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      category: newProduct.category,
      stock: parseInt(newProduct.stock) || 10,
    });
    setNewProduct({ name: "", description: "", price: "", image: "", category: "phones", stock: "" });
    setShowAddForm(false);
  };

  const tabs: { key: AdminTab; icon: typeof Package; label: string; count: number }[] = [
    { key: "products", icon: Package, label: t("admin.products"), count: products.length },
    { key: "orders", icon: ShoppingCart, label: t("admin.orders"), count: orders.length },
    { key: "users", icon: Users, label: t("admin.users"), count: users.length },
    { key: "payments", icon: CreditCard, label: t("admin.payments"), count: orders.filter((o) => o.status === "paid").length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{t("admin.title")}</h1>

      {/* Tab nav */}
      <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
        {tabs.map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{count}</span>
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("admin.products")}</h2>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-1 h-4 w-4" /> {t("admin.addProduct")}
            </Button>
          </div>

          {showAddForm && (
            <Card className="mt-4">
              <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1"><Label>Name</Label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Price (RWF)</Label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} /></div>
                <div className="space-y-1"><Label>Stock</Label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} /></div>
                <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /></div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product["category"] })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="phones">Phones</option><option value="laptops">Laptops</option><option value="accessories">Accessories</option><option value="audio">Audio</option><option value="gaming">Gaming</option>
                  </select>
                </div>
                <div className="flex items-end gap-2 sm:col-span-3">
                  <Button onClick={handleAddProduct}>{t("common.save")}</Button>
                  <Button variant="ghost" onClick={() => setShowAddForm(false)}>{t("common.cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="p-3">{p.price.toLocaleString()} RWF</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No orders yet</div>
          ) : orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">{order.id}</CardTitle>
                  <p className="text-xs text-muted-foreground">User: {order.userId} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className={order.status === "pending" ? "border-warning/30 text-warning-foreground" : order.status === "paid" ? "border-success/30 text-success" : "border-primary/30 text-primary"}>
                  {order.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {order.status === "paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {order.status === "delivered" && <Truck className="mr-1 h-3 w-3" />}
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                {order.products.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm"><span>{product.name} × {quantity}</span><span>{(product.price * quantity).toLocaleString()} RWF</span></div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="font-bold">{order.total.toLocaleString()} RWF</span>
                  {order.status === "paid" && (
                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "delivered")}>
                      <Truck className="mr-1 h-4 w-4" /> {t("admin.markDelivered")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Role</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <div className="mt-6 space-y-4">
          {orders.filter((o) => o.paymentRef).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No payments recorded yet</div>
          ) : orders.filter((o) => o.paymentRef).map((order) => (
            <Card key={order.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">Phone: {order.paymentPhone} • Ref: {order.paymentRef}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.total.toLocaleString()} RWF</p>
                  <Badge variant="outline" className="border-success/30 text-success">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> {t("admin.paymentVerified")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
