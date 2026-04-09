import { beforeEach, describe, expect, it, vi } from "vitest";
import { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { DeleteTransaction } from "./DeleteTransaction";

describe("deleteTransaction", () => {
  let mockRepository: ITransactionRepository;
  let deleteTransaction: (transactionId: Transaction["id"]) => Promise<void>;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
    };

    deleteTransaction = DeleteTransaction(mockRepository);
  });

  it("should call repository.delete when transaction is valid", async () => {
    await deleteTransaction("1");

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete).toHaveBeenCalledWith("1");
  });
});
