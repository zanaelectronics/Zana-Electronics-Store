import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "rw" | "sw" | "zh" | "fr";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home", "nav.products": "Products", "nav.login": "Login", "nav.register": "Register",
    "nav.dashboard": "Dashboard", "nav.admin": "Admin", "nav.logout": "Logout", "nav.cart": "Cart",
    "hero.title": "Zana Electronics Store",
    "hero.subtitle": "Discover the latest gadgets and electronics with fast delivery across Rwanda",
    "hero.cta": "Shop Now",
    "products.title": "Our Products", "products.order": "Order Now", "products.price": "Price",
    "products.search": "Search products...", "products.category.all": "All",
    "products.category.phones": "Phones", "products.category.laptops": "Laptops",
    "products.category.accessories": "Accessories", "products.category.audio": "Audio", "products.category.gaming": "Gaming",
    "products.category.home": "Home", "products.category.kitchen": "Kitchen",
    "products.addToCart": "Add to cart",
    "cart.empty": "Your cart is empty",
    "cart.browse": "Browse products",
    "cart.checkout": "Checkout",
    "cart.clear": "Clear cart",
    "cart.orderPlaced": "Order placed!",
    "delivery.tracking": "Delivery tracking",
    "delivery.courier": "Courier",
    "delivery.note": "Tracking note",
    "delivery.update": "Update tracking",
    "delivery.deliveredOn": "Delivered on",
    "auth.login": "Login", "auth.register": "Create Account", "auth.email": "Email",
    "auth.password": "Password", "auth.name": "Full Name", "auth.phone": "Phone Number",
    "auth.noAccount": "Don't have an account?", "auth.hasAccount": "Already have an account?",
    "auth.loginToContinue": "Login to continue your order",
    "dashboard.title": "My Dashboard", "dashboard.orders": "My Orders",
    "dashboard.pending": "Pending", "dashboard.paid": "Paid", "dashboard.delivered": "Delivered",
    "dashboard.payNow": "Pay Now", "dashboard.orderHistory": "Order History",
    "dashboard.noOrders": "No orders yet", "dashboard.trackOrder": "Track Order",
    "payment.title": "Payment", "payment.momo": "MTN MoMo Pay",
    "payment.enterPhone": "Enter MTN Mobile Money number", "payment.pay": "Pay Now",
    "payment.processing": "Processing payment...", "payment.success": "Payment successful!",
    "payment.prompt": "Check your phone for the payment prompt", "payment.total": "Total",
    "admin.title": "Admin Dashboard", "admin.products": "Products", "admin.orders": "Orders",
    "admin.users": "Users", "admin.payments": "Payments", "admin.settings": "Site Settings",
    "admin.assistant": "AI Assistant", "admin.addProduct": "Add Product", "admin.editProduct": "Edit Product",
    "admin.deleteProduct": "Delete", "admin.orderStatus": "Order Status", "admin.deliveryStatus": "Delivery Status",
    "admin.markDelivered": "Mark Delivered", "admin.paymentVerified": "Verified", "admin.paymentPending": "Pending",
    "footer.rights": "All rights reserved", "footer.contact": "Contact Us",
    "footer.about": "About ZANA", "footer.delivery": "Delivery Info",
    "common.loading": "Loading...", "common.error": "Something went wrong",
    "common.save": "Save", "common.cancel": "Cancel", "common.delete": "Delete", "common.edit": "Edit", "common.rwf": "RWF",
  },
  rw: {
    "nav.home": "Ahabanza", "nav.products": "Ibicuruzwa", "nav.login": "Injira", "nav.register": "Iyandikishe",
    "nav.dashboard": "Ibikureba", "nav.admin": "Ubutegetsi", "nav.logout": "Sohoka", "nav.cart": "Agasanduku",
    "hero.title": "Iduka rya ZANA Electronics",
    "hero.subtitle": "Shakisha ibyuma bishya kandi bikwiye bitwara byihuse mu Rwanda hose",
    "hero.cta": "Gura Nonaha",
    "products.title": "Ibicuruzwa Byacu", "products.order": "Tegura", "products.price": "Igiciro",
    "products.search": "Shakisha ibicuruzwa...", "products.category.all": "Byose",
    "products.category.phones": "Telefoni", "products.category.laptops": "Mudasobwa",
    "products.category.accessories": "Ibikoresho", "products.category.audio": "Amajwi", "products.category.gaming": "Imikino",
    "auth.login": "Injira", "auth.register": "Fungura Konti", "auth.email": "Imeyili",
    "auth.password": "Ijambo ry'ibanga", "auth.name": "Amazina Yombi", "auth.phone": "Nomero ya Telefoni",
    "auth.noAccount": "Nta konti ufite?", "auth.hasAccount": "Usanzwe ufite konti?",
    "auth.loginToContinue": "Injira kugirango ukomeze gutegura",
    "dashboard.title": "Ibikureba", "dashboard.orders": "Ibyo Nategetse",
    "dashboard.pending": "Bitegereje", "dashboard.paid": "Byishyuwe", "dashboard.delivered": "Byagejejwe",
    "dashboard.payNow": "Ishyura Nonaha", "dashboard.orderHistory": "Amateka",
    "dashboard.noOrders": "Nta byo wategetse", "dashboard.trackOrder": "Kurikirana",
    "payment.title": "Kwishyura", "payment.momo": "MTN MoMo Pay",
    "payment.enterPhone": "Andika nimero ya MTN Mobile Money", "payment.pay": "Ishyura",
    "payment.processing": "Kwishyura kuragenda...", "payment.success": "Byagenze neza!",
    "payment.prompt": "Reba kuri telefoni yawe", "payment.total": "Igiteranyo",
    "admin.title": "Ubutegetsi", "admin.products": "Ibicuruzwa", "admin.orders": "Ibyo Bategetse",
    "admin.users": "Abakoresha", "admin.payments": "Ubwishyu", "admin.settings": "Igenamiterere",
    "admin.assistant": "Umufasha AI", "admin.addProduct": "Ongeraho", "admin.editProduct": "Hindura",
    "admin.deleteProduct": "Siba", "admin.orderStatus": "Uko Bimeze", "admin.deliveryStatus": "Igenamiterere",
    "admin.markDelivered": "Emeza", "admin.paymentVerified": "Byemejwe", "admin.paymentPending": "Bitegereje",
    "footer.rights": "Uburenganzira bwose burarinzwe", "footer.contact": "Tuvugishe",
    "footer.about": "Ibyerekeye ZANA", "footer.delivery": "Amakuru y'Igenamiterere",
    "common.loading": "Gutegereza...", "common.error": "Habaye ikibazo",
    "common.save": "Bika", "common.cancel": "Hagarika", "common.delete": "Siba", "common.edit": "Hindura", "common.rwf": "RWF",
  },
  sw: {
    "nav.home": "Nyumbani", "nav.products": "Bidhaa", "nav.login": "Ingia", "nav.register": "Jiandikishe",
    "nav.dashboard": "Dashibodi", "nav.admin": "Msimamizi", "nav.logout": "Ondoka", "nav.cart": "Kikapu",
    "hero.title": "Duka la ZANA Electronics",
    "hero.subtitle": "Gundua vifaa vipya na elektroniki na uwasilishaji wa haraka nchini Rwanda",
    "hero.cta": "Nunua Sasa",
    "products.title": "Bidhaa Zetu", "products.order": "Agiza Sasa", "products.price": "Bei",
    "products.search": "Tafuta bidhaa...", "products.category.all": "Zote",
    "products.category.phones": "Simu", "products.category.laptops": "Laptop",
    "products.category.accessories": "Vifaa", "products.category.audio": "Sauti", "products.category.gaming": "Michezo",
    "auth.login": "Ingia", "auth.register": "Unda Akaunti", "auth.email": "Barua pepe",
    "auth.password": "Nywila", "auth.name": "Jina Kamili", "auth.phone": "Nambari ya Simu",
    "auth.noAccount": "Huna akaunti?", "auth.hasAccount": "Tayari una akaunti?",
    "auth.loginToContinue": "Ingia kuendelea na agizo lako",
    "dashboard.title": "Dashibodi Yangu", "dashboard.orders": "Maagizo Yangu",
    "dashboard.pending": "Inasubiri", "dashboard.paid": "Imelipwa", "dashboard.delivered": "Imetolewa",
    "dashboard.payNow": "Lipa Sasa", "dashboard.orderHistory": "Historia",
    "dashboard.noOrders": "Hakuna maagizo bado", "dashboard.trackOrder": "Fuatilia",
    "payment.title": "Malipo", "payment.momo": "MTN MoMo Pay",
    "payment.enterPhone": "Ingiza nambari ya MTN Mobile Money", "payment.pay": "Lipa Sasa",
    "payment.processing": "Inachakata...", "payment.success": "Yamefanikiwa!",
    "payment.prompt": "Angalia simu yako", "payment.total": "Jumla",
    "admin.title": "Dashibodi ya Msimamizi", "admin.products": "Bidhaa", "admin.orders": "Maagizo",
    "admin.users": "Watumiaji", "admin.payments": "Malipo", "admin.settings": "Mipangilio",
    "admin.assistant": "Msaidizi AI", "admin.addProduct": "Ongeza", "admin.editProduct": "Hariri",
    "admin.deleteProduct": "Futa", "admin.orderStatus": "Hali ya Agizo", "admin.deliveryStatus": "Hali",
    "admin.markDelivered": "Imetolewa", "admin.paymentVerified": "Imethibitishwa", "admin.paymentPending": "Inasubiri",
    "footer.rights": "Haki zote zimehifadhiwa", "footer.contact": "Wasiliana Nasi",
    "footer.about": "Kuhusu ZANA", "footer.delivery": "Maelezo ya Usafirishaji",
    "common.loading": "Inapakia...", "common.error": "Kuna tatizo",
    "common.save": "Hifadhi", "common.cancel": "Ghairi", "common.delete": "Futa", "common.edit": "Hariri", "common.rwf": "RWF",
  },
  zh: {
    "nav.home": "首页", "nav.products": "产品", "nav.login": "登录", "nav.register": "注册",
    "nav.dashboard": "仪表板", "nav.admin": "管理", "nav.logout": "退出", "nav.cart": "购物车",
    "hero.title": "ZANA 电子产品商店", "hero.subtitle": "发现最新的电子产品，卢旺达全境快速配送", "hero.cta": "立即购买",
    "products.title": "我们的产品", "products.order": "立即订购", "products.price": "价格",
    "products.search": "搜索产品...", "products.category.all": "全部",
    "products.category.phones": "手机", "products.category.laptops": "笔记本",
    "products.category.accessories": "配件", "products.category.audio": "音频", "products.category.gaming": "游戏",
    "auth.login": "登录", "auth.register": "创建账户", "auth.email": "电子邮箱",
    "auth.password": "密码", "auth.name": "全名", "auth.phone": "电话号码",
    "auth.noAccount": "没有账户？", "auth.hasAccount": "已有账户？", "auth.loginToContinue": "登录以继续您的订单",
    "dashboard.title": "我的仪表板", "dashboard.orders": "我的订单",
    "dashboard.pending": "待处理", "dashboard.paid": "已付款", "dashboard.delivered": "已送达",
    "dashboard.payNow": "立即支付", "dashboard.orderHistory": "订单历史",
    "dashboard.noOrders": "暂无订单", "dashboard.trackOrder": "跟踪订单",
    "payment.title": "支付", "payment.momo": "MTN MoMo Pay",
    "payment.enterPhone": "输入MTN号码", "payment.pay": "立即支付",
    "payment.processing": "正在处理...", "payment.success": "支付成功！",
    "payment.prompt": "请在手机上查看", "payment.total": "总计",
    "admin.title": "管理仪表板", "admin.products": "产品", "admin.orders": "订单",
    "admin.users": "用户", "admin.payments": "支付", "admin.settings": "网站设置",
    "admin.assistant": "AI助手", "admin.addProduct": "添加产品", "admin.editProduct": "编辑产品",
    "admin.deleteProduct": "删除", "admin.orderStatus": "订单状态", "admin.deliveryStatus": "配送状态",
    "admin.markDelivered": "标记已送达", "admin.paymentVerified": "已验证", "admin.paymentPending": "待处理",
    "footer.rights": "版权所有", "footer.contact": "联系我们",
    "footer.about": "关于ZANA", "footer.delivery": "配送信息",
    "common.loading": "加载中...", "common.error": "出了点问题",
    "common.save": "保存", "common.cancel": "取消", "common.delete": "删除", "common.edit": "编辑", "common.rwf": "RWF",
  },
  fr: {
    "nav.home": "Accueil", "nav.products": "Produits", "nav.login": "Connexion", "nav.register": "Inscription",
    "nav.dashboard": "Tableau de bord", "nav.admin": "Admin", "nav.logout": "Déconnexion", "nav.cart": "Panier",
    "hero.title": "Magasin ZANA Electronics",
    "hero.subtitle": "Découvrez les derniers gadgets et appareils électroniques avec livraison rapide au Rwanda",
    "hero.cta": "Acheter Maintenant",
    "products.title": "Nos Produits", "products.order": "Commander", "products.price": "Prix",
    "products.search": "Rechercher des produits...", "products.category.all": "Tous",
    "products.category.phones": "Téléphones", "products.category.laptops": "Ordinateurs",
    "products.category.accessories": "Accessoires", "products.category.audio": "Audio", "products.category.gaming": "Jeux",
    "auth.login": "Connexion", "auth.register": "Créer un Compte", "auth.email": "E-mail",
    "auth.password": "Mot de passe", "auth.name": "Nom Complet", "auth.phone": "Numéro de Téléphone",
    "auth.noAccount": "Pas de compte ?", "auth.hasAccount": "Déjà un compte ?",
    "auth.loginToContinue": "Connectez-vous pour continuer",
    "dashboard.title": "Mon Tableau de Bord", "dashboard.orders": "Mes Commandes",
    "dashboard.pending": "En attente", "dashboard.paid": "Payé", "dashboard.delivered": "Livré",
    "dashboard.payNow": "Payer", "dashboard.orderHistory": "Historique",
    "dashboard.noOrders": "Aucune commande", "dashboard.trackOrder": "Suivre",
    "payment.title": "Paiement", "payment.momo": "MTN MoMo Pay",
    "payment.enterPhone": "Entrez votre numéro MTN Mobile Money", "payment.pay": "Payer",
    "payment.processing": "Traitement en cours...", "payment.success": "Paiement réussi !",
    "payment.prompt": "Vérifiez votre téléphone", "payment.total": "Total",
    "admin.title": "Tableau de Bord Admin", "admin.products": "Produits", "admin.orders": "Commandes",
    "admin.users": "Utilisateurs", "admin.payments": "Paiements", "admin.settings": "Paramètres",
    "admin.assistant": "Assistant IA", "admin.addProduct": "Ajouter Produit", "admin.editProduct": "Modifier",
    "admin.deleteProduct": "Supprimer", "admin.orderStatus": "Statut", "admin.deliveryStatus": "Livraison",
    "admin.markDelivered": "Marquer Livré", "admin.paymentVerified": "Vérifié", "admin.paymentPending": "En attente",
    "footer.rights": "Tous droits réservés", "footer.contact": "Contactez-nous",
    "footer.about": "À propos de ZANA", "footer.delivery": "Infos de Livraison",
    "common.loading": "Chargement...", "common.error": "Une erreur s'est produite",
    "common.save": "Enregistrer", "common.cancel": "Annuler", "common.delete": "Supprimer", "common.edit": "Modifier", "common.rwf": "RWF",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  rw: "Kinyarwanda",
  sw: "Kiswahili",
  zh: "中文",
  fr: "Français",
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof languageNames;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key,
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: languageNames }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
