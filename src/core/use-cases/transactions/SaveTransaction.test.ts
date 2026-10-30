import { beforeEach, describe, expect, it, vi } from "vitest";
import { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { SaveTransaction } from "./SaveTransaction";

describe("SaveTransaction", () => {
  let mockRepository: ITransactionRepository;
  let saveTransaction: (transaction: Transaction) => Promise<void>;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      saveMany: vi.fn().mockResolvedValue({ imported: 0, failed: [] }),
      findDuplicates: vi.fn().mockResolvedValue(new Set()),
    };

    saveTransaction = SaveTransaction(mockRepository);
  });

  it("should call repository.save when transaction is valid", async () => {
    const transaction = Transaction.Rehydrate({
      id: "1",
      amount: 100,
      date: new Date("2024-01-01").getTime(),
      description: "Test transaction",
    });

    await saveTransaction(transaction);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(transaction);
  });
});
