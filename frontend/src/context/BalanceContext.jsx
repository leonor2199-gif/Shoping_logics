import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import financeService from "../services/financeService";
import { useAuth } from "./AuthContext";

const BalanceContext = createContext(null);

export function BalanceProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);

      const response =
        await financeService.getBalance();

      /*
       * Support the common backend response shapes:
       *
       * { balance: 100 }
       * { data: { balance: 100 } }
       */

      const nextBalance =
        response?.balance ??
        response?.data?.balance ??
        0;

      setBalance(Number(nextBalance));
    } catch (error) {
      console.error(
        "Failed to fetch balance:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  return (
    <BalanceContext.Provider
      value={{
        balance,
        loading,
        refreshBalance,
        setBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);

  if (!context) {
    throw new Error(
      "useBalance must be used inside BalanceProvider"
    );
  }

  return context;
}