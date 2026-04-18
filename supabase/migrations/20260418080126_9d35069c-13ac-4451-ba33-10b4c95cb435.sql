-- Site settings: single-row key/value JSON store
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all roles and manage them
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed defaults
INSERT INTO public.site_settings (key, value) VALUES
  ('contact', '{"email":"info@zana.rw","phone":"+250 780 000 000","address":"Kigali, Rwanda"}'::jsonb),
  ('delivery', '{"kigali":"Same-day delivery in Kigali","provinces":"2-3 days to provinces","freeThreshold":100000}'::jsonb),
  ('payment', '{"momoNumber":"*182*8*1*ZANA#","provider":"MTN MoMo Pay"}'::jsonb),
  ('hero', '{"image":"","useDefaultImage":true}'::jsonb),
  ('ai', '{"systemPrompt":"You are ZANA Assistant, a friendly helper for ZANA Electronics in Rwanda. Help customers find products, answer questions about delivery, payment via MTN MoMo, and our store. Be concise and warm."}'::jsonb)
ON CONFLICT (key) DO NOTHING;