import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  type UserProfile,
  type UserTicket,
  type WalletTransaction,
  userProfile as initialProfile,
  userTickets as initialTickets,
  walletTransactions as initialTransactions,
} from "@/data/mockData";

interface CartItem {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

interface AppContextType {
  tickets: UserTicket[];
  transactions: WalletTransaction[];
  profile: UserProfile;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  completePurchase: (eventId: string, ticketTypeName: string, amount: number) => void;
  walletBalance: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedDiscount: number;
  updateProfile: (updates: Partial<Pick<UserProfile, "name" | "avatar">>) => void;
  deleteAccount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<UserTicket[]>(initialTickets);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");

  const walletBalance = useMemo(
    () => transactions.reduce((acc, transaction) => acc + transaction.amount, 0),
    [transactions],
  );

  const appliedDiscount = couponCode === "FIRULA10" ? 0.1 : 0;

  const addToCart = (item: CartItem) => {
    setCart([item]);
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode("");
  };

  const completePurchase = (eventId: string, ticketTypeName: string, amount: number) => {
    const newTicket: UserTicket = {
      id: `ut${Date.now()}`,
      eventId,
      ticketType: ticketTypeName,
      purchaseDate: new Date().toISOString().split("T")[0],
      status: "active",
      qrCode: `FIRULA-EVT${eventId}-${ticketTypeName.toUpperCase().replace(/\s/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };

    const purchaseTransaction: WalletTransaction = {
      id: `w${Date.now()}`,
      type: "purchase",
      amount: -amount,
      description: `${ticketTypeName} - Compra`,
      date: new Date().toISOString().split("T")[0],
      eventId,
    };

    const cashbackAmount = Math.round(amount * 0.1);
    const cashbackTransaction: WalletTransaction = {
      id: `w${Date.now() + 1}`,
      type: "cashback",
      amount: cashbackAmount,
      description: "Cashback 10%",
      date: new Date().toISOString().split("T")[0],
    };

    setTickets((previous) => [newTicket, ...previous]);
    setTransactions((previous) => [cashbackTransaction, purchaseTransaction, ...previous]);
    clearCart();
  };

  const updateProfile = (updates: Partial<Pick<UserProfile, "name" | "avatar">>) => {
    setProfile((current) => ({
      ...current,
      ...updates,
    }));
  };

  const deleteAccount = () => {
    setTickets([]);
    setTransactions([]);
    setCart([]);
    setCouponCode("");
    setProfile(initialProfile);
  };

  return (
    <AppContext.Provider
      value={{
        tickets,
        transactions,
        profile,
        cart,
        addToCart,
        clearCart,
        completePurchase,
        walletBalance,
        couponCode,
        setCouponCode,
        appliedDiscount,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
};