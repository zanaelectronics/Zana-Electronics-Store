import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — ZANA Electronics" },
      { name: "description", content: "Create a ZANA account to order electronics and track deliveries." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useI18n();
  const { register, pendingOrderProduct, addOrder, setPendingOrderProduct } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password) {
      setError("Please fill in all fields");
      return;
    }
    const ok = register(name, email, phone, password);
    if (!ok) {
      setError("Email already registered");
      return;
    }
    if (pendingOrderProduct) {
      addOrder([{ product: pendingOrderProduct, quantity: 1 }]);
      setPendingOrderProduct(null);
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.register")}</CardTitle>
          <CardDescription>Join ZANA to shop electronics in Rwanda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">{t("auth.register")}</Button>
            <p className="text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">{t("auth.login")}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
