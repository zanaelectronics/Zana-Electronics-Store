import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { SiteSettingsProvider } from "@/lib/site-settings";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HelpChat } from "@/components/HelpChat";
import { CartDrawer } from "@/components/CartDrawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ZANA — Electronics Store | Rwanda" },
      { name: "description", content: "Shop the latest electronics with fast delivery across Rwanda. Pay securely with MTN MoMo." },
      { property: "og:title", content: "ZANA — Electronics Store | Rwanda" },
      { property: "og:description", content: "Shop the latest electronics with fast delivery across Rwanda. Pay securely with MTN MoMo." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "ZANA — Electronics Store | Rwanda" },
      { name: "twitter:description", content: "Shop the latest electronics with fast delivery across Rwanda. Pay securely with MTN MoMo." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/OlId9ebnzRYpotpCkJNHbQu4QM63/social-images/social-1776760374532-zana_logo.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/OlId9ebnzRYpotpCkJNHbQu4QM63/social-images/social-1776760374532-zana_logo.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <StoreProvider>
        <SiteSettingsProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
              <HelpChat />
              <CartDrawer />
            </div>
          </CartProvider>
        </SiteSettingsProvider>
      </StoreProvider>
    </I18nProvider>
  );
}
