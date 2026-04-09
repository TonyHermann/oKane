import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/core/entities/Transaction";
import type { ITransactionRepository } from "@/core/repositories/ITransactionRepository";
import { GetAllTransactions } from "./GetAllTransactions";

describe("GetAllTransactions", () => {
  let mockRepository: ITransactionRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
    };
  });

  it("should call repository.findAll and return the result", async () => {
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        amount: 100,
        date: new Date("2024-01-01"),
        description: "Transaction 1",
      },
      {
        id: "2",
        amount: 200,
        date: new Date("2024-01-02"),
        description: "Transaction 2",
      },
    ];

    mockRepository.findAll = vi.fn().mockResolvedValue(mockTransactions);

    const result = await GetAllTransactions(mockRepository);

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTransactions);
  });

  it("should return empty array when no transactions exist", async () => {
    const result = await GetAllTransactions(mockRepository);

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
