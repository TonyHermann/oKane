import { useEffect, useState } from "react";
import { transactionActions } from "@/adapters/TransactionActions";
import type { Transaction } from "@/core/entities/Transaction";

export function useTransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await transactionActions.getAll();
        if (!cancelled) {
          setTransactions(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error("Error desconocido al cargar transacciones"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, loading, error } as const;
}
