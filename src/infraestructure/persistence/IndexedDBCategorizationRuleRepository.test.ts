import { beforeEach, describe, expect, it, vi } from "vitest";
import { IndexedDBCategorizationRuleRepository } from "./IndexedDBCategorizationRuleRepository";
import { openDB } from "./IndexedDB.js";

vi.mock("./IndexedDB.js", () => ({ openDB: vi.fn() }));

const mockedOpenDB = vi.mocked(openDB);

// Minimal stand-in for what the object store actually persists. The rule
// repository never calls into the Category class, so a plain object matches
// what getAll() returns at runtime. `condition` is optional because a
// development database left over from an unmerged branch iteration can hold a
// record that never carried one — the whole point of test #3 below.
interface StoredRuleRecord {
  id: string;
  order: number;
  enabled: boolean;
  condition?: { type: string; values: string[] };
  category: { id: string; name: string; created_at: number };
}

const storedRuleFixture = (
  overrides: Partial<StoredRuleRecord> = {},
): StoredRuleRecord => ({
  id: `rule-${Math.random().toString(36).slice(2, 8)}`,
  order: 0,
  enabled: true,
  condition: { type: "description_contains", values: ["groceries"] },
  category: { id: "cat-1", name: "Comida", created_at: 1_700_000_000_000 },
  ...overrides,
});

const storedConditionlessFixture = (
  id: string,
  order: number,
): StoredRuleRecord => ({
  id,
  order,
  enabled: true,
  category: { id: "cat-1", name: "Comida", created_at: 1_700_000_000_000 },
});

const installFakeDb = (records: StoredRuleRecord[]) => {
  // The repository assigns `request.onsuccess` AFTER calling `store.getAll()`,
  // so the handler must fire on a later microtask to mirror real IDB timing.
  // `FakeRequest` is deliberately narrower than lib.dom's `IDBRequest` — we
  // only model the two fields the repository touches at runtime.
  interface FakeRequest {
    result: StoredRuleRecord[];
    onsuccess?: () => void;
  }

  const request: FakeRequest = { result: records };

  const objectStore = {
    getAll: () => {
      queueMicrotask(() => request.onsuccess?.());
      return request;
    },
  };

  const transaction = {
    objectStore: () => objectStore,
  };

  mockedOpenDB.mockResolvedValue({
    transaction: () => transaction,
  } as unknown as IDBDatabase);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("IndexedDBCategorizationRuleRepository.findAll", () => {
  it("sorts by order ascending and preserves condition.values (spec: order-sequence)", async () => {
    installFakeDb([
      storedRuleFixture({
        id: "rule-3",
        order: 3,
        condition: { type: "description_contains", values: ["supermercado"] },
      }),
      storedRuleFixture({
        id: "rule-1",
        order: 1,
        condition: { type: "description_contains", values: ["groceries", "food"] },
      }),
      storedRuleFixture({
        id: "rule-2",
        order: 2,
        condition: { type: "description_contains", values: ["transporte"] },
      }),
    ]);

    const repo = new IndexedDBCategorizationRuleRepository();
    const result = await repo.findAll();

    expect(result.map((r) => r.id)).toEqual(["rule-1", "rule-2", "rule-3"]);
    expect(result.map((r) => r.order)).toEqual([1, 2, 3]);
    expect(result.map((r) => r.condition.values)).toEqual([
      ["groceries", "food"],
      ["transporte"],
      ["supermercado"],
    ]);
  });

  it("returns N rules when N valid records are stored (spec: count preservation)", async () => {
    installFakeDb(
      Array.from({ length: 5 }, (_, i) =>
        storedRuleFixture({ id: `rule-${i}`, order: i }),
      ),
    );

    const repo = new IndexedDBCategorizationRuleRepository();
    const result = await repo.findAll();

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.id)).toEqual([
      "rule-0",
      "rule-1",
      "rule-2",
      "rule-3",
      "rule-4",
    ]);
  });

  it("returns a conditionless record as stored (spec: no silent dropping)", async () => {
    installFakeDb([
      storedConditionlessFixture("malformed", 2),
      storedRuleFixture({ id: "ok", order: 1 }),
    ]);

    const repo = new IndexedDBCategorizationRuleRepository();
    const result = await repo.findAll();

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["ok", "malformed"]);
  });
});
