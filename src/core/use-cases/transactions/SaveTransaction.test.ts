import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { SaveTransaction } from "./SaveTransaction";

describe("SaveTransaction", () => {
  let mockRepository: ITransactionRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
    };
  });

  it("should throw error if transaction amount is 0", async () => {
    const mockTransaction: Transaction = {
      id: "1",
      amount: 0,
      date: "12/01/2004",
      description: "nacimiento",
    };

    const saveTransaction = await SaveTransaction(mockRepository);

    await expect(saveTransaction(mockTransaction)).rejects.toThrow(
      "Importe inválido.",
    );

    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
