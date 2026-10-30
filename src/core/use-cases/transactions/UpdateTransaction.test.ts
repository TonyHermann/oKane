import { beforeEach, describe, expect, it, vi } from "vitest";
import { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { UpdateTransaction } from "./UpdateTransaction";

describe("UpdateTransaction", () => {
  let mockRepository: ITransactionRepository;
  let updateTransaction: (transaction: Transaction) => Promise<void>;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
      saveMany: vi.fn().mockResolvedValue({ imported: 0, failed: [] }),
      findDuplicates: vi.fn().mockResolvedValue(new Set()),
    };

    updateTransaction = UpdateTransaction(mockRepository);
  });

  it("should call repository.update when transaction is valid", async () => {
    const transaction = Transaction.Rehydrate({
      id: "1",
      amount: 100,
      date: new Date("2024-01-01").getTime(),
      description: "Test transaction",
    });

    await updateTransaction(transaction);

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledWith(transaction);
  });
});
