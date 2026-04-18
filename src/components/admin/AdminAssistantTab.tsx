import { useState, useEffect } from "react";
import { useSiteSettings } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AdminAssistantTab() {
  const { settings, update } = useSiteSettings();
  const [prompt, setPrompt] = useState(settings.ai.systemPrompt);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPrompt(settings.ai.systemPrompt); }, [settings.ai.systemPrompt]);

  const save = async () => {
    setSaving(true);
    const { error } = await update("ai", { systemPrompt: prompt });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("AI instructions updated. The assistant will use them on the next message.");
  };

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" /> ZANA AI Assistant instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>System prompt (the AI's personality and rules)</Label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-input bg-transparent p-3 text-sm font-mono"
            placeholder="You are ZANA Assistant..."
          />
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save instructions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Auto-context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The assistant automatically receives:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Live product catalog (name, price, stock, category)</li>
            <li>Current contact details</li>
            <li>Delivery info</li>
            <li>Payment provider & number</li>
          </ul>
          <p className="pt-2">Update those in <strong>Site Settings</strong> and the AI picks them up on the next chat — no redeploy needed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
