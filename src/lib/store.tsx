import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "phones" | "laptops" | "accessories" | "audio" | "gaming";
  stock: number;
}

export type OrderStatus = "pending" | "paid" | "delivered";

export interface Order {
  id: string;
  userId: string;
  products: { product: Product; quantity: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentPhone?: string;
  paymentRef?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1", name: "Samsung Galaxy S24 Ultra", description: "Latest Samsung flagship with AI features, 200MP camera, and S Pen",
    price: 850000, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop", category: "phones", stock: 15,
  },
  {
    id: "2", name: "iPhone 15 Pro Max", description: "Apple's most powerful iPhone with A17 Pro chip and titanium design",
    price: 950000, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop", category: "phones", stock: 10,
  },
  {
    id: "3", name: "MacBook Air M3", description: "Ultra-thin laptop with Apple M3 chip, 18-hour battery life",
    price: 1200000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", category: "laptops", stock: 8,
  },
  {
    id: "4", name: "HP Pavilion 15", description: "Versatile laptop for work and entertainment with Intel Core i7",
    price: 680000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", category: "laptops", stock: 12,
  },
  {
    id: "5", name: "AirPods Pro 2", description: "Premium wireless earbuds with active noise cancellation",
    price: 180000, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop", category: "audio", stock: 25,
  },
  {
    id: "6", name: "Sony WH-1000XM5", description: "Industry-leading noise cancelling headphones",
    price: 280000, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop", category: "audio", stock: 18,
  },
  {
    id: "7", name: "USB-C Hub 7-in-1", description: "Multiport adapter with HDMI, USB 3.0, SD card reader",
    price: 35000, image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e8?w=400&h=400&fit=crop", category: "accessories", stock: 40,
  },
  {
    id: "8", name: "Wireless Charger Pad", description: "Fast 15W wireless charging for all Qi-compatible devices",
    price: 25000, image: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=400&h=400&fit=crop", category: "accessories", stock: 30,
  },
  {
    id: "9", name: "PlayStation 5", description: "Next-gen gaming console with ultra-high speed SSD",
    price: 450000, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", category: "gaming", stock: 5,
  },
  {
    id: "10", name: "Nintendo Switch OLED", description: "Portable gaming with vibrant 7-inch OLED screen",
    price: 280000, image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", category: "gaming", stock: 10,
  },
  {
    id: "11", name: "Samsung 4K Smart TV 55\"", description: "Crystal UHD display with smart features and HDR support",
    price: 520000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop", category: "accessories", stock: 7,
  },
  {
    id: "12", name: "JBL Flip 6 Speaker", description: "Portable Bluetooth speaker with powerful bass and IP67 waterproof",
    price: 95000, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", category: "audio", stock: 20,
  },
];

interface StoreContextType {
  products: Product[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;
  addOrder: (products: { product: Product; quantity: number }[]) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  processPayment: (orderId: string, phone: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  pendingOrderProduct: Product | null;
  setPendingOrderProduct: (product: Product | null) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: "admin-1", name: "Admin", email: "admin@zana.rw", phone: "0780000000", role: "admin" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingOrderProduct, setPendingOrderProduct] = useState<Product | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback((name: string, email: string, phone: string, _password: string) => {
    if (users.some((u) => u.email === email)) return false;
    const newUser: User = { id: `user-${Date.now()}`, name, email, phone, role: "user" };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPendingOrderProduct(null);
  }, []);

  const addOrder = useCallback((items: { product: Product; quantity: number }[]) => {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: currentUser!.id,
      products: items,
      total: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [...prev, order]);
    return order;
  }, [currentUser]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }, []);

  const processPayment = useCallback(async (orderId: string, phone: string) => {
    await new Promise((r) => setTimeout(r, 3000));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "paid" as OrderStatus, paymentPhone: phone, paymentRef: `MOMO-${Date.now()}` } : o
      )
    );
    return true;
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...product, id: `prod-${Date.now()}` }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products, orders, users, currentUser,
        login, register, logout, addOrder, updateOrderStatus,
        processPayment, addProduct, updateProduct, deleteProduct,
        pendingOrderProduct, setPendingOrderProduct,
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
