import { beforeEach, describe, expect, it, vi } from "vitest";
import { Transaction } from "@/core/entities/Transaction";
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
      saveMany: vi.fn().mockRejectedValue(undefined),
      findDuplicates: vi.fn().mockRejectedValue(undefined),
    };
  });

  it("should call repository.findAll and return the result", async () => {
    // const mockTransactions: Transaction[] = [
    //   {
    //     id: "1",
    //     amount: 100,
    //     date: new Date("2024-01-01").getTime(),
    //     description: "Transaction 1",
    //   },
    //   {
    //     id: "2",
    //     amount: 200,
    //     date: new Date("2024-01-02").getTime(),
    //     description: "Transaction 2",
    //   },
    // ];
    //

    const mockTransactions: Transaction[] = [
      Transaction.Create({
        amount: 100,
        date: new Date().getTime(),
        description: "TX 1",
      }),
      Transaction.Create({
        amount: 100,
        date: new Date().getTime(),
        description: "TX 1",
      }),
    ];

    mockRepository.findAll = vi.fn().mockResolvedValue(mockTransactions);

    const getAllTXS = GetAllTransactions(mockRepository);
    const result = await getAllTXS();

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTransactions);
  });

  it("should return empty array when no transactions exist", async () => {
    const getAllTXS = GetAllTransactions(mockRepository);
    const result = await getAllTXS();

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
