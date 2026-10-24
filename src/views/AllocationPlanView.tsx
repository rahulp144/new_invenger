import React, { useState } from 'react';
import { ViewMode, SolverState, DispatchItem } from '../types/index.ts';
import { DISPATCH_QUEUE } from '../data/mockData.ts';
import { WhatIfModal } from '../components/WhatIfModal.tsx';

interface AllocationPlanViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectSku: (skuCode: string) => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AllocationPlanView: React.FC<AllocationPlanViewProps> = ({
  onNavigate,
  onSelectSku,
  onShowToast,
}) => {
  const [solverState, setSolverState] = useState<SolverState>('optimal');
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('All');
  const [destFilter, setDestFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [isReeferActive, setIsReeferActive] = useState(true);

  // Selected item for the trace inspection panel
  const [selectedItem, setSelectedItem] = useState<DispatchItem>(DISPATCH_QUEUE[0]);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [items, setItems] = useState<DispatchItem[]>(DISPATCH_QUEUE);
  const [isSolving, setIsSolving] = useState(false);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originDc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationHub.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrigin = originFilter === 'All' || item.originDc.includes(originFilter);
    const matchesDest = destFilter === 'All' || item.destinationHub.includes(destFilter);
    const matchesClass =
      classFilter === 'All' ||
      (classFilter === '2-8' && item.temperatureClass === '2-8°C') ||
      (classFilter === 'cryo' && item.temperatureClass === '-20°C') ||
      (classFilter === 'amb' && item.temperatureClass === 'Ambient');

    return matchesSearch && matchesOrigin && matchesDest && matchesClass;
  });

  const handleGeneratePlan = () => {
    setIsSolving(true);
    setSolverState('solving');
    onShowToast('GLPK MILP Solver triggered: Evaluating 4,120 linear constraints...', 'info');

    setTimeout(() => {
      setIsSolving(false);
      setSolverState('optimal');
      onShowToast('Convergence achieved in 14.8s (Global Gap: 0.00%). All 18 compliance gates passed!', 'success');
    }, 1200);
  };

  const handleTraceClick = (item: DispatchItem) => {
    setSelectedItem(item);
    onSelectSku(item.skuCode);
    onShowToast(`Loaded solver trace for ${item.skuCode} (${item.batchNumber})`, 'info');
  };

  const handleApplyWhatIf = (newQty: number, origin: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? {
              ...it,
              allocatedUnits: newQty,
              originDc: origin,
            }
          : it
      )
    );
    setSelectedItem((prev) => ({
      ...prev,
      allocatedUnits: newQty,
      originDc: origin,
    }));
    onShowToast(`What-If updated: Set ${selectedItem.skuCode} allocation to +${newQty.toLocaleString()} units`, 'success');
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Gate,Origin DC,Batch,SKU,Description,Class,Destination,Allocated Qty,ETA,Shelf Life,Freight Cost\n' +
      filteredItems
        .map(
          (d) =>
            `"${d.id}","${d.gateStatus}","${d.originDc}","${d.batchNumber}","${d.skuCode}","${d.skuName}","${d.temperatureClass}","${d.destinationHub}",${d.allocatedUnits},"${d.eta}","${d.shelfLifeAtArrivalDays} Days",${d.freightCost}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Optiqo_Allocation_Plan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported allocation dispatch manifest as CSV', 'info');
  };

  const handleSendToWms = () => {
    onShowToast('EDI-856 Dispatch Instructions successfully transmitted to SAP S/4HANA & WMS!', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Operational Context Ribbon (Dynamic State Pill Bar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md gap-space-sm">
        <div className="flex items-center flex-wrap gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
          <span className="font-code font-semibold uppercase text-primary">RUN #OPT-9412</span>
          <span className="text-outline-variant">•</span>
          <span>
            Solver: <strong className="text-on-surface font-code">GLPK-v5.2.1-MILP</strong>
          </span>
          <span className="text-outline-variant">•</span>
          <span>
            Convergence: <strong className="text-on-surface font-code">14.8s (Gap: 0.00%)</strong>
          </span>
          <span className="text-outline-variant">•</span>
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-label-sm">
            Audited by Deterministic Rule Engine
          </span>
        </div>

        {/* State Preview Switcher */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded">
          <span className="font-label-sm text-label-sm text-outline px-1.5 uppercase font-medium">State View:</span>
          {(['optimal', 'solving', 'blocked', 'fallback', 'not-run'] as SolverState[]).map((st) => (
            <button
              key={st}
              onClick={() => {
                setSolverState(st);
                if (st === 'blocked') onShowToast('Simulating: Blocked state (Exceeded thermal carrier capacity)', 'warning');
                if (st === 'fallback') onShowToast('Simulating: Fallback state (Relaxed to Min-Max heuristics)', 'info');
              }}
              className={`px-2 py-0.5 rounded font-label-sm text-label-sm transition-colors capitalize ${
                solverState === st
                  ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-highest/50'
              }`}
            >
              {st === 'optimal' ? 'Optimal (Active)' : st === 'solving' ? 'Solving...' : st === 'not-run' ? 'Not Run' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-space-lg gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-display-sm text-display-sm text-on-surface tracking-tight">Allocation Plan</h1>
            <span className="px-2.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold tracking-wider uppercase">
              7-Day Multi-Echelon Dispatch Solver
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              Deterministic Clearance Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
            Generate and review optimal stock rebalancing and fulfillment dispatch orders across regional DCs and destination hubs. Constrained by transit matrices, batch FEFO shelf-life, and multi-tier freight cost.
          </p>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tune</span>
            Simulate What-If...
          </button>
          <button
            onClick={() => {
              setItems(DISPATCH_QUEUE);
              setSelectedItem(DISPATCH_QUEUE[0]);
              onShowToast('Reset allocation parameters to base MILP solution', 'info');
            }}
            className="px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">restart_alt</span>
            Reset
          </button>
          <button
            onClick={handleGeneratePlan}
            disabled={isSolving}
            className="px-4 py-1.5 rounded bg-primary text-on-primary font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">{isSolving ? 'hourglass_top' : 'play_arrow'}</span>
            {isSolving ? 'Solving...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {/* Planning Horizon & Solver Control Strip */}
      <div className="bg-surface-container-lowest rounded shadow-xs p-space-md mb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md items-center">
          {/* Param 1 */}
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-outline uppercase font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">date_range</span> Planning Horizon
            </span>
            <div className="bg-surface-container-low px-2.5 py-1.5 rounded font-code text-code text-on-surface font-semibold flex items-center justify-between">
              <span>7 Days (May 14 – May 21, 2025)</span>
              <span className="text-outline font-label-sm text-[11px]">LOCKED</span>
            </div>
          </div>

          {/* Param 2 */}
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-outline uppercase font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">calendar_today</span> Planning Start Date
            </span>
            <div className="bg-surface-container-low px-2.5 py-1.5 rounded font-code text-code text-on-surface flex items-center justify-between">
              <span>2025-05-14T00:00:00Z</span>
              <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
            </div>
          </div>

          {/* Param 3 */}
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-outline uppercase font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">balance</span> Solver Objective Function
            </span>
            <div className="bg-surface-container-low px-2.5 py-1.5 rounded font-body-md text-body-md text-on-surface truncate" title="Minimize Total Cost (Lost Margin + Expiry + Freight)">
              <span className="text-primary font-semibold">Min Cost:</span> Lost Margin + Expiry + Freight
            </div>
          </div>

          {/* Param 4 Toggle */}
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-outline uppercase font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">ac_unit</span> Cold-Chain Protocol
            </span>
            <div
              onClick={() => {
                setIsReeferActive(!isReeferActive);
                onShowToast(
                  !isReeferActive ? 'Strict 48h Reefer SLA Activated' : 'Cold-Chain protocol relaxed to standard ambient window',
                  'warning'
                );
              }}
              className="bg-surface-container-low px-2.5 py-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-surface-container"
            >
              <span className="font-label-sm text-label-sm font-semibold text-tertiary">
                {isReeferActive ? 'Strict 48h Reefer SLA' : 'Standard Window (72h)'}
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-code text-[10px] font-bold ${
                isReeferActive ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-on-surface'
              }`}>
                {isReeferActive ? 'ACTIVE' : 'RELAXED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Stage Solver Status Pipeline Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md mb-space-lg">
        {/* Step 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded shadow-xs flex items-start gap-space-md relative overflow-hidden">
          <div className="w-8 h-8 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">Stage 1: Ingestion &amp; Demand</span>
              <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
            </div>
            <div className="font-headline-sm text-headline-sm text-on-surface">Demand &amp; Lead-Time</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">14,820u demand matrix modeled across 12 origin DCs.</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary"></div>
        </div>

        {/* Step 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded shadow-xs flex items-start gap-space-md relative overflow-hidden">
          <div className="w-8 h-8 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">memory</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-primary font-semibold uppercase">Stage 2: MILP Optimization</span>
              <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
            </div>
            <div className="font-headline-sm text-headline-sm text-on-surface">GLPK v5.2 Converged</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">4,120 constraints evaluated, 0 unassigned critical SKUs.</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary"></div>
        </div>

        {/* Step 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded shadow-xs flex items-start gap-space-md relative overflow-hidden">
          <div className="w-8 h-8 rounded bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase">Stage 3: Safety Audit</span>
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
            </div>
            <div className="font-headline-sm text-headline-sm text-on-surface">Post-Solver Clearance</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">100% FEFO &amp; warehouse physical volume verified.</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-tertiary"></div>
        </div>
      </div>

      {/* Prominent Independent Constraint Checker Banner */}
      <div className="bg-surface-container-low rounded p-space-md mb-space-lg shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface">INDEPENDENT CONSTRAINT CHECK: PASSED (18/18 CHECKS)</span>
              <span className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary font-code text-[11px] font-semibold uppercase tracking-wider">
                CLEARED FOR WMS DISPATCH
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              <strong className="text-on-surface font-medium">CRITICAL COMPLIANCE GATE:</strong> Independent safety auditor verified zero negative stock inventories, zero shelf-life breaches upon arrival, and all route freight agreements validated. Dispatch instructions are locked and legally authorized for WMS ingestion.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded shadow-xs text-outline font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">lock_clock</span>
          <span>Authorization Hash: <span className="font-code text-on-surface font-medium">0x88F2...4E9A</span></span>
        </div>
      </div>

      {/* Before vs. After Comparison KPI Suite (4 Metric Blocks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded p-space-md shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Expected Unmet Demand</span>
            <span className="material-symbols-outlined text-outline text-[16px]">production_quantity_limits</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-code">1,420 u</span>
              <span className="text-outline font-code text-body-sm">was 14,820 u</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">Exposure: $32.8k (was $342.5k)</span>
              <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code font-bold">-90.4%</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-space-xs">
            <div className="bg-primary h-full rounded-full" style={{ width: '90.4%' }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded p-space-md shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Expected Expiry Loss (FEFO)</span>
            <span className="material-symbols-outlined text-outline text-[16px]">hourglass_bottom</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-code">420 u</span>
              <span className="text-outline font-code text-body-sm">was 3,150 u</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">Loss: $10.5k (was $78.2k)</span>
              <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code font-bold">-86.7%</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-space-xs">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '86.7%' }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded p-space-md shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Scheduled Freight &amp; Transfer</span>
            <span className="material-symbols-outlined text-outline text-[16px]">local_shipping</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-code">$64,850</span>
              <span className="text-outline font-code text-body-sm">was $184,200</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">Scheduled FTL/LTL Multi-drop</span>
              <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code font-bold">-$119,350</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-space-xs">
            <div className="bg-secondary h-full rounded-full" style={{ width: '64.8%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded p-space-md shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Checker Integrity Status</span>
            <span className="material-symbols-outlined text-primary text-[16px]">rule</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-primary font-code">PASSED (100%)</span>
              <span className="text-on-surface font-code text-body-sm">0 Violations</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">142 route pairs / 84 cold-chain rules</span>
              <span className="text-primary font-code font-bold">VERIFIED</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-space-xs">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Filter & Operational Toolbar */}
      <div className="bg-surface-container-lowest rounded p-space-sm shadow-xs mb-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-body-sm font-body-sm bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              placeholder="Search SKU, Batch, or Route..."
            />
          </div>

          {/* Origin DC Dropdown */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="bg-surface-container-low px-2.5 py-1 rounded text-body-sm font-body-sm text-on-surface border-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All">Origin: All DCs (12)</option>
            <option value="DC-East-01">DC-East-01 (Allentown)</option>
            <option value="DC-East-02">DC-East-02 (Newark)</option>
            <option value="DC-Cent-04">DC-Cent-04 (Columbus)</option>
            <option value="DC-South-01">DC-South-01 (Atlanta)</option>
            <option value="DC-Midw-02">DC-Midw-02 (Chicago)</option>
            <option value="DC-South-02">DC-South-02 (Memphis)</option>
            <option value="DC-West-01">DC-West-01 (Reno)</option>
          </select>

          {/* Dest Hub Dropdown */}
          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="bg-surface-container-low px-2.5 py-1 rounded text-body-sm font-body-sm text-on-surface border-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All">Destination: All Hubs</option>
            <option value="DC-East-01">DC-East-01 (Allentown)</option>
            <option value="HUB-NY-04">HUB-NY-04 (Queens)</option>
            <option value="HUB-BOS-02">HUB-BOS-02 (Boston)</option>
            <option value="HUB-PHL-01">HUB-PHL-01 (Penn)</option>
            <option value="HUB-DTW-01">HUB-DTW-01 (Detroit)</option>
            <option value="HUB-MIA-03">HUB-MIA-03 (Miami)</option>
            <option value="HUB-SEA-01">HUB-SEA-01 (Seattle)</option>
          </select>

          {/* Class Dropdown */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-surface-container-low px-2.5 py-1 rounded text-body-sm font-body-sm text-on-surface border-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="All">Class: All Thermal Grades</option>
            <option value="2-8">Cold-Chain (2-8°C)</option>
            <option value="cryo">Cryogenic (-20°C)</option>
            <option value="amb">Ambient Standard</option>
          </select>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-space-xs shrink-0 pt-2 lg:pt-0">
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">file_download</span>
            Export CSV
          </button>
          <button
            onClick={handleSendToWms}
            className="px-3 py-1 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            Send to WMS / SAP S/4
          </button>
        </div>
      </div>

      {/* Primary Allocation Plan Data Grid */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden mb-space-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-2.5 px-space-md font-semibold">Gate</th>
                <th className="py-2.5 px-space-sm font-semibold">Origin DC</th>
                <th className="py-2.5 px-space-sm font-semibold">Batch &amp; Expiry</th>
                <th className="py-2.5 px-space-sm font-semibold">SKU Code &amp; Description</th>
                <th className="py-2.5 px-space-sm font-semibold">Destination Hub</th>
                <th className="py-2.5 px-space-sm font-semibold text-right">Allocated Qty</th>
                <th className="py-2.5 px-space-sm font-semibold">Transit &amp; ETA</th>
                <th className="py-2.5 px-space-sm font-semibold">Shelf Life @ Arr</th>
                <th className="py-2.5 px-space-sm font-semibold text-right">Freight &amp; Mode</th>
                <th className="py-2.5 px-space-md font-semibold text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm divide-y-0">
              {filteredItems.map((item) => {
                const isSelected = selectedItem.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleTraceClick(item)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-surface-container-low/90 ring-1 ring-inset ring-primary/30'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    {/* Gate */}
                    <td className="py-2.5 px-space-md whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[12px]">verified</span> PASSED
                      </span>
                    </td>

                    {/* Origin */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface font-code">{item.originDc}</span>
                        <span className="text-outline text-[11px]">{item.originCity}</span>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-code font-semibold text-on-surface">{item.batchNumber}</span>
                        <span className="text-outline text-[11px]">Exp: {item.expiryDate}</span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-space-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-code font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            {item.skuCode}
                          </span>
                          <span
                            className={`px-1 py-0.2 rounded font-code text-[10px] ${
                              item.temperatureClass === '2-8°C'
                                ? 'bg-secondary-fixed text-on-secondary-fixed'
                                : item.temperatureClass === '-20°C'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : 'bg-surface-container text-on-surface'
                            }`}
                          >
                            {item.temperatureClass === 'Ambient' ? 'AMB' : item.temperatureClass}
                          </span>
                        </div>
                        <span className="text-on-surface-variant truncate max-w-[210px]" title={item.skuName}>
                          {item.skuName}
                        </span>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface font-code">{item.destinationHub}</span>
                        <span className="text-outline text-[11px]">{item.destinationCity}</span>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap text-right">
                      <span className={`font-code font-bold text-[13px] px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-primary-fixed/20 text-primary' : 'text-on-surface'
                      }`}>
                        +{item.allocatedUnits.toLocaleString()} u
                      </span>
                    </td>

                    {/* Transit & ETA */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-code text-on-surface">{item.transitTimeHours} hrs</span>
                        <span className="text-outline text-[11px]">ETA: {item.eta}</span>
                      </div>
                    </td>

                    {/* Shelf Life */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-code font-bold ${item.shelfLifeAtArrivalDays < 20 ? 'text-error' : 'text-on-surface'}`}>
                          {item.shelfLifeAtArrivalDays} Days
                        </span>
                        <span className={`px-1 py-0.2 rounded font-code text-[10px] ${
                          item.shelfLifeAtArrivalDays < 20
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}>
                          {item.shelfLifeAtArrivalDays < 20 ? 'FEFO Warn' : item.shelfLifeAtArrivalDays > 100 ? 'Optimal' : 'SLA >30d'}
                        </span>
                      </div>
                    </td>

                    {/* Freight */}
                    <td className="py-2.5 px-space-sm whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-code font-medium text-on-surface">${item.freightCost.toLocaleString()}</span>
                        <span className="text-outline text-[10px]">{item.freightMode}</span>
                      </div>
                    </td>

                    {/* Audit / Trace button */}
                    <td className="py-2.5 px-space-md whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTraceClick(item);
                        }}
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-highest/60 hover:bg-surface-container text-primary'
                        }`}
                      >
                        Trace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="p-space-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="font-medium text-on-surface">Showing {filteredItems.length} of {items.length} Optimized Dispatches</span>
            <span className="text-outline-variant">•</span>
            <span>
              Total Rebalanced Volume:{' '}
              <strong className="text-on-surface font-code">
                {items.reduce((acc, c) => acc + c.allocatedUnits, 0).toLocaleString()} units
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded bg-surface-container-lowest text-outline hover:text-on-surface disabled:opacity-40" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-primary text-on-primary font-bold">1</button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container">2</button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container">3</button>
            <span className="px-1">...</span>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container">12</button>
            <button className="px-2 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container">Next</button>
          </div>
        </div>
      </div>

      {/* Interactive Solver Trace / Deep Inspection Panel */}
      <div className="bg-surface-container-lowest rounded shadow-xs p-space-lg mb-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-space-md gap-space-sm border-b border-surface-container-high/40">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">Solver Trace: Priority Dispatch Inspection</span>
                <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code text-[10px] font-bold uppercase">
                  FEFO PRESERVATION RANK 1
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-code">
                Transfer ID: <strong className="text-on-surface">DSP-2025-05-{selectedItem.skuCode.replace('SKU-', '')}</strong> | Batch: {selectedItem.batchNumber} | {selectedItem.skuCode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
            <span className="text-outline">MILP Objective Contribution:</span>
            <span className="font-code font-bold text-primary">-$48,420 Margin Preserved</span>
          </div>
        </div>

        {/* Trace Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg pt-space-md">
          {/* Route & Temperature Assurance Column */}
          <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded">
            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">route</span>
              Origin to Destination Corridor
            </span>
            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Origin Facility:</span>
                <span className="font-code font-semibold text-on-surface">{selectedItem.originDc} ({selectedItem.originCity})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Destination Hub:</span>
                <span className="font-code font-semibold text-on-surface">{selectedItem.destinationHub} ({selectedItem.destinationCity})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Physical Distance / Transit:</span>
                <span className="font-code text-on-surface">94 Miles / {selectedItem.transitTimeHours} Hours Buffer</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cold-Chain Carrier:</span>
                <span className="font-code text-on-surface">{selectedItem.freightMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Temp Specification:</span>
                <span className="font-code text-primary font-bold">{selectedItem.temperatureClass} Monitored</span>
              </div>
            </div>
          </div>

          {/* FEFO & Stockout Prevention Vector */}
          <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded">
            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">trending_up</span>
              Stockout Prevention Vector
            </span>
            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Pre-Dispatch Stock:</span>
                <span className="font-code font-bold text-error">42 units (Stockout in 14h)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hospital Surge Demand (Day 2-5):</span>
                <span className="font-code text-on-surface">1,180 units projected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Post-Arrival Stock Level:</span>
                <span className="font-code font-bold text-primary">
                  {(selectedItem.allocatedUnits + 42).toLocaleString()} units (6.8 Days Coverage)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Salvaged Margin vs Stockout:</span>
                <span className="font-code text-on-surface font-semibold">$52,800 gross</span>
              </div>
              <div className="flex items-center justify-between">
                <span>FEFO Shelf-Life Margin:</span>
                <span className="font-code text-on-surface">{selectedItem.shelfLifeAtArrivalDays} Days remaining (&gt;30d gate)</span>
              </div>
            </div>
          </div>

          {/* Independent Safety Validator Proof */}
          <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded">
            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-tertiary">gavel</span>
              Deterministic Auditor Verdict
            </span>
            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Origin Inventory Balance ≥ 0:</span>
                <span className="font-code text-primary font-bold">PASS (Residual: +340u)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dock Staging Bay Availability:</span>
                <span className="font-code text-primary font-bold">PASS (Dock 12 Reserved)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Driver Hours of Service SLA:</span>
                <span className="font-code text-primary font-bold">PASS (Single shift compliant)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>FEFO Arrival SLA &gt; Threshold:</span>
                <span className="font-code text-primary font-bold">PASS ({selectedItem.shelfLifeAtArrivalDays}d &gt; 30d baseline)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WMS EDI Handshake Status:</span>
                <span className="font-code text-primary font-bold">READY (EDI-856 Formatted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation & Workflow Completion Bar */}
      <div className="sticky bottom-0 bg-surface-container-lowest border-t border-surface-container-high/40 p-space-md rounded-t shadow-lg flex flex-col sm:flex-row items-center justify-between gap-space-md z-30">
        <div className="flex items-center gap-space-sm">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-sm text-label-sm font-bold">
            3
          </div>
          <div className="flex flex-col">
            <span className="font-body-md text-body-md font-semibold text-on-surface">Stage 3 of 5 Complete: Allocation Plan Verified</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Ready to examine fine-grained transfer recommendations or commit to execution.</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <button
            onClick={() => onNavigate('risk-overview')}
            className="px-3 py-1.5 rounded bg-surface-container-low text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Risk Overview
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md font-medium hover:bg-surface-container-low transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">description</span>
            Export Dispatch Manifest
          </button>
          <button
            onClick={() => {
              onSelectSku(selectedItem.skuCode);
              onNavigate('recommendation-detail');
            }}
            className="px-4 py-1.5 rounded bg-primary text-on-primary font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Proceed to Recommendation Detail</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* What-If Modal */}
      <WhatIfModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        baseQty={selectedItem.allocatedUnits}
        skuCode={selectedItem.skuCode}
        onApply={handleApplyWhatIf}
      />
    </div>
  );
};
