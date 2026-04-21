import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: "phones" | "laptops" | "accessories" | "audio" | "gaming";
  stock: number;
}

export type OrderStatus = "pending" | "paid" | "delivered";

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  payment_phone?: string | null;
  payment_ref?: string | null;
  items?: OrderItem[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  role: "admin" | "moderator" | "user";
}

interface StoreContextType {
  products: Product[];
  orders: Order[];
  currentUser: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  addOrder: (items: { product: Product; quantity: number }[]) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  processPayment: (orderId: string, phone: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  pendingOrderProduct: Product | null;
  setPendingOrderProduct: (product: Product | null) => void;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  setUserRole: (userId: string, role: "admin" | "moderator" | "user") => Promise<{ error?: string }>;
  allOrders: Order[];
  allProfiles: UserProfile[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrderProduct, setPendingOrderProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at");
    if (data) setProducts(data as Product[]);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items:order_items(*, product:products(*))")
      .order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((o: any) => ({
        ...o,
        items: o.order_items?.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: item.product,
        })),
      }));
      setOrders(mapped);
      setAllOrders(mapped);
    }
  }, [currentUser]);

  const fetchProfile = useCallback(async (userId: string) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (profile) {
      const roleList = (roles ?? []).map((r) => r.role);
      const role = roleList.includes("admin") ? "admin" : roleList.includes("moderator") ? "moderator" : "user";
      const up: UserProfile = {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        phone: profile.phone,
        role: role as "admin" | "moderator" | "user",
      };
      setUserProfile(up);
      return up;
    }
    return null;
  }, []);

  const fetchAllProfiles = useCallback(async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (profiles) {
      const roleMap = new Map<string, "admin" | "moderator" | "user">();
      for (const r of roles ?? []) roleMap.set(r.user_id, r.role as any);
      setAllProfiles(profiles.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name,
        phone: p.phone,
        role: roleMap.get(p.user_id) || "user",
      })));
    }
  }, []);

  // Auth state listener — non-blocking profile fetch so UI renders immediately
  useEffect(() => {
    let mounted = true;

    const handleSession = (user: SupabaseUser | null) => {
      if (!mounted) return;
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        fetchProfile(user.id);
      } else {
        setUserProfile(null);
        setOrders([]);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session?.user ?? null);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchProfile]);

  // Fetch products on mount
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Fetch orders when user changes + subscribe to realtime updates
  useEffect(() => {
    if (!currentUser) return;
    fetchOrders();
    fetchAllProfiles();

    const channel = supabase
      .channel(`orders-${currentUser.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { fetchOrders(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, fetchOrders, fetchAllProfiles]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, phone } },
    });
    if (error) return { error: error.message };
    
    // Update profile with phone after signup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ phone, display_name: name }).eq("user_id", user.id);
    }
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setOrders([]);
    setPendingOrderProduct(null);
  }, []);

  const addOrder = useCallback(async (items: { product: Product; quantity: number }[]) => {
    if (!currentUser) return null;
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: currentUser.id, total, status: "pending" as const })
      .select()
      .single();
    
    if (error || !order) return null;

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      price: i.product.price,
    }));

    await supabase.from("order_items").insert(orderItems);
    await fetchOrders();
    return order as Order;
  }, [currentUser, fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await fetchOrders();
  }, [fetchOrders]);

  const processPayment = useCallback(async (orderId: string, phone: string) => {
    // Initiate MTN MoMo Request-to-Pay via edge function
    const { data: initData, error: initErr } = await supabase.functions.invoke("momo-pay", {
      body: { orderId, phone },
    });
    if (initErr || !initData?.success) {
      console.error("MoMo initiate failed:", initErr, initData);
      return false;
    }

    // Poll status for up to ~60s
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const { data: statusData } = await supabase.functions.invoke("momo-status", {
        body: { orderId },
      });
      if (statusData?.status === "SUCCESSFUL") {
        await fetchOrders();
        return true;
      }
      if (statusData?.status === "FAILED") {
        await fetchOrders();
        return false;
      }
    }
    await fetchOrders();
    return false;
  }, [fetchOrders]);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    await supabase.from("products").insert(product);
    await fetchProducts();
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    await supabase.from("products").update(updates).eq("id", id);
    await fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    await fetchProducts();
  }, [fetchProducts]);

  const setUserRole = useCallback(async (userId: string, role: "admin" | "moderator" | "user") => {
    // Delete existing roles for that user, then insert the new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return { error: error.message };
    await fetchAllProfiles();
    return {};
  }, [fetchAllProfiles]);

  return (
    <StoreContext.Provider
      value={{
        products, orders, currentUser, userProfile, loading,
        login, register, logout, addOrder, updateOrderStatus,
        processPayment, addProduct, updateProduct, deleteProduct,
        pendingOrderProduct, setPendingOrderProduct,
        refreshProducts: fetchProducts, refreshOrders: fetchOrders,
        refreshProfiles: fetchAllProfiles, setUserRole,
        allOrders, allProfiles,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
