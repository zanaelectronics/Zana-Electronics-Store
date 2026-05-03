import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Package, CreditCard, Clock, CheckCircle2, Truck, Phone, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ZANA Electronics" },
      { name: "description", content: "View your orders and manage payments." },
    ],
  }),
  component: DashboardPage,
});

const statusConfig = {
  pending: { icon: Clock, label: "dashboard.pending", color: "bg-warning/10 text-warning-foreground border-warning/30" },
  paid: { icon: CheckCircle2, label: "dashboard.paid", color: "bg-success/10 text-success-foreground border-success/30" },
  delivered: { icon: Truck, label: "dashboard.delivered", color: "bg-primary/10 text-primary border-primary/30" },
};

function DashboardPage() {
  const { t } = useI18n();
  const { currentUser, userProfile, orders, processPayment, loading } = useStore();
  const navigate = useNavigate();
  const [payingOrder, setPayingOrder] = useState<string | null>(null);
  const [momoPhone, setMomoPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  if (!loading && !currentUser) {
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

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const paidOrders = orders.filter((o) => o.status === "paid");
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const handlePay = async (orderId: string) => {
    if (!momoPhone || momoPhone.length < 10) return;
    setProcessing(true);
    await processPayment(orderId, momoPhone);
    setProcessing(false);
    setPayingOrder(null);
    setPaymentSuccess(orderId);
    setMomoPhone("");
    setTimeout(() => setPaymentSuccess(null), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="mt-1 text-muted-foreground">Welcome, {userProfile?.display_name || currentUser?.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning-foreground" /></div>
            <div><p className="text-2xl font-bold">{pendingOrders.length}</p><p className="text-xs text-muted-foreground">{t("dashboard.pending")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{paidOrders.length}</p><p className="text-xs text-muted-foreground">{t("dashboard.paid")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Truck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{deliveredOrders.length}</p><p className="text-xs text-muted-foreground">{t("dashboard.delivered")}</p></div>
          </CardContent>
        </Card>
      </div>

      {paymentSuccess && (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success-foreground">
          <CheckCircle2 className="mb-1 inline-block h-4 w-4" /> {t("payment.success")}
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">{t("dashboard.orders")}</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">{t("dashboard.noOrders")}</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/products" })}>{t("hero.cta")}</Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            return (
              <Card key={order.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Order #{order.id.slice(0, 8)}</CardTitle>
                  <Badge variant="outline" className={cfg.color}>
                    <StatusIcon className="mr-1 h-3 w-3" /> {t(cfg.label)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.product_id} className="flex items-center justify-between text-sm">
                        <span>{item.product?.name || "Product"} × {item.quantity}</span>
                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()} RWF</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2 font-bold">
                      <span>{t("payment.total")}</span>
                      <span>{order.total.toLocaleString()} RWF</span>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <>
                      {payingOrder === order.id ? (
                        <div className="mt-4 space-y-3 rounded-lg border bg-muted/50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <CreditCard className="h-4 w-4" /> {t("payment.momo")}
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="07XXXXXXXX" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} className="pl-9" disabled={processing} />
                            </div>
                            <Button onClick={() => handlePay(order.id)} disabled={processing}>
                              {processing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> {t("payment.processing")}</> : t("payment.pay")}
                            </Button>
                          </div>
                          {processing && <p className="text-xs text-muted-foreground">{t("payment.prompt")}</p>}
                        </div>
                      ) : (
                        <Button className="mt-4 w-full" onClick={() => setPayingOrder(order.id)}>
                          <CreditCard className="mr-2 h-4 w-4" /> {t("dashboard.payNow")}
                        </Button>
                      )}
                    </>
                  )}

                  {order.payment_ref && (
                    <p className="mt-2 text-xs text-muted-foreground">Payment ref: {order.payment_ref}</p>
                  )}

                  {(order.courier || order.tracking_note || order.delivered_at) && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">
                      <p className="mb-1 flex items-center gap-1 font-semibold">
                        <Truck className="h-4 w-4" /> {t("delivery.tracking")}
                      </p>
                      {order.courier && <p className="text-xs"><span className="text-muted-foreground">{t("delivery.courier")}:</span> {order.courier}</p>}
                      {order.tracking_note && <p className="text-xs"><span className="text-muted-foreground">{t("delivery.note")}:</span> {order.tracking_note}</p>}
                      {order.delivered_at && <p className="text-xs"><span className="text-muted-foreground">{t("delivery.deliveredOn")}:</span> {new Date(order.delivered_at).toLocaleDateString()}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
