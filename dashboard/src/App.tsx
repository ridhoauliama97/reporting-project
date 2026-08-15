import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { parseAllItems, filterByDateRange } from './utils/formatters';
import purchaseData from './data/purchase-data.json';
import Layout from './components/Layout';
import PurchaseSummary from './pages/PurchaseSummary';
import PurchaseBySupplier from './pages/PurchaseBySupplier';
import SupplierRanking from './pages/SupplierRanking';
import SupplierQuality from './pages/SupplierQuality';
import SupplierDelivery from './pages/SupplierDelivery';
import PurchasePriceHistory from './pages/PurchasePriceHistory';
import PurchaseVariance from './pages/PurchaseVariance';
import MaterialCostTrend from './pages/MaterialCostTrend';
import PriceIncreaseAlert from './pages/PriceIncreaseAlert';
import PurchaseLeadTime from './pages/PurchaseLeadTime';
import OutstandingPO from './pages/OutstandingPO';
import OpenPO from './pages/OpenPO';
import ClosedPO from './pages/ClosedPO';
import SupplierScorecard from './pages/SupplierScorecard';

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;