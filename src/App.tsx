/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewMode } from './types/index.ts';
import { DISPATCH_QUEUE } from './data/mockData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { SupplyAllocationView } from './views/SupplyAllocationView.tsx';
import { DataValidationView } from './views/DataValidationView.tsx';
import { RiskOverviewView } from './views/RiskOverviewView.tsx';
import { AllocationPlanView } from './views/AllocationPlanView.tsx';
import { RecommendationDetailView } from './views/RecommendationDetailView.tsx';
import { BacktestView } from './views/BacktestView.tsx';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('supply-allocation');
  const [selectedSkuCode, setSelectedSkuCode] = useState<string>('SKU-9921-X');
  const [isDarkSidebar, setIsDarkSidebar] = useState<boolean>(true);
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'sandbox'>('staging');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectSku = (skuCode: string) => {
    setSelectedSkuCode(skuCode);
  };

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    showToast('GLPK MILP Solver triggered for all 12 regional distribution nodes...', 'info');

    setTimeout(() => {
      setIsOptimizing(false);
      showToast('Optimization run OPT-9412 completed! 142 dispatches recalculated (Gap: 0.00%)', 'success');
      setCurrentView('allocation-plan');
    }, 1800);
  };

  const handleExportGlobal = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Gate,Origin DC,Origin City,Batch,SKU,Description,Class,Destination,Allocated Qty,ETA,Shelf Life,Freight Cost\n' +
      DISPATCH_QUEUE.map(
        (d) =>
          `"${d.id}","${d.gate}","${d.originDc}","${d.originCity}","${d.batchId}","${d.skuCode}","${d.productName}","${d.tempClass}","${d.destHub}",${d.allocatedQty},"${d.eta}","${d.shelfLifeDays} Days",${d.freightCost}`
      ).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Optiqo_Global_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported complete enterprise allocation dataset (CSV)', 'info');
  };

  const handleSwitchEnvironment = () => {
    const nextEnv =
      environment === 'production' ? 'staging' : environment === 'staging' ? 'sandbox' : 'production';
    setEnvironment(nextEnv);
    showToast(`Switched active context to [${nextEnv.toUpperCase()}] environment`, 'warning');
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view: ViewMode) => setCurrentView(view)}
        isDarkTheme={isDarkSidebar}
        onToggleTheme={() => setIsDarkSidebar(!isDarkSidebar)}
        environment={environment}
        onSwitchEnvironment={handleSwitchEnvironment}
      />

      {/* Main Container with 260px offset for sidebar */}
      <div className="pl-[260px] min-h-screen flex flex-col">
        {/* Top Fixed Header */}
        <Header
          currentView={currentView}
          onNavigate={(view: ViewMode) => setCurrentView(view)}
          datasetName="Global_Retail_Q3_Simulated"
          onRunOptimizer={handleRunOptimizer}
          isOptimizing={isOptimizing}
          onExportGlobal={handleExportGlobal}
        />

        {/* Primary View Outlet */}
        <main className="w-full pt-16 bg-background flex-1 px-space-xl py-space-lg max-w-[1440px] mx-auto">
          {currentView === 'supply-allocation' && (
            <SupplyAllocationView
              items={DISPATCH_QUEUE}
              onSelectSku={(sku) => {
                handleSelectSku(sku);
                setCurrentView('recommendation-detail');
              }}
              onNavigate={(view) => setCurrentView(view)}
              onShowToast={showToast}
            />
          )}

          {currentView === 'data-validation' && (
            <DataValidationView
              onNavigate={(view) => setCurrentView(view)}
              onShowToast={showToast}
            />
          )}

          {currentView === 'risk-overview' && (
            <RiskOverviewView
              onNavigate={(view) => setCurrentView(view)}
              onSelectSku={(sku) => {
                handleSelectSku(sku);
                setCurrentView('recommendation-detail');
              }}
              onShowToast={showToast}
            />
          )}

          {currentView === 'allocation-plan' && (
            <AllocationPlanView
              onNavigate={(view) => setCurrentView(view)}
              onSelectSku={(sku) => handleSelectSku(sku)}
              onShowToast={showToast}
            />
          )}

          {currentView === 'recommendation-detail' && (
            <RecommendationDetailView
              onNavigate={(view) => setCurrentView(view)}
              selectedSkuCode={selectedSkuCode}
              onShowToast={showToast}
            />
          )}

          {currentView === 'backtest' && (
            <BacktestView
              onNavigate={(view) => setCurrentView(view)}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notifications System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto cursor-pointer p-3.5 rounded-lg shadow-xl border flex items-start gap-2.5 transition-all transform translate-y-0 text-body-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-surface-container-lowest text-primary border-primary/30 shadow-primary/10'
                : toast.type === 'error'
                ? 'bg-error-container text-on-error-container border-error/30'
                : toast.type === 'warning'
                ? 'bg-surface-container-lowest text-amber-800 border-amber-400 shadow-amber-500/10'
                : 'bg-inverse-surface text-inverse-on-surface border-surface-container shadow-black/20'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                ? 'error'
                : toast.type === 'warning'
                ? 'warning'
                : 'info'}
            </span>
            <span className="flex-1 text-[12.5px] leading-snug">{toast.message}</span>
            <span className="material-symbols-outlined text-[15px] opacity-60 hover:opacity-100 shrink-0">
              close
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
