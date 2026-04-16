import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Menu, ShoppingBag, User, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import { useI18n, type Language } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function Header() {
  const { t, language, setLanguage, languages } = useI18n();
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            Z
          </div>
          <span className="text-xl font-bold tracking-tight">ZANA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground bg-secondary" }}>
            {t("nav.home")}
          </Link>
          <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground bg-secondary" }}>
            {t("nav.products")}
          </Link>
          {currentUser && (
            <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground bg-secondary" }}>
              {t("nav.dashboard")}
            </Link>
          )}
          {currentUser?.role === "admin" && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground bg-secondary" }}>
              {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setLangOpen(!langOpen)} className="text-muted-foreground">
              <Globe className="h-4 w-4" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border bg-popover p-1 shadow-lg">
                {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code); setLangOpen(false); }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${language === code ? "bg-accent font-medium" : ""}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-muted-foreground">{currentUser.name}</span>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }}>
                <LogOut className="mr-1 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                {t("nav.login")}
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/register" })}>
                {t("nav.register")}
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              <ShoppingBag className="h-4 w-4" /> {t("nav.home")}
            </Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              <ShoppingBag className="h-4 w-4" /> {t("nav.products")}
            </Link>
            {currentUser && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
              </Link>
            )}
            {currentUser?.role === "admin" && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                <Shield className="h-4 w-4" /> {t("nav.admin")}
              </Link>
            )}
            {currentUser ? (
              <button onClick={() => { logout(); navigate({ to: "/" }); setMobileOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                  <User className="h-4 w-4" /> {t("nav.login")}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                  <User className="h-4 w-4" /> {t("nav.register")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
