import { useState, useRef } from "react";
import { Upload, Loader2, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore, type Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface PendingFile {
  file: File;
  previewUrl: string;
  productId: string;
  status: "pending" | "uploading" | "done" | "error";
}

function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
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
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.9);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

export function BulkImageUploader({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const { updateProduct } = useStore();
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const items: PendingFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      productId: "",
      status: "pending",
    }));
    setPending((prev) => [...prev, ...items]);
  };

  const setProductId = (idx: number, productId: string) => {
    setPending((prev) => prev.map((p, i) => (i === idx ? { ...p, productId } : p)));
  };

  const remove = (idx: number) => {
    setPending((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAll = async () => {
    const ready = pending.filter((p) => p.productId);
    if (ready.length === 0) {
      toast.error("Assign at least one product");
      return;
    }
    setUploading(true);
    let success = 0;
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      if (!item.productId || item.status === "done") continue;
      setPending((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p)));
      try {
        const blob = await cropToSquare(item.file);
        const path = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from("product-images").upload(path, blob, {
          cacheControl: "3600", upsert: false, contentType: "image/jpeg",
        });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        await updateProduct(item.productId, { image: pub.publicUrl });
        setPending((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "done" } : p)));
        success++;
      } catch (err: any) {
        setPending((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "error" } : p)));
        toast.error(`${item.file.name}: ${err.message || "failed"}`);
      }
    }
    setUploading(false);
    toast.success(`Uploaded ${success} image${success === 1 ? "" : "s"}`);
  };

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Bulk image upload</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-8 transition-colors hover:border-primary/50"
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <Upload className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">Drop images here or click to select multiple files</p>
        </div>

        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border p-2">
                <img src={p.previewUrl} alt="" className="h-12 w-12 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.file.name}</p>
                  <select
                    value={p.productId}
                    onChange={(e) => setProductId(idx, e.target.value)}
                    disabled={uploading || p.status === "done"}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                  >
                    <option value="">— Assign to product —</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>{prod.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  {p.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {p.status === "done" && <Check className="h-4 w-4 text-success" />}
                  {p.status === "error" && <X className="h-4 w-4 text-destructive" />}
                  {p.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => remove(idx)}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
            <Button onClick={uploadAll} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : `Upload ${pending.filter((p) => p.productId && p.status !== "done").length} image(s)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
