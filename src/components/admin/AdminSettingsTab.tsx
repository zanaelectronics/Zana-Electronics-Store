import { useState, useEffect } from "react";
import { useSiteSettings } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function AdminSettingsTab() {
  const { settings, update } = useSiteSettings();
  const [contact, setContact] = useState(settings.contact);
  const [delivery, setDelivery] = useState(settings.delivery);
  const [payment, setPayment] = useState(settings.payment);
  const [hero, setHero] = useState(settings.hero);
  const [saving, setSaving] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => { setContact(settings.contact); }, [settings.contact]);
  useEffect(() => { setDelivery(settings.delivery); }, [settings.delivery]);
  useEffect(() => { setPayment(settings.payment); }, [settings.payment]);
  useEffect(() => { setHero(settings.hero); }, [settings.hero]);

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPwd(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const save = async (key: "contact" | "delivery" | "payment" | "hero", value: any) => {
    setSaving(key);
    const { error } = await update(key, value);
    setSaving(null);
    if (error) toast.error(error);
    else toast.success("Saved");
  };

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Contact info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Email</Label><Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <Button size="sm" onClick={() => save("contact", contact)} disabled={saving === "contact"}>
            {saving === "contact" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save contact
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Delivery</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Kigali</Label><Input value={delivery.kigali} onChange={(e) => setDelivery({ ...delivery, kigali: e.target.value })} /></div>
          <div><Label>Provinces</Label><Input value={delivery.provinces} onChange={(e) => setDelivery({ ...delivery, provinces: e.target.value })} /></div>
          <div><Label>Free delivery threshold (RWF)</Label><Input type="number" value={delivery.freeThreshold} onChange={(e) => setDelivery({ ...delivery, freeThreshold: parseInt(e.target.value) || 0 })} /></div>
          <Button size="sm" onClick={() => save("delivery", delivery)} disabled={saving === "delivery"}>
            {saving === "delivery" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save delivery
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Provider name</Label><Input value={payment.provider} onChange={(e) => setPayment({ ...payment, provider: e.target.value })} /></div>
          <div><Label>MoMo code / number</Label><Input value={payment.momoNumber} onChange={(e) => setPayment({ ...payment, momoNumber: e.target.value })} /></div>
          <Button size="sm" onClick={() => save("payment", payment)} disabled={saving === "payment"}>
            {saving === "payment" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Homepage hero</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input id="useDefault" type="checkbox" checked={hero.useDefaultImage} onChange={(e) => setHero({ ...hero, useDefaultImage: e.target.checked })} />
            <Label htmlFor="useDefault" className="cursor-pointer">Use default hero image</Label>
          </div>
          <div>
            <Label>Custom hero image URL</Label>
            <Input value={hero.image} placeholder="https://..." onChange={(e) => setHero({ ...hero, image: e.target.value })} disabled={hero.useDefaultImage} />
          </div>
          {hero.image && !hero.useDefaultImage && (
            <img src={hero.image} alt="Hero preview" className="h-32 w-full rounded-lg object-cover" />
          )}
          <Button size="sm" onClick={() => save("hero", hero)} disabled={saving === "hero"}>
            {saving === "hero" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save hero
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>New password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" /></div>
          <div><Label>Confirm new password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /></div>
          <Button size="sm" onClick={changePassword} disabled={changingPwd || !newPassword || !confirmPassword}>
            {changingPwd ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <KeyRound className="mr-1 h-4 w-4" />}
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
