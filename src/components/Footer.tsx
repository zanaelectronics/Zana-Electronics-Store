import { useI18n } from "@/lib/i18n";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">Z</div>
              <span className="text-lg font-bold">ZANA</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("footer.about")} — Rwanda's trusted electronics store.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">{t("footer.contact")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@zana.rw</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +250 780 000 000</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kigali, Rwanda</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">{t("footer.delivery")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4" /> Kigali: 1-2 days</li>
              <li>Provinces: 2-5 days</li>
              <li>Free delivery over 500,000 RWF</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Payment</h3>
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-lg bg-warning/20 px-3 py-1.5 text-xs font-bold text-warning-foreground">
                MTN MoMo
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Secure mobile money payments</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ZANA Electronics. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
