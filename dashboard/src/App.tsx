import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useMemo, Suspense, lazy } from 'react';
import { parseAllItems, filterByDateRange } from './utils/formatters';
import purchaseData from './data/purchase-data.json';
import Layout from './components/Layout';

const PurchaseSummary = lazy(() => import('./pages/PurchaseSummary'));
const PurchaseBySupplier = lazy(() => import('./pages/PurchaseBySupplier'));
const SupplierRanking = lazy(() => import('./pages/SupplierRanking'));
const SupplierQuality = lazy(() => import('./pages/SupplierQuality'));
const SupplierDelivery = lazy(() => import('./pages/SupplierDelivery'));
const PurchasePriceHistory = lazy(() => import('./pages/PurchasePriceHistory'));
const PurchaseVariance = lazy(() => import('./pages/PurchaseVariance'));
const MaterialCostTrend = lazy(() => import('./pages/MaterialCostTrend'));
const PriceIncreaseAlert = lazy(() => import('./pages/PriceIncreaseAlert'));
const PurchaseLeadTime = lazy(() => import('./pages/PurchaseLeadTime'));
const OutstandingPO = lazy(() => import('./pages/OutstandingPO'));
const OpenPO = lazy(() => import('./pages/OpenPO'));
const ClosedPO = lazy(() => import('./pages/ClosedPO'));
const SupplierScorecard = lazy(() => import('./pages/SupplierScorecard'));
const ReportsExports = lazy(() => import('./pages/ReportsExports'));
const AnalyticsInsights = lazy(() => import('./pages/AnalyticsInsights'));
const WarehousePlaceholder = lazy(() => import('./pages/WarehousePlaceholder'));

const WAREHOUSES: Record<string, string> = {
  'gudang-bahan-baku': '01: GUDANG BAHAN BAKU',
  'gudang-barang-jadi': '04: GUDANG BARANG JADI',
  'gudang-sparepart': '07: GUDANG SPAREPART',
  'cbd-sparepart': '09: CBD SPAREPART',
  'gudang-wip': '51: GUDANG WIP',
  'gudang-pekanbaru': '54: GUDANG PEKANBARU',
  'kantor-sales': '24: KANTOR SALES',
};

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

function App() {
  const allItems = useMemo(() => parseAllItems(purchaseData as any[]), []);

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>(
    getDefaultDateRange()
  );

  const filteredItems = useMemo(
    () => filterByDateRange(allItems, dateRange.start, dateRange.end),
    [allItems, dateRange]
  );

  return (
    <Router>
      <Layout>
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          }
        >
          <Routes>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route
            path="/summary"
            element={
              <PurchaseSummary
                items={filteredItems}
                allItems={allItems}
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
          <Route path="/outstanding-po" element={<OutstandingPO />} />
          <Route path="/open-po" element={<OpenPO />} />
          <Route path="/closed-po" element={<ClosedPO />} />
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
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            }
          />
        </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;