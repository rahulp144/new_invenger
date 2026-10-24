import React, { useState } from 'react';
import { DispatchItem } from '../types';

interface SupplyAllocationViewProps {
  items: DispatchItem[];
  onSelectSku: (skuCode: string) => void;
  onNavigate: (view: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SupplyAllocationView: React.FC<SupplyAllocationViewProps> = ({
  items,
  onSelectSku,
  onNavigate,
  onShowToast
}) => {
  const [showNotice, setShowNotice] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planningRegion, setPlanningRegion] = useState('North America East (Tier 1 & 2)');
  const [productFamily, setProductFamily] = useState('SKU Group A - Temp Sensitive');
  const [fulfillmentHorizon, setFulfillmentHorizon] = useState('Next 14 Days (Daily)');
  const [inTransitStock, setInTransitStock] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRetryingERP, setIsRetryingERP] = useState(false);
  const [erpStatus, setErpStatus] = useState<string>('Error 504 (Gateway Timeout)');
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);

  // Column visibility state
  const [columns, setColumns] = useState({
    skuCode: true,
    description: true,
    location: true,
    onHand: true,
    safetyThreshold: true,
    daysSupply: true,
    recommendation: true,
    status: true,
    action: true
  });

  const handleApplyFilters = () => {
    onShowToast(`Filters applied: ${planningRegion} • ${productFamily}`, 'success');
  };

  const handleResetFilters = () => {
    setPlanningRegion('North America East (Tier 1 & 2)');
    setProductFamily('SKU Group A - Temp Sensitive');
    setFulfillmentHorizon('Next 14 Days (Daily)');
    setInTransitStock(true);
    setSearchTerm('');
    onShowToast('Filters reset to default scenario', 'info');
  };

  const handleRetryHandshake = () => {
    setIsRetryingERP(true);
    setTimeout(() => {
      setIsRetryingERP(false);
      setErpStatus('Handshake Restored (200 OK • Latency: 42ms)');
      onShowToast('ERP SAP S/4HANA connector re-established successfully', 'success');
    }, 1200);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,SKU Code,Description,Location,On-Hand,Safety Threshold,Days Supply,Status\n' +
      items.map((i) => `"${i.skuCode}","${i.productName}","${i.originDc}","${i.onHand || 0}","${i.safetyThreshold || 0}","${i.daysSupply || 0}","${i.statusLabel || ''}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Optiqo_Allocation_Queue_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported CSV with 1,248 allocation items', 'success');
  };

  const filteredItems = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.skuCode.toLowerCase().includes(query) ||
      item.productName.toLowerCase().includes(query) ||
      item.originDc.toLowerCase().includes(query) ||
      item.originCity.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-lg max-w-[1600px] mx-auto">
      {/* 1. TOP NOTICE / OPERATIONAL ALERT BANNER */}
      {showNotice && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-amber-50/95 border border-amber-200/60 shadow-xs gap-space-md transition-all duration-200"
          id="simulated-run-banner"
        >
          <div className="flex items-start gap-space-sm min-w-0">
            <span className="material-symbols-outlined text-amber-700 text-[20px] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Operational Notice:
                </span>
                <span className="font-body-md text-[13px] font-bold text-amber-950">
                  SIMULATED RUN CONTEXT
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-amber-900 mt-0.5 leading-snug">
                Inventory levels, lead times, and dispatch routes reflect simulated stress-test parameters
                for Q2 allocation planning. Verify baseline telemetry in{' '}
                <button
                  onClick={() => onNavigate('data-validation')}
                  className="font-semibold underline decoration-amber-500 hover:text-amber-950 cursor-pointer"
                >
                  Data &amp; Validation
                </button>{' '}
                before approving automated dispatch orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs flex-shrink-0 self-end sm:self-center">
            <button
              onClick={() => onNavigate('data-validation')}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-label-sm text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">troubleshoot</span>
              <span>View Validation Logs</span>
            </button>
            <button
              onClick={() => setShowNotice(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-800 hover:bg-amber-200/70 transition-colors cursor-pointer"
              title="Dismiss notice"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. STREAMLIT-STYLE COMPACT CONTROL PANEL (GLOBAL FILTER BAR) */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
            <span className="font-label-lg text-label-lg uppercase tracking-wider text-on-surface">
              Global Scenario Parameters
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code text-code text-on-surface-variant font-medium">
              st.experimental_fragment
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-outline">Preset:</span>
            <span className="font-body-sm text-body-sm font-semibold text-primary">
              Standard Operational (14D)
            </span>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-space-sm items-end pt-space-xs">
          {/* Control 1 */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="font-label-sm text-label-sm font-medium text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
              Planning Region
            </label>
            <div className="relative">
              <select
                value={planningRegion}
                onChange={(e) => setPlanningRegion(e.target.value)}
                className="w-full h-8 pl-2 pr-7 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer border border-surface-container-high"
              >
                <option>North America East (Tier 1 &amp; 2)</option>
                <option>North America Midwest Central</option>
                <option>EMEA Central Distribution Hub</option>
                <option>APAC Southern Cross-Dock</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Control 2 */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="font-label-sm text-label-sm font-medium text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-outline">category</span>
              Product Family
            </label>
            <div className="relative">
              <select
                value={productFamily}
                onChange={(e) => setProductFamily(e.target.value)}
                className="w-full h-8 pl-2 pr-7 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer border border-surface-container-high"
              >
                <option>SKU Group A - Temp Sensitive</option>
                <option>SKU Group B - Ambient Consumables</option>
                <option>SKU Group C - Hazardous Solvents</option>
                <option>SKU Group D - Sterile Implements</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Control 3 */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="font-label-sm text-label-sm font-medium text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-outline">timelapse</span>
              Fulfillment Horizon
            </label>
            <div className="relative">
              <select
                value={fulfillmentHorizon}
                onChange={(e) => setFulfillmentHorizon(e.target.value)}
                className="w-full h-8 pl-2 pr-7 bg-surface-container-low rounded-lg font-body-sm text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer border border-surface-container-high"
              >
                <option>Next 14 Days (Daily)</option>
                <option>Next 30 Days (Weekly aggregated)</option>
                <option>Next 48 Hours (Tactical Shift)</option>
                <option>Current Fiscal Quarter (Macro)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Control 4: Date Range */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="font-label-sm text-label-sm font-medium text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-outline">calendar_today</span>
              Analysis Window
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full h-8 pl-2 pr-7 bg-surface-container-low rounded-lg font-code text-[11px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high"
                readOnly
                type="text"
                value="May 12, 2025 - May 26, 2025"
              />
              <span className="material-symbols-outlined absolute right-2 text-[14px] text-outline pointer-events-none">
                event
              </span>
            </div>
          </div>

          {/* Control 5: Toggle Switch */}
          <div className="flex flex-col justify-end h-8 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                checked={inTransitStock}
                onChange={(e) => setInTransitStock(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                type="checkbox"
              />
              <span className="font-body-sm text-[12px] text-on-surface font-medium leading-tight">
                In-Transit Safety Stock
              </span>
            </label>
          </div>

          {/* Control 6: Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleResetFilters}
              className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-medium transition-colors cursor-pointer"
              type="button"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="h-8 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-[12px] font-semibold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt</span>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. REUSABLE KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-semibold tracking-wider">
              Total SKUs Monitored
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-display-sm text-[26px] font-bold text-on-surface tracking-tight font-code">
              14,280
            </span>
            <span className="font-code text-[12px] text-primary font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>3.2%
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs bg-surface-container-low px-2 py-1 rounded-lg">
            <span className="font-body-sm text-[11px]">12 Distribution Nodes</span>
            <span className="font-label-sm text-[10px] text-outline">Cycle W18</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-semibold tracking-wider text-error">
              Stockout Risk Threshold
            </span>
            <span className="material-symbols-outlined text-[18px] text-error">error</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-display-sm text-[26px] font-bold text-error tracking-tight font-code">
              42
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container font-label-sm text-[10px] text-on-error-container font-bold uppercase tracking-wider">
              Critical
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs bg-surface-container-low px-2 py-1 rounded-lg">
            <span className="font-body-sm text-[11px] font-medium text-error">Est. Stockout &lt; 48 hrs</span>
            <span className="font-code text-[10px] text-outline">6 nodes</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-semibold tracking-wider">
              Projected Service Level
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-display-sm text-[26px] font-bold text-on-surface tracking-tight font-code">
              97.4%
            </span>
            <span className="font-code text-[12px] text-amber-700 font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>-0.6%
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs bg-surface-container-low px-2 py-1 rounded-lg">
            <span className="font-body-sm text-[11px]">
              Target: <strong className="text-on-surface font-semibold">98.0%</strong>
            </span>
            <span className="font-label-sm text-[10px] text-amber-800 font-medium">Sub-optimal</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-semibold tracking-wider">
              Engine Solver Status
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">memory</span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-[22px] font-bold text-primary tracking-tight truncate">
              Converged
            </span>
            <span className="font-label-sm text-[11px] text-outline font-code">#8842</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant pt-space-xs bg-surface-container-low px-2 py-1 rounded-lg">
            <span className="font-code text-[11px] text-on-surface">MIP-GLPK v5.2</span>
            <span className="font-code text-[10px] text-outline">42.8s solve</span>
          </div>
        </div>
      </div>

      {/* 4. REUSABLE STATUS BADGES & TAGS SHOWCASE BAR */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col gap-space-xs">
        <div className="flex items-center justify-between border-b pb-space-xs border-surface-container-high">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[16px]">sell</span>
            <span className="font-label-lg text-label-lg uppercase tracking-wider text-on-surface">
              Optiqo Standard Design Token Status Badges
            </span>
          </div>
          <span className="font-code text-code text-outline">vyrox.ui.chips.v1</span>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap pt-space-xs">
          {/* Success Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-semibold shadow-2xs border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Optimal (Green)</span>
            <span className="font-code text-[10px] text-emerald-700/80 ml-1">SL &gt; 98.5%</span>
          </div>
          {/* Warning Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-label-sm text-label-sm font-semibold shadow-2xs border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>Stockout Imminent (Amber)</span>
            <span className="font-code text-[10px] text-amber-800/80 ml-1">DoH &lt; 5d</span>
          </div>
          {/* Error Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 font-label-sm text-label-sm font-semibold shadow-2xs border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Lead Time Breach (Red)</span>
            <span className="font-code text-[10px] text-rose-700/80 ml-1">&gt; 72h Delay</span>
          </div>
          {/* Info Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 font-label-sm text-label-sm font-semibold shadow-2xs border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            <span>In-Transit Allocation (Blue)</span>
            <span className="font-code text-[10px] text-sky-700/80 ml-1">ASN Active</span>
          </div>
          {/* Neutral / Context Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold shadow-2xs border border-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-outline"></span>
            <span>Simulated Scenario (Slate)</span>
            <span className="font-code text-[10px] text-outline ml-1">Param #4</span>
          </div>
          {/* Metric Highlight Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-label-sm text-label-sm font-semibold shadow-2xs border border-primary/20">
            <span className="material-symbols-outlined text-[13px]">bolt</span>
            <span>Optimizer Preferred</span>
          </div>
        </div>
      </div>

      {/* 5. OPERATIONAL DATA TABLE (HIGH DENSITY ENTERPRISE GRID) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container flex flex-col overflow-hidden">
        {/* Table Header / Controls */}
        <div className="p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container-lowest border-b border-surface-container">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Active DC Inventory &amp; Allocation Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-code text-code text-outline">
                {filteredItems.length} of 1,248 Items
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Recommended rebalancing transfers based on GLPK-v5.2 multi-echelon cost optimization.
            </p>
          </div>
          <div className="flex items-center gap-space-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
                placeholder="Search SKU, DC, or family..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-outline pointer-events-none">
                search
              </span>
            </div>
            <button
              onClick={() => setShowColumnsModal(!showColumnsModal)}
              className="h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1 cursor-pointer"
              title="Customize columns"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">view_column</span>
              <span className="hidden md:inline">Columns</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1 cursor-pointer"
              title="Export current view"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Columns Customizer Drawer/Popover */}
        {showColumnsModal && (
          <div className="p-3 bg-surface-container-low border-b border-surface-container flex items-center gap-4 flex-wrap text-[11px] font-label-sm">
            <span className="font-bold text-on-surface">Toggle Columns:</span>
            {Object.keys(columns).map((colKey) => (
              <label key={colKey} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(columns as any)[colKey]}
                  onChange={(e) =>
                    setColumns({ ...columns, [colKey]: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-0 accent-primary"
                />
                <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        )}

        {/* Data Table Body */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none border-b border-surface-container">
                {columns.skuCode && <th className="py-2.5 px-space-md font-semibold">SKU Code</th>}
                {columns.description && <th className="py-2.5 px-space-md font-semibold">Product Description</th>}
                {columns.location && <th className="py-2.5 px-space-md font-semibold">Node Location</th>}
                {columns.onHand && <th className="py-2.5 px-space-md font-semibold text-right">On-Hand</th>}
                {columns.safetyThreshold && <th className="py-2.5 px-space-md font-semibold text-right">Safety Threshold</th>}
                {columns.daysSupply && <th className="py-2.5 px-space-md font-semibold text-center">Days Supply</th>}
                {columns.recommendation && <th className="py-2.5 px-space-md font-semibold">Optimizer Recommendation</th>}
                {columns.status && <th className="py-2.5 px-space-md font-semibold text-center">Status</th>}
                {columns.action && <th className="py-2.5 px-space-md font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
              {filteredItems.map((item) => {
                const isCritical = item.statusLabel === 'Critical Risk';
                const isRebalance = item.statusLabel === 'Rebalance';
                const isSurplus = item.statusLabel === 'Surplus';
                const isStable = item.statusLabel === 'Stable';
                const isInTransit = item.statusLabel === 'In-Transit';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/60 transition-colors group"
                  >
                    {columns.skuCode && (
                      <td className="py-2.5 px-space-md font-code text-code font-semibold text-primary">
                        <button
                          onClick={() => onSelectSku(item.skuCode)}
                          className="hover:underline text-left cursor-pointer"
                        >
                          {item.skuCode}
                        </button>
                      </td>
                    )}
                    {columns.description && (
                      <td className="py-2.5 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface truncate max-w-[220px]">
                            {item.productName}
                          </span>
                          <span className="font-label-sm text-label-sm text-outline">
                            {item.tempClass === '2-8°C'
                              ? 'Healthcare Diagnostics (2-8°C)'
                              : item.tempClass === '-20°C'
                              ? 'Bio-Banking (-20°C)'
                              : 'Medical Consumables'}
                          </span>
                        </div>
                      </td>
                    )}
                    {columns.location && (
                      <td className="py-2.5 px-space-md font-code text-code">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-outline">warehouse</span>
                          <span>
                            {item.originDc} ({item.originCity.split(',')[0]})
                          </span>
                        </div>
                      </td>
                    )}
                    {columns.onHand && (
                      <td
                        className={`py-2.5 px-space-md text-right font-code text-code font-semibold ${
                          isCritical
                            ? 'text-error'
                            : isRebalance
                            ? 'text-amber-800'
                            : isSurplus
                            ? 'text-sky-800'
                            : 'text-on-surface'
                        }`}
                      >
                        {item.onHand?.toLocaleString()}
                      </td>
                    )}
                    {columns.safetyThreshold && (
                      <td className="py-2.5 px-space-md text-right font-code text-code text-outline">
                        {item.safetyThreshold?.toLocaleString()}
                      </td>
                    )}
                    {columns.daysSupply && (
                      <td className="py-2.5 px-space-md text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-code text-code font-semibold ${
                            isCritical
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : isRebalance
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : isStable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical
                                ? 'bg-rose-600 animate-pulse'
                                : isRebalance
                                ? 'bg-amber-600'
                                : isStable
                                ? 'bg-emerald-600'
                                : 'bg-sky-600'
                            }`}
                          ></span>
                          {item.daysSupply} Days
                        </span>
                      </td>
                    )}
                    {columns.recommendation && (
                      <td className="py-2.5 px-space-md font-body-sm text-body-sm">
                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            isCritical
                              ? 'text-primary'
                              : isSurplus
                              ? 'text-secondary'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isCritical
                              ? 'forward'
                              : isSurplus
                              ? 'call_split'
                              : isInTransit
                              ? 'local_shipping'
                              : 'swap_horiz'}
                          </span>
                          <span>{item.recommendationText}</span>
                        </div>
                      </td>
                    )}
                    {columns.status && (
                      <td className="py-2.5 px-space-md text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-label-sm text-[11px] font-semibold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-error-container text-on-error-container'
                              : isRebalance
                              ? 'bg-amber-100 text-amber-900'
                              : isStable
                              ? 'bg-emerald-100 text-emerald-900'
                              : isSurplus
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      </td>
                    )}
                    {columns.action && (
                      <td className="py-2.5 px-space-md text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectSku(item.skuCode)}
                            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => onShowToast(`SKU options opened for ${item.skuCode}`, 'info')}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container text-outline hover:text-on-surface cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-space-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-body-sm text-body-sm gap-2">
          <span className="font-label-sm text-label-sm">
            Showing 1 to {filteredItems.length} of 1,248 allocation line items
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded bg-surface-container font-label-sm text-label-sm transition-colors ${
                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high cursor-pointer'
              }`}
              type="button"
            >
              Previous
            </button>
            <span
              onClick={() => setCurrentPage(1)}
              className={`px-2.5 py-1 rounded font-label-sm text-label-sm font-bold cursor-pointer ${
                currentPage === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              1
            </span>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                currentPage === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'
              }`}
              type="button"
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                currentPage === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'
              }`}
              type="button"
            >
              3
            </button>
            <span className="px-1 text-outline">...</span>
            <button
              onClick={() => setCurrentPage(250)}
              className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
              type="button"
            >
              250
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 6. SECONDARY COMPONENT PATTERNS ROW (SPLIT 2-COLUMN LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Left Column: Alert & Exception Banners Pattern */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b pb-space-xs border-surface-container-high">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline text-[18px]">announcement</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Operational Notification Patterns
              </span>
            </div>
            <span className="font-code text-code text-outline">vyrox.alerts</span>
          </div>
          <div className="flex flex-col gap-space-sm">
            {/* Critical Error Pattern Banner */}
            <div className="p-space-sm rounded-lg bg-rose-50 border-l-4 border-rose-600 flex items-start gap-space-sm shadow-2xs">
              <span className="material-symbols-outlined text-rose-600 text-[20px] flex-shrink-0 mt-0.5">
                sync_problem
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-body-md text-body-md font-bold text-rose-950">
                  Connection Latency: ERP SAP S/4HANA
                </span>
                <p className="font-body-sm text-body-sm text-rose-900 mt-0.5">
                  Node DC-West-02 real-time inventory feed delayed. Cached baseline as of 06:00 UTC is
                  currently utilized for constraints.
                </p>
                <div className="flex items-center gap-space-sm mt-2 flex-wrap">
                  <button
                    onClick={handleRetryHandshake}
                    disabled={isRetryingERP}
                    className="text-rose-950 hover:underline font-label-sm text-label-sm font-semibold flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className={`material-symbols-outlined text-[14px] ${isRetryingERP ? 'animate-spin' : ''}`}>
                      refresh
                    </span>{' '}
                    {isRetryingERP ? 'Testing Socket...' : 'Retry Handshake'}
                  </button>
                  <span className="text-rose-400">•</span>
                  <span className="font-code text-code text-rose-800">{erpStatus}</span>
                </div>
              </div>
            </div>

            {/* Informational Scheduled Solver Banner */}
            <div className="p-space-sm rounded-lg bg-sky-50 border-l-4 border-sky-600 flex items-start gap-space-sm shadow-2xs">
              <span className="material-symbols-outlined text-sky-600 text-[20px] flex-shrink-0 mt-0.5">
                schedule
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md text-body-md font-bold text-sky-950">
                  Scheduled Solver Execution
                </span>
                <p className="font-body-sm text-body-sm text-sky-900 mt-0.5">
                  Next scheduled batch solver execution in <strong>2 hours 18 minutes</strong>{' '}
                  (FY25-W18-NightlyRun). Planners may queue parameter changes until 22:00 EST.
                </p>
              </div>
            </div>

            {/* Micro Metric Delta Strip */}
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  Solver Convergence Guarantee:
                </span>
              </div>
              <span className="font-code text-code text-primary font-bold">100% Feasible Solutions</span>
            </div>
          </div>
        </div>

        {/* Right Column: System State Templates (Empty & Loading preview) */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b pb-space-xs border-surface-container-high">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline text-[18px]">widgets</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                System State Templates (UX Snippets)
              </span>
            </div>
            <span className="font-code text-code text-outline">st.empty / st.status</span>
          </div>
          <div className="flex flex-col gap-space-sm">
            {/* Reusable Empty State Container */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col items-center text-center justify-center border-dashed border-2 border-surface-container-high py-6">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline mb-2">
                <span className="material-symbols-outlined text-[22px]">playlist_add_check</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                No Manual Overrides Pending
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
                All recommended allocations conform to automated multi-echelon safety stock policies.
              </p>
              <button
                onClick={() => setShowCreateRuleModal(true)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Create Manual Rule</span>
              </button>
            </div>

            {/* Reusable Loading State Preview */}
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-space-sm">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    Calculating rebalance matrix...
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    Step 3 of 4: Cost minimization LP relaxed
                  </span>
                </div>
              </div>
              <span className="font-code text-code text-primary font-semibold">78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. STREAMLIT & PLOTLY IMPLEMENTATION NOTES CALLOUT */}
      <div className="bg-surface-container p-space-md rounded-xl flex items-start gap-space-md shadow-2xs border border-surface-container-high">
        <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">
          developer_board
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-lg text-label-lg uppercase tracking-wider text-primary font-bold">
              Vyrox Engineering Implementation Contract
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest font-code text-code text-on-surface font-medium">
              Streamlit &amp; Plotly Integration
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
            This operational view adheres strictly to the Vyrox layout specification. Streamlit pages can map
            these components directly to:{' '}
            <code className="font-code text-code px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface">
              st.sidebar
            </code>{' '}
            (left controls),{' '}
            <code className="font-code text-code px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface">
              st.columns([1,1,1,1])
            </code>{' '}
            (KPI row),{' '}
            <code className="font-code text-code px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface">
              st.dataframe(..., use_container_width=True)
            </code>{' '}
            (high-density table), and{' '}
            <code className="font-code text-code px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface">
              plotly.graph_objects
            </code>{' '}
            themed with brand tokens (
            <span className="font-code text-code text-primary font-bold">#00685F</span> primary,{' '}
            <span className="font-code text-code text-secondary font-bold">#006398</span> secondary).
          </p>
        </div>
      </div>

      {/* 8. FOOTER METADATA BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-space-sm px-space-xs text-outline font-label-sm text-label-sm gap-2 border-t border-surface-container">
        <div className="flex items-center gap-space-xs flex-wrap">
          <span className="font-medium text-on-surface">Optiqo Optimization Suite v1.4.0</span>
          <span>•</span>
          <span className="font-code text-code">Dataset: NA-East-Dist-2025Q2_v4.parquet</span>
          <span>•</span>
          <span>SHA-256: 8fa72c49b</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Team VYROX Distribution Intelligence</span>
        </div>
      </div>

      {/* Create Manual Rule Modal */}
      {showCreateRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl border border-surface-container">
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">
              Create Manual Inventory Override
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Specify a temporary dispatch quota or safety stock floor for an active node.
            </p>
            <div className="flex flex-col gap-3 my-4">
              <div>
                <label className="text-[11px] font-label-sm uppercase text-outline">Target SKU</label>
                <select className="w-full mt-1 p-2 rounded bg-surface-container-low border border-surface-container-high text-body-sm">
                  <option>SKU-9921-X (Cold-Chain Reagent Pack v3)</option>
                  <option>SKU-4410-B (Saline Buffer Solution 500ml)</option>
                  <option>SKU-7731-M (Centrifuge Rotor Rings Type-A)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-label-sm uppercase text-outline">Target Node</label>
                <select className="w-full mt-1 p-2 rounded bg-surface-container-low border border-surface-container-high text-body-sm">
                  <option>DC-East-01 (Allentown, PA)</option>
                  <option>DC-East-02 (Newark Port, NJ)</option>
                  <option>DC-Cent-04 (Columbus, OH)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-label-sm uppercase text-outline">Minimum Floor Buffer (Units)</label>
                <input
                  type="number"
                  defaultValue={2000}
                  className="w-full mt-1 p-2 rounded bg-surface-container-low border border-surface-container-high text-body-sm font-code"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setShowCreateRuleModal(false)}
                className="px-3 py-1.5 rounded bg-surface-container text-body-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateRuleModal(false);
                  onShowToast('Manual rule policy created and registered with solver constraints', 'success');
                }}
                className="px-4 py-1.5 rounded bg-primary text-on-primary font-semibold text-body-sm cursor-pointer"
              >
                Save Override Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
