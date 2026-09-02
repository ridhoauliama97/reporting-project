import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  Component,
  useEffect,
  useMemo,
  useState,
  Suspense,
  lazy,
  type ReactNode,
} from "react";
import {
  parseAllItems,
  parseAllPurchaseOrders,
  parseAllStock,
  parseAllTransfers,
  parseAllAdjustments,
  parseAllUsages,
  parseAllProductions,
  parseAllProductionMaterials,
  parseAllProductionOutputs,
  filterByDateRange,
  filterPurchaseOrdersByDateRange,
  filterByDateAccessor,
} from "./utils/formatters";
import type {
  PurchaseItem,
  ParsedPurchaseItem,
  PurchaseOrderRecord,
  ParsedPurchaseOrder,
  StockRecord,
  ParsedStockRecord,
  TransferRecord,
  ParsedTransfer,
  AdjustmentRecord,
  ParsedAdjustment,
  UsageRecord,
  ParsedUsage,
  ProductionRecord,
  ParsedProduction,
  ProductionMaterialRecord,
  ParsedProductionMaterial,
  ProductionOutputRecord,
  ParsedProductionOutput,
} from "./types/purchase";
import type {
  LoaderResponse,
  RawRecord,
} from "./data-loader.worker";
import purchasingDataUrl from "./data/purchasing-data.json?url";
import warehouseDataUrl from "./data/warehouse-data.json?url";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { Button } from "./components/ui/button";
import { Analytics } from '@vercel/analytics/react';

const PurchaseSummary = lazy(() => import("./pages/PurchaseSummary"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PurchaseBySupplier = lazy(() => import("./pages/PurchaseBySupplier"));
const SupplierRanking = lazy(() => import("./pages/SupplierRanking"));
const SupplierQuality = lazy(() => import("./pages/SupplierQuality"));
const SupplierDelivery = lazy(() => import("./pages/SupplierDelivery"));
const PurchasePriceHistory = lazy(() => import("./pages/PurchasePriceHistory"));
const PurchaseVariance = lazy(() => import("./pages/PurchaseVariance"));
const MaterialCostTrend = lazy(() => import("./pages/MaterialCostTrend"));
const PriceIncreaseAlert = lazy(() => import("./pages/PriceIncreaseAlert"));
const PurchaseLeadTime = lazy(() => import("./pages/PurchaseLeadTime"));
const OutstandingPO = lazy(() => import("./pages/OutstandingPO"));
const OpenPO = lazy(() => import("./pages/OpenPO"));
const ClosedPO = lazy(() => import("./pages/ClosedPO"));
const SupplierScorecard = lazy(() => import("./pages/SupplierScorecard"));
const ReportsExports = lazy(() => import("./pages/ReportsExports"));
const AnalyticsInsights = lazy(() => import("./pages/AnalyticsInsights"));
const InventoryValue = lazy(() => import("./pages/InventoryValue"));
const StockMovement = lazy(() => import("./pages/StockMovement"));
const DeadStock = lazy(() => import("./pages/DeadStock"));
const SlowMoving = lazy(() => import("./pages/SlowMoving"));
const FastMoving = lazy(() => import("./pages/FastMoving"));
const InventoryAging = lazy(() => import("./pages/InventoryAging"));
const CycleCountAccuracy = lazy(() => import("./pages/CycleCountAccuracy"));
const StockAdjustment = lazy(() => import("./pages/StockAdjustment"));
const WarehouseProductivity = lazy(() => import("./pages/WarehouseProductivity"));
const WarehouseUtilization = lazy(() => import("./pages/WarehouseUtilization"));
const LocationOccupancy = lazy(() => import("./pages/LocationOccupancy"));
const TransferHistory = lazy(() => import("./pages/TransferHistory"));
const StockAvailability = lazy(() => import("./pages/StockAvailability"));
const FillRate = lazy(() => import("./pages/FillRate"));
const PickingAccuracy = lazy(() => import("./pages/PickingAccuracy"));
const PackingAccuracy = lazy(() => import("./pages/PackingAccuracy"));
const DeliveryPerformance = lazy(() => import("./pages/DeliveryPerformance"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const SettingsPage = lazy(() => import("./pages/Settings"));

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
          <p className="text-sm font-medium text-foreground">
            Terjadi kesalahan tak terduga.
          </p>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button variant="outline" onClick={() => this.setState({ error: null })}>
            Muat Ulang Halaman
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [allItems, setAllItems] = useState<ParsedPurchaseItem[]>([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState<
    ParsedPurchaseOrder[]
  >([]);
  const [allStock, setAllStock] = useState<ParsedStockRecord[]>([]);
  const [allTransfers, setAllTransfers] = useState<ParsedTransfer[]>([]);
  const [allAdjustments, setAllAdjustments] = useState<ParsedAdjustment[]>([]);
  const [allUsages, setAllUsages] = useState<ParsedUsage[]>([]);
  const [allProductions, setAllProductions] = useState<ParsedProduction[]>([]);
  const [allProductionMaterials, setAllProductionMaterials] = useState<
    ParsedProductionMaterial[]
  >([]);
  const [allProductionOutputs, setAllProductionOutputs] = useState<
    ParsedProductionOutput[]
  >([]);
  const [loadError, setLoadError] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let worker: Worker | null = null;
    setLoadError(false);

    const applyData = (data: RawRecord[]) => {
      if (cancelled) return;
      const parsed = parseAllItems(data as PurchaseItem[]);
      setAllItems(parsed);
      setAllPurchaseOrders(
        parseAllPurchaseOrders(data as PurchaseOrderRecord[]),
      );
      setAllStock(parseAllStock(data as StockRecord[]));
      setAllTransfers(parseAllTransfers(data as TransferRecord[]));
      setAllAdjustments(parseAllAdjustments(data as AdjustmentRecord[]));
      setAllUsages(parseAllUsages(data as UsageRecord[]));
      setAllProductions(parseAllProductions(data as ProductionRecord[]));
      setAllProductionMaterials(
        parseAllProductionMaterials(data as ProductionMaterialRecord[]),
      );
      setAllProductionOutputs(
        parseAllProductionOutputs(data as ProductionOutputRecord[]),
      );
      setDateRange((prev) => {
        if (!prev.start || !prev.end) return prev;
        const inRange = parsed.some(
          (i) =>
            i.purchaseDateObj &&
            i.purchaseDateObj >= prev.start! &&
            i.purchaseDateObj <= prev.end!,
        );
        if (inRange || parsed.length === 0) return prev;
        const dates = parsed
          .map((i) => i.purchaseDateObj)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => a.getTime() - b.getTime());
        if (dates.length === 0) return prev;
        return { start: dates[0], end: dates[dates.length - 1] };
      });
    };

    const loadOnMainThread = () => {
      Promise.all(
        [purchasingDataUrl, warehouseDataUrl].map((url) =>
          fetch(url).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }),
        ),
      )
        .then((parts: RawRecord[][]) => {
          applyData(parts.flat());
        })
        .catch(() => {
          if (!cancelled) setLoadError(true);
        });
    };

    try {
      worker = new Worker(
        new URL("./data-loader.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (event: MessageEvent<LoaderResponse>) => {
        if (cancelled) return;
        if (event.data.ok && event.data.data) {
          applyData(event.data.data);
        } else {
          loadOnMainThread();
        }
      };
      worker.onerror = () => {
        if (!cancelled) loadOnMainThread();
      };
      worker.postMessage([purchasingDataUrl, warehouseDataUrl]);
    } catch {
      loadOnMainThread();
    }

    return () => {
      cancelled = true;
      worker?.terminate();
    };
  }, [loadKey]);

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(getDefaultDateRange());

  const filteredItems = useMemo(
    () => filterByDateRange(allItems, dateRange.start, dateRange.end),
    [allItems, dateRange],
  );

  const filteredPurchaseOrders = useMemo(
    () =>
      filterPurchaseOrdersByDateRange(
        allPurchaseOrders,
        dateRange.start,
        dateRange.end,
      ),
    [allPurchaseOrders, dateRange],
  );

  const filteredTransfers = useMemo(
    () =>
      filterByDateAccessor(
        allTransfers,
        dateRange.start,
        dateRange.end,
        (t) => t.transferDateObj,
      ),
    [allTransfers, dateRange],
  );

  const filteredAdjustments = useMemo(
    () =>
      filterByDateAccessor(
        allAdjustments,
        dateRange.start,
        dateRange.end,
        (a) => a.adjustmentDateObj,
      ),
    [allAdjustments, dateRange],
  );

  const filteredUsages = useMemo(
    () =>
      filterByDateAccessor(
        allUsages,
        dateRange.start,
        dateRange.end,
        (u) => u.usageDateObj,
      ),
    [allUsages, dateRange],
  );

  const filteredProductions = useMemo(
    () =>
      filterByDateAccessor(
        allProductions,
        dateRange.start,
        dateRange.end,
        (p) => p.productionDateObj,
      ),
    [allProductions, dateRange],
  );

  const filteredProductionMaterials = useMemo(
    () =>
      filterByDateAccessor(
        allProductionMaterials,
        dateRange.start,
        dateRange.end,
        (p) => p.productionDateObj,
      ),
    [allProductionMaterials, dateRange],
  );

  const filteredProductionOutputs = useMemo(
    () =>
      filterByDateAccessor(
        allProductionOutputs,
        dateRange.start,
        dateRange.end,
        (p) => p.productionDateObj,
      ),
    [allProductionOutputs, dateRange],
  );

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
        <Route
          path="/docs"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
              }
            >
              <DocsPage />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
              }
            >
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
                </div>
              }
            >
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            loadError ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Gagal memuat data. Periksa koneksi lalu coba lagi.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLoadKey((k) => k + 1)}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : allItems.length === 0 ? (
              <LoadingScreen />
            ) : (
              <RequireAuth>
              <Layout>
                <Suspense
                  fallback={
                    <div className="flex min-h-[50vh] items-center justify-center">
                      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
                    </div>
                  }
                >
                  <Routes>
                    <Route
                      path="/settings"
                      element={<SettingsPage />}
                    />
                    <Route
                      path="/"
                      element={<Navigate to="/login" replace />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <Dashboard
                          items={filteredItems}
                          allItems={allItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/summary"
                      element={
                        <PurchaseSummary
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/by-supplier"
                      element={
                        <PurchaseBySupplier
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/ranking"
                      element={
                        <SupplierRanking
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route path="/quality" element={<SupplierQuality />} />
                    <Route
                      path="/delivery"
                      element={
                        <SupplierDelivery
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/price-history"
                      element={
                        <PurchasePriceHistory
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/variance"
                      element={
                        <PurchaseVariance
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/material-cost"
                      element={
                        <MaterialCostTrend
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/price-alert"
                      element={
                        <PriceIncreaseAlert
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/lead-time"
                      element={
                        <PurchaseLeadTime
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/outstanding-po"
                      element={
                        <OutstandingPO
                          poItems={filteredPurchaseOrders}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/open-po"
                      element={
                        <OpenPO
                          poItems={filteredPurchaseOrders}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/closed-po"
                      element={
                        <ClosedPO
                          poItems={filteredPurchaseOrders}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/inventory-value"
                      element={
                        <InventoryValue
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/stock-movement"
                      element={
                        <StockMovement
                          transfers={filteredTransfers}
                          adjustments={filteredAdjustments}
                          usages={filteredUsages}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/dead-stock"
                      element={
                        <DeadStock
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/slow-moving"
                      element={
                        <SlowMoving
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/fast-moving"
                      element={
                        <FastMoving
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/inventory-aging"
                      element={
                        <InventoryAging
                          stock={allStock}
                        />
                      }
                    />
                    <Route path="/warehouse/cycle-count-accuracy" element={<CycleCountAccuracy />} />
                    <Route
                      path="/warehouse/stock-adjustment"
                      element={
                        <StockAdjustment
                          adjustments={filteredAdjustments}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route path="/warehouse/warehouse-productivity" element={<WarehouseProductivity productions={filteredProductions} productionMaterials={filteredProductionMaterials} productionOutputs={filteredProductionOutputs} dateRange={dateRange} onDateRangeChange={setDateRange} />} />
                    <Route path="/warehouse/warehouse-utilization" element={<WarehouseUtilization stock={allStock} />} />
                    <Route
                      path="/warehouse/location-occupancy"
                      element={
                        <LocationOccupancy
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/transfer-history"
                      element={
                        <TransferHistory
                          transfers={filteredTransfers}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/stock-availability"
                      element={
                        <StockAvailability
                          stock={allStock}
                        />
                      }
                    />
                    <Route
                      path="/warehouse/fill-rate"
                      element={
                        <FillRate
                          transfers={filteredTransfers}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route path="/warehouse/picking-accuracy" element={<PickingAccuracy />} />
                    <Route path="/warehouse/packing-accuracy" element={<PackingAccuracy />} />
                    <Route
                      path="/warehouse/delivery-performance"
                      element={
                        <DeliveryPerformance
                          transfers={filteredTransfers}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/scorecard"
                      element={
                        <SupplierScorecard
                          items={filteredItems}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/reports-exports"
                      element={
                        <ReportsExports
                          items={filteredItems}
                          poItems={filteredPurchaseOrders}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                    <Route
                      path="/analytics-insights"
                      element={
                        <AnalyticsInsights
                          items={filteredItems}
                          allItems={allItems}
                          poItems={filteredPurchaseOrders}
                          dateRange={dateRange}
                          onDateRangeChange={setDateRange}
                        />
                      }
                    />
                  </Routes>
                </Suspense>
              </Layout>
              </RequireAuth>
            )
          }
        />
      </Routes>
      </ErrorBoundary>
      <Analytics />
    </Router>
  );
}

export default App;
