import type {
  PurchaseItem,
  PurchaseOrderRecord,
  StockRecord,
  TransferRecord,
  AdjustmentRecord,
  UsageRecord,
  ProductionRecord,
  ProductionMaterialRecord,
  ProductionOutputRecord,
} from "./types/purchase";

export type RawRecord =
  | PurchaseItem
  | PurchaseOrderRecord
  | StockRecord
  | TransferRecord
  | AdjustmentRecord
  | UsageRecord
  | ProductionRecord
  | ProductionMaterialRecord
  | ProductionOutputRecord;

export interface LoaderResponse {
  ok: boolean;
  data?: RawRecord[];
  error?: string;
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<string[]>) => void) | null;
  postMessage: (message: LoaderResponse) => void;
}

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = async (event: MessageEvent<string[]>) => {
  const urls = event.data;
  try {
    const parts = await Promise.all(
      urls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as RawRecord[];
      }),
    );
    workerScope.postMessage({ ok: true, data: parts.flat() });
  } catch (err) {
    workerScope.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};