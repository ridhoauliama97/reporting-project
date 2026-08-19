import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { parseAllItems, parseAllPurchaseOrders, filterByDateRange, filterPurchaseOrdersByDateRange } from "./utils/formatters";
import type { PurchaseItem, ParsedPurchaseItem, PurchaseOrderRecord, ParsedPurchaseOrder } from "./types/purchase";
import purchaseDataUrl from "./data/purchase-data.json?url";
import Layout from "./components/Layout";
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
const WarehousePlaceholder = lazy(() => import("./pages/WarehousePlaceholder"));
const DocsPage = lazy(() => import("./pages/DocsPage"));

const WAREHOUSES: Record<string, string> = {
  "gudang-bahan-baku": "01: GUDANG BAHAN BAKU",
  "gudang-barang-jadi": "04: GUDANG BARANG JADI",
  "gudang-sparepart": "07: GUDANG SPAREPART",
  "cbd-sparepart": "09: CBD SPAREPART",
  "gudang-wip": "51: GUDANG WIP",
  "gudang-pekanbaru": "54: GUDANG PEKANBARU",
  "kantor-sales": "24: KANTOR SALES",
};

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

function App() {
  const [allItems, setAllItems] = useState<ParsedPurchaseItem[]>([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState<
    ParsedPurchaseOrder[]
  >([]);
  const [loadError, setLoadError] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    fetch(purchaseDataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: (PurchaseItem | PurchaseOrderRecord)[]) => {
        if (!cancelled) {
          const parsed = parseAllItems(data as PurchaseItem[]);
          setAllItems(parsed);
          setAllPurchaseOrders(parseAllPurchaseOrders(data as PurchaseOrderRecord[]));
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
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
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

  return (
    <Router>
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
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
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
                    {Object.entries(WAREHOUSES).map(([slug, name]) => (
                      <Route
                        key={slug}
                        path={`/warehouse/${slug}`}
                        element={<WarehousePlaceholder name={name} />}
                      />
                    ))}
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
            )
          }
        />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
