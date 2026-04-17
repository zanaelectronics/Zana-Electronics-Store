import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Package, ShoppingCart, Users, CreditCard, Plus, Trash2, CheckCircle2, Clock, Truck, ImagePlus, Link2, Pencil, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore, type Product } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
type ImageMode = "upload" | "url";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image: string;
  category: Product["category"];
  stock: string;
}

const emptyForm: ProductFormData = { name: "", description: "", price: "", image: "", category: "phones", stock: "" };

function ProductForm({
  data, onChange, onSave, onCancel, saveLabel,
}: {
  data: ProductFormData; onChange: (d: ProductFormData) => void; onSave: () => void; onCancel: () => void; saveLabel: string;
}) {
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [imagePreview, setImagePreview] = useState<string>(data.image);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropToSquare = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const target = 600;
        const canvas = document.createElement("canvas");
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))), "image/jpeg", 0.9);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await cropToSquare(file);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from("product-images").upload(path, blob, { cacheControl: "3600", upsert: false, contentType: "image/jpeg" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setImagePreview(pub.publicUrl);
      onChange({ ...data, image: pub.publicUrl });
      toast.success("Image uploaded (cropped to square)");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange({ ...data, image: url });
    setImagePreview(url);
  };

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1"><Label>Name</Label><Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} /></div>
          <div className="space-y-1"><Label>Price (RWF)</Label><Input type="number" value={data.price} onChange={(e) => onChange({ ...data, price: e.target.value })} /></div>
          <div className="space-y-1"><Label>Stock</Label><Input type="number" value={data.stock} onChange={(e) => onChange({ ...data, stock: e.target.value })} /></div>
          <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Input value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} /></div>
          <div className="space-y-1">
            <Label>Category</Label>
            <select value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value as Product["category"] })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="phones">Phones</option><option value="laptops">Laptops</option><option value="accessories">Accessories</option><option value="audio">Audio</option><option value="gaming">Gaming</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Product Image</Label>
          <div className="flex gap-2">
            <button onClick={() => setImageMode("upload")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              <ImagePlus className="h-4 w-4" /> Upload
            </button>
            <button onClick={() => setImageMode("url")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              <Link2 className="h-4 w-4" /> URL
            </button>
          </div>
          {imageMode === "upload" ? (
            <div onClick={() => !uploading && fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              {uploading ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : imagePreview ? <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" /> : <><ImagePlus className="h-10 w-10 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">Click to upload image</p></>}
            </div>
          ) : (
            <div className="space-y-2">
              <Input placeholder="https://example.com/image.jpg" value={data.image} onChange={(e) => handleUrlChange(e.target.value)} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" onError={() => setImagePreview("")} />}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSave}>{saveLabel}</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPage() {
  const { t } = useI18n();
  const { currentUser, userProfile, products, allOrders, allProfiles, addProduct, deleteProduct, updateProduct, updateOrderStatus, loading } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);

  if (!loading && (!currentUser || userProfile?.role !== "admin")) {
    navigate({ to: "/login" });
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    await addProduct({
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price),
      image: formData.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      category: formData.category,
      stock: parseInt(formData.stock) || 10,
    });
    setFormData(emptyForm);
    setShowAddForm(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({ name: p.name, description: p.description || "", price: String(p.price), image: p.image || "", category: p.category, stock: String(p.stock) });
    setShowAddForm(false);
  };

  const handleEdit = async () => {
    if (!editingId || !formData.name || !formData.price) return;
    await updateProduct(editingId, {
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price),
      image: formData.image,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
    });
    setEditingId(null);
    setFormData(emptyForm);
  };

  const tabs: { key: AdminTab; icon: typeof Package; label: string; count: number }[] = [
    { key: "products", icon: Package, label: t("admin.products"), count: products.length },
    { key: "orders", icon: ShoppingCart, label: t("admin.orders"), count: allOrders.length },
    { key: "users", icon: Users, label: t("admin.users"), count: allProfiles.length },
    { key: "payments", icon: CreditCard, label: t("admin.payments"), count: allOrders.filter((o) => o.status === "paid").length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
      <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
        {tabs.map(({ key, icon: Icon, label, count }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            <Icon className="h-4 w-4" /> {label}
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{count}</span>
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("admin.products")}</h2>
            <Button size="sm" onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData(emptyForm); }}>
              <Plus className="mr-1 h-4 w-4" /> {t("admin.addProduct")}
            </Button>
          </div>
          {showAddForm && <ProductForm data={formData} onChange={setFormData} onSave={handleAdd} onCancel={() => { setShowAddForm(false); setFormData(emptyForm); }} saveLabel={t("admin.addProduct")} />}
          {editingId && <ProductForm data={formData} onChange={setFormData} onSave={handleEdit} onCancel={() => { setEditingId(null); setFormData(emptyForm); }} saveLabel={t("common.save")} />}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={`border-b hover:bg-muted/50 ${editingId === p.id ? "bg-primary/5" : ""}`}>
                    <td className="p-3"><div className="flex items-center gap-3"><img src={p.image || ""} alt={p.name} className="h-10 w-10 rounded-md object-cover" /><span className="font-medium">{p.name}</span></div></td>
                    <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="p-3">{p.price.toLocaleString()} RWF</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(p)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 space-y-4">
          {allOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No orders yet</div>
          ) : allOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm">#{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className={order.status === "pending" ? "border-warning/30 text-warning-foreground" : order.status === "paid" ? "border-success/30 text-success" : "border-primary/30 text-primary"}>
                  {order.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {order.status === "paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {order.status === "delivered" && <Truck className="mr-1 h-3 w-3" />}
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                {order.items?.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm"><span>{item.product?.name || "Product"} × {item.quantity}</span><span>{(item.price * item.quantity).toLocaleString()} RWF</span></div>
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

      {tab === "users" && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Name</th><th className="p-3">Phone</th></tr></thead>
            <tbody>
              {allProfiles.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{u.display_name || "—"}</td>
                  <td className="p-3">{u.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payments" && (
        <div className="mt-6 space-y-4">
          {allOrders.filter((o) => o.payment_ref).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No payments recorded yet</div>
          ) : allOrders.filter((o) => o.payment_ref).map((order) => (
            <Card key={order.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">Phone: {order.payment_phone} · Ref: {order.payment_ref}</p>
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
