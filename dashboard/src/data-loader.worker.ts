import type {
  PurchaseItem,
  PurchaseOrderRecord,
  StockRecord,
  TransferRecord,
  AdjustmentRecord,
  UsageRecord,
} from "./types/purchase";

export type RawRecord =
  | PurchaseItem
  | PurchaseOrderRecord
  | StockRecord
  | TransferRecord
  | AdjustmentRecord
  | UsageRecord;

export interface LoaderResponse {
  ok: boolean;
  data?: RawRecord[];
  error?: string;
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<string>) => void) | null;
  postMessage: (message: LoaderResponse) => void;
}

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = async (event: MessageEvent<string>) => {
  const url = event.data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as RawRecord[];
    workerScope.postMessage({ ok: true, data });
  } catch (err) {
    workerScope.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};