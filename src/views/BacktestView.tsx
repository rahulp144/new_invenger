import React, { useState } from 'react';
import { ViewMode } from '../types/index.ts';

interface BacktestViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const BacktestView: React.FC<BacktestViewProps> = ({ onShowToast }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(42);
  const [selectedHorizon, setSelectedHorizon] = useState('30d');
  const [activeTab, setActiveTab] = useState<'all' | 'unmet' | 'expiry' | 'freight'>('all');

  const handleRunBacktest = () => {
    setIsRunning(true);
    setProgress(10);
    onShowToast('Initializing discrete event simulation across 720 time steps...', 'info');

    const timer1 = setTimeout(() => setProgress(42), 400);
    const timer2 = setTimeout(() => setProgress(78), 900);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setIsRunning(false);
      onShowToast('Backtest complete! All 3 policies evaluated with seed_opt_88241_det', 'success');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleExportCsv = () => {
    const csv = `Indicator,Policy B1 (Min-Max),Policy B2 (Forecast ML),Policy Optiqo (MILP),Delta vs B2,Delta vs B1,Audit Status
On-Time In-Full (OTIF) Rate,78.4%,87.9%,99.1%,+11.2 pp,+20.7 pp,Optimal
Peak Stockout Duration,4.8 Days,2.1 Days,0.3 Days,-1.8 Days,-4.5 Days,Controlled
Lot Expiry Rate,6.24%,4.51%,0.94%,-3.57 pp,-5.30 pp,FEFO Passed
Multi-Drop Route Consolidation,22.0%,48.5%,84.2%,+35.7 pp,+62.2 pp,High Fill
Expedited Spot Shipments,42 loads ($67k),19 loads ($31k),1 load ($1.8k),-94.7%,-97.6%,Clean
Capacity & Cold-Chain Breaches,17 breaches,4 breaches,0 breaches,-100%,-100%,Zero-Violation
Execution Runtime,0.4s (Rule engine),4.2s (LightGBM),43.8s (MILP Simplex),+39.6s,+43.4s,Within SLA`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Optiqo_Policy_Benchmark_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported benchmark evaluation data grid as CSV', 'info');
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-space-lg">
      {/* Top State Bar & Header Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              Backtest &amp; Policy Benchmark
            </h1>
            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Benchmark Evaluated (3/3 Complete)
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
            Algorithmic comparison under identical discrete event simulation traces across three execution architectures:
            fixed heuristic min-max baseline (<span className="font-code font-medium">B1</span>), forward-looking forecast with static buffers (<span className="font-code font-medium">B2</span>), and Optiqo multi-echelon mixed-integer allocation (<span className="font-code font-medium text-primary">MILP</span>).
          </p>
        </div>

        {/* Actions & Run Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <button
            onClick={() => onShowToast('Config: Monte Carlo parameters locked to MT19937 seed 88241', 'info')}
            className="h-8 px-space-md rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md font-semibold hover:bg-surface-container-low transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">tune</span>
            <span>Config</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="h-8 px-space-md rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md font-semibold hover:bg-surface-container-low transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="h-8 px-space-md rounded bg-primary text-on-primary font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isRunning ? 'hourglass_top' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Simulating...' : 'Run Backtest'}</span>
          </button>
        </div>
      </div>

      {/* Parameter Bar & Configuration Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs">
        <div className="md:col-span-4 flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Evaluation Horizon
          </label>
          <div className="flex items-center justify-between h-8 px-2.5 rounded bg-surface-container-low font-body-sm text-body-sm text-on-surface font-medium">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">calendar_today</span>
              <span>Last 30 Days (Apr 15 - May 14, 2025)</span>
            </div>
            <span className="font-code text-[11px] text-on-surface-variant">720 intervals</span>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Simulation Seed &amp; Trace
          </label>
          <div className="flex items-center justify-between h-8 px-2.5 rounded bg-surface-container-low font-code text-body-sm text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[15px]">fingerprint</span>
              <span>seed_opt_88241_det</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant">
              MT19937
            </span>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Objective Loss Weights
          </label>
          <div className="flex items-center justify-between h-8 px-2.5 rounded bg-surface-container-low font-body-sm text-body-sm text-on-surface">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">balance</span>
              <span>
                Stockout (<span className="font-code font-semibold">1.0x</span>) + Expiry (<span className="font-code font-semibold">1.0x</span>) + Freight (<span className="font-code font-semibold">0.7x</span>)
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-semibold">
              Pareto Optimal
            </span>
          </div>
        </div>
      </div>

      {/* Policy Specification Architectural Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Policy B1 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-variant"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center font-code text-label-sm text-on-surface font-bold">
                B1
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Static Min-Max</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium">
              Historical Baseline
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Fixed <span className="font-code text-[11px] font-semibold">(s, S)</span> periodic inventory replenishment based on static 90-day averages. No forward-looking forecast integration. Lateral DC shipments trigger only upon hard local stockouts.
          </p>
          <div className="mt-auto pt-2 grid grid-cols-2 gap-2 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded">
            <div>Safety Buffer: <span className="font-semibold text-on-surface">Fixed 18d</span></div>
            <div>Coordination: <span className="font-semibold text-on-surface">Isolated DC</span></div>
            <div>Batch Routing: <span className="font-semibold text-on-surface">LIFO/Random</span></div>
            <div>Optimization: <span className="font-semibold text-on-surface">Rule-Based</span></div>
          </div>
        </div>

        {/* Policy B2 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-secondary-fixed flex items-center justify-center font-code text-label-sm text-on-secondary-fixed font-bold">
                B2
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Forecast-Informed</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-medium">
              Forward Demand ML
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Single-echelon rolling 14-day ML probabilistic forecast with localized safety stock scaling. Lacks global linear optimization, causing frequent regional inventory ping-ponging across distribution nodes.
          </p>
          <div className="mt-auto pt-2 grid grid-cols-2 gap-2 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded">
            <div>Safety Buffer: <span className="font-semibold text-on-surface">Dynamic Local</span></div>
            <div>Coordination: <span className="font-semibold text-on-surface">Point-to-Point</span></div>
            <div>Batch Routing: <span className="font-semibold text-on-surface">FEFO (Local)</span></div>
            <div>Optimization: <span className="font-semibold text-on-surface">Heuristic ML</span></div>
          </div>
        </div>

        {/* Policy Optiqo */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-primary text-on-primary flex items-center justify-center font-code text-label-sm font-bold">
                OPT
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Optiqo Multi-Echelon
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-bold tracking-wide">
              GLPK MILP Solver
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Global network optimization combining ensemble probabilistic demand distributions, multi-tier lead-time hedging, strict FEFO lot exhaustion, and consolidated multi-stop freight dispatching.
          </p>
          <div className="mt-auto pt-2 grid grid-cols-2 gap-2 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded">
            <div>Safety Buffer: <span className="font-semibold text-primary">Pareto Sliced</span></div>
            <div>Coordination: <span className="font-semibold text-primary">Multi-Echelon</span></div>
            <div>Batch Routing: <span className="font-semibold text-primary">Global FEFO</span></div>
            <div>Optimization: <span className="font-semibold text-primary">MILP (Simplex)</span></div>
          </div>
        </div>
      </div>

      {/* KPI Quantitative Summary Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1: Unmet Demand */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Unmet Demand Volume</span>
            <span className="material-symbols-outlined text-[18px] text-primary">production_quantity_limits</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight font-code">
              3,420
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">units</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B1: <span className="font-code font-medium">42,800 u</span></span>
              <span className="text-error font-medium font-code">-92.0%</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B2: <span className="font-code font-medium">24,150 u</span></span>
              <span className="text-primary font-medium font-code">-85.8%</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '8%' }}></div>
              <div className="bg-surface-variant h-full" style={{ width: '92%' }}></div>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">$78.6k simulated exposure vs $984k (B1)</span>
          </div>
        </div>

        {/* KPI 2: Expiry & Spoilage */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Batch Expiry / Waste</span>
            <span className="material-symbols-outlined text-[18px] text-primary">delete_sweep</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight font-code">
              1,280
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">units</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B1: <span className="font-code font-medium">8,450 u</span></span>
              <span className="text-error font-medium font-code">-84.9%</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B2: <span className="font-code font-medium">6,120 u</span></span>
              <span className="text-primary font-medium font-code">-79.1%</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '15%' }}></div>
              <div className="bg-surface-variant h-full" style={{ width: '85%' }}></div>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">$32.0k loss value vs $211k (B1)</span>
          </div>
        </div>

        {/* KPI 3: Freight Logistics Cost */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Total Freight &amp; Transfers</span>
            <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight font-code">
              $94,150
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">USD</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B1: <span className="font-code font-medium">$188,400</span></span>
              <span className="text-error font-medium font-code">-50.0%</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B2: <span className="font-code font-medium">$142,600</span></span>
              <span className="text-primary font-medium font-code">-34.0%</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '50%' }}></div>
              <div className="bg-surface-variant h-full" style={{ width: '50%' }}></div>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Eliminated spot rate expedites</span>
          </div>
        </div>

        {/* KPI 4: Total Objective Penalty */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Composite Objective Loss</span>
            <span className="material-symbols-outlined text-[18px] text-primary">monitoring</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary font-bold tracking-tight font-code">
              $204,750
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Score</span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B1: <span className="font-code font-medium">$1,383.4k</span></span>
              <span className="text-error font-medium font-code">-85.2%</span>
            </div>
            <div className="flex items-center justify-between font-label-sm text-[11px]">
              <span className="text-on-surface-variant">Policy B2: <span className="font-code font-medium">$850.6k</span></span>
              <span className="text-primary font-medium font-code">-75.9%</span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '14%' }}></div>
              <div className="bg-surface-variant h-full" style={{ width: '86%' }}></div>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Deterministic simulated total loss</span>
          </div>
        </div>
      </div>

      {/* Contribution Decomposition (Attribution Analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Step 1: B1 to B2 */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container-high font-code text-label-sm font-semibold text-on-surface">
                Step 1
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Forecast-Driven Improvement (B1 → B2)
              </span>
            </div>
            <span className="font-code text-label-sm text-on-surface-variant">ML Lift</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Replacing static reorder points with forward 14-day rolling probability demand signals. Better anticipation of consumption shifts mitigates stockout cliffs prior to lead-time lockouts.
          </p>
          <div className="grid grid-cols-3 gap-2 p-2 rounded bg-surface-container-low">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Unmet Demand Drop</span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface font-code">-18,650 u</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant font-code">-43.6%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Expiry Avoided</span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface font-code">-2,330 u</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant font-code">-27.6%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Freight Savings</span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface font-code">+$45,800</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant font-code">-24.3%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
            <span>Key driver: Smoothing replenishment variance upstream reduces regional bullwhip amplification.</span>
          </div>
        </div>

        {/* Step 2: B2 to Optiqo */}
        <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed font-code text-label-sm font-semibold text-on-tertiary-fixed">
                Step 2
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Multi-Echelon Optimization Lift (B2 → Optiqo)
              </span>
            </div>
            <span className="font-code text-label-sm text-primary font-bold">MILP Delta</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Upgrading from localized reorder logic to coordinated multi-echelon linear programming. Optimizes cross-DC lateral rebalancing and strictly prioritizes nearing-expiry batches across all tiers.
          </p>
          <div className="grid grid-cols-3 gap-2 p-2 rounded bg-surface-container-low">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Unmet Demand Drop</span>
              <span className="font-label-lg text-label-lg font-bold text-primary font-code">-20,730 u</span>
              <span className="font-label-sm text-[11px] text-primary font-code">-85.8%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Expiry Avoided</span>
              <span className="font-label-lg text-label-lg font-bold text-primary font-code">-4,840 u</span>
              <span className="font-label-sm text-[11px] text-primary font-code">-79.1%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Freight Savings</span>
              <span className="font-label-lg text-label-lg font-bold text-primary font-code">+$48,450</span>
              <span className="font-label-sm text-[11px] text-primary font-code">-34.0%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
            <span>Key driver: Global multi-echelon solver routes batches according to residual shelf-life urgency.</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Charts Section (Plotly Style Simulation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Chart 1: Daily Unmet Demand Volatility */}
        <div className="lg:col-span-7 flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">Daily Unmet Demand Volume</span>
              <span className="font-code text-label-sm text-on-surface-variant">(30-Day Simulated Run)</span>
            </div>
            <div className="flex items-center gap-3 font-label-sm text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-error inline-block"></span>
                <span className="text-on-surface-variant font-code">B1 (Min-Max)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-secondary inline-block"></span>
                <span className="text-on-surface-variant font-code">B2 (Forecast)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-xs bg-primary inline-block"></span>
                <span className="text-on-surface font-semibold font-code">Optiqo</span>
              </span>
            </div>
          </div>

          {/* Plotly Canvas Container */}
          <div className="relative w-full h-64 bg-surface-container-lowest flex flex-col justify-end pt-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 680 200">
              {/* Horizontal Grid Lines */}
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="20" y2="20" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="65" y2="65" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="110" y2="110" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="155" y2="155" />
              <line stroke="#CBD5E1" strokeWidth="1" x1="0" x2="680" y1="195" y2="195" />

              {/* Shaded Area for Optiqo */}
              <polygon
                fill="#00685F"
                fillOpacity="0.12"
                points="0,195 20,192 60,190 100,188 140,192 180,187 220,186 260,190 300,189 340,186 380,185 420,188 460,187 500,186 540,188 580,185 620,187 660,186 680,187 680,195 0,195"
              />

              {/* B1 Curve (Dashed Crimson Spikes) */}
              <polyline
                fill="none"
                points="0,140 30,110 60,160 90,60 120,80 150,30 180,120 210,40 240,90 270,145 300,50 330,85 360,25 390,115 420,70 450,130 480,45 510,95 540,150 570,35 600,105 630,75 660,140 680,90"
                stroke="#BA1A1A"
                strokeDasharray="4 3"
                strokeWidth="1.75"
              />

              {/* B2 Curve (Blue Solid) */}
              <polyline
                fill="none"
                points="0,165 30,150 60,140 90,120 120,135 150,110 180,130 210,105 240,125 270,140 300,115 330,130 360,95 390,120 420,110 450,125 480,100 510,120 540,135 570,105 600,125 630,115 660,130 680,110"
                stroke="#006398"
                strokeWidth="1.75"
              />

              {/* Optiqo Curve (Teal Solid Stable) */}
              <polyline
                fill="none"
                points="0,192 20,192 60,190 100,188 140,192 180,187 220,186 260,190 300,189 340,186 380,185 420,188 460,187 500,186 540,188 580,185 620,187 660,186 680,187"
                stroke="#00685F"
                strokeWidth="2.5"
              />
            </svg>

            {/* Axis Markers */}
            <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant pt-2 border-t border-surface-container">
              <span>Day 1 (Apr 15)</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day 30 (May 14)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-sm text-[12px] text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded">
            <span>
              Optiqo daily variance <span className="font-code font-bold text-primary">σ = 24.2 units</span> vs B1{' '}
              <span className="font-code font-bold text-error">σ = 482.6 units</span>
            </span>
            <span className="font-label-sm text-[11px] font-semibold text-primary">Zero Outlier Surges</span>
          </div>
        </div>

        {/* Chart 2: Cumulative Expiry & Spoilage Accumulation */}
        <div className="lg:col-span-5 flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-xs gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">Cumulative Batch Expiry</span>
              <span className="font-code text-label-sm text-on-surface-variant">(Units)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] text-on-surface">
              FEFO Impact
            </span>
          </div>

          <div className="relative w-full h-64 bg-surface-container-lowest flex flex-col justify-end pt-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 380 200">
              {/* Horizontal Grid Lines */}
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="380" y1="20" y2="20" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="380" y1="75" y2="75" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="380" y1="130" y2="130" />
              <line stroke="#CBD5E1" strokeWidth="1" x1="0" x2="380" y1="195" y2="195" />

              {/* B1 Trajectory (Steep to 8.45k units) */}
              <path d="M 0,195 Q 120,140 220,80 T 380,25" fill="none" stroke="#BA1A1A" strokeDasharray="4 3" strokeWidth="2" />
              <circle cx="380" cy="25" fill="#BA1A1A" r="3.5" />

              {/* B2 Trajectory (Intermediate to 6.12k units) */}
              <path d="M 0,195 Q 140,165 240,115 T 380,65" fill="none" stroke="#006398" strokeWidth="2" />
              <circle cx="380" cy="65" fill="#006398" r="3.5" />

              {/* Optiqo Trajectory (Shallow, flat to 1.28k units) */}
              <path d="M 0,195 Q 160,190 280,180 T 380,165" fill="none" stroke="#00685F" strokeWidth="2.5" />
              <circle cx="380" cy="165" fill="#00685F" r="4" />
            </svg>

            {/* Trajectory End Value Badges */}
            <div className="absolute right-2 top-4 flex flex-col gap-1 items-end font-code text-[11px]">
              <span className="text-error font-semibold">B1: 8,450 u</span>
              <span className="text-secondary font-semibold">B2: 6,120 u</span>
              <span className="text-primary font-bold">Optiqo: 1,280 u</span>
            </div>

            {/* Axis Labels */}
            <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant pt-2 border-t border-surface-container">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
            </div>
          </div>

          <div className="p-2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-[12px] flex items-center justify-between">
            <span>FEFO exhaustion reduces lot spoilage risk by:</span>
            <span className="font-code font-bold text-label-md">-84.9% vs Baseline</span>
          </div>
        </div>
      </div>

      {/* Granular Comparison Operational Table */}
      <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-xs overflow-hidden">
        <div className="h-10 px-space-md flex items-center justify-between bg-surface-container-lowest border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface">Multi-Facet Operational Benchmark Data Grid</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">| 7 Key Service &amp; Logistics Indicators</span>
          </div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm">
            <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">Tolerance: ±0.01%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 bg-surface-container-low font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-space-md font-semibold">Operational Indicator</th>
                <th className="px-space-md font-semibold">Policy B1 (Min-Max)</th>
                <th className="px-space-md font-semibold">Policy B2 (Forecast ML)</th>
                <th className="px-space-md font-semibold text-primary font-bold">Policy Optiqo (MILP)</th>
                <th className="px-space-md font-semibold">Δ vs B2</th>
                <th className="px-space-md font-semibold">Δ vs B1</th>
                <th className="px-space-md font-semibold text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
              {/* Row 1: OTIF Service Level */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span>On-Time In-Full (OTIF) Rate</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">78.4%</td>
                <td className="px-space-md font-code text-on-surface-variant">87.9%</td>
                <td className="px-space-md font-code font-bold text-primary">99.1%</td>
                <td className="px-space-md font-code text-primary font-semibold">+11.2 pp</td>
                <td className="px-space-md font-code text-primary font-semibold">+20.7 pp</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                    Optimal
                  </span>
                </td>
              </tr>

              {/* Row 2: Peak Stockout Duration */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">timelapse</span>
                  <span>Peak Stockout Duration (Consecutive)</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">4.8 Days</td>
                <td className="px-space-md font-code text-on-surface-variant">2.1 Days</td>
                <td className="px-space-md font-code font-bold text-primary">0.3 Days</td>
                <td className="px-space-md font-code text-primary font-semibold">-1.8 Days</td>
                <td className="px-space-md font-code text-primary font-semibold">-4.5 Days</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                    Controlled
                  </span>
                </td>
              </tr>

              {/* Row 3: Expiry Rate */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">hourglass_bottom</span>
                  <span>Lot Expiry Rate (% throughput)</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">6.24%</td>
                <td className="px-space-md font-code text-on-surface-variant">4.51%</td>
                <td className="px-space-md font-code font-bold text-primary">0.94%</td>
                <td className="px-space-md font-code text-primary font-semibold">-3.57 pp</td>
                <td className="px-space-md font-code text-primary font-semibold">-5.30 pp</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                    FEFO Passed
                  </span>
                </td>
              </tr>

              {/* Row 4: Consolidation Rate */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">alt_route</span>
                  <span>Multi-Drop Route Consolidation</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">22.0%</td>
                <td className="px-space-md font-code text-on-surface-variant">48.5%</td>
                <td className="px-space-md font-code font-bold text-primary">84.2%</td>
                <td className="px-space-md font-code text-primary font-semibold">+35.7 pp</td>
                <td className="px-space-md font-code text-primary font-semibold">+62.2 pp</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-medium">
                    High Fill
                  </span>
                </td>
              </tr>

              {/* Row 5: Emergency Expedited Freight */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">warning</span>
                  <span>Expedited Spot Shipments</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">42 loads ($67k)</td>
                <td className="px-space-md font-code text-on-surface-variant">19 loads ($31k)</td>
                <td className="px-space-md font-code font-bold text-primary">1 load ($1.8k)</td>
                <td className="px-space-md font-code text-primary font-semibold">-94.7%</td>
                <td className="px-space-md font-code text-primary font-semibold">-97.6%</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                    Clean
                  </span>
                </td>
              </tr>

              {/* Row 6: Constraint Breaches */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">gavel</span>
                  <span>Capacity &amp; Cold-Chain Breaches</span>
                </td>
                <td className="px-space-md font-code text-error font-medium">17 breaches</td>
                <td className="px-space-md font-code text-on-surface-variant">4 breaches</td>
                <td className="px-space-md font-code font-bold text-primary">0 breaches</td>
                <td className="px-space-md font-code text-primary font-semibold">-100%</td>
                <td className="px-space-md font-code text-primary font-semibold">-100%</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                    Zero-Violation
                  </span>
                </td>
              </tr>

              {/* Row 7: Solver Runtime */}
              <tr className="h-11 hover:bg-surface-container-low/60 transition-colors">
                <td className="px-space-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline">memory</span>
                  <span>Execution Runtime per 30-Day Pass</span>
                </td>
                <td className="px-space-md font-code text-on-surface-variant">0.4s (Rule engine)</td>
                <td className="px-space-md font-code text-on-surface-variant">4.2s (LightGBM)</td>
                <td className="px-space-md font-code font-bold text-on-surface">43.8s (MILP Simplex)</td>
                <td className="px-space-md font-code text-on-surface-variant">+39.6s</td>
                <td className="px-space-md font-code text-on-surface-variant">+43.4s</td>
                <td className="px-space-md text-right">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] font-medium text-on-surface">
                    Within SLA
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Alternate UX State Previews */}
      <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Simulation Lifecycle State Indicators
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              (Operational Diagnostics &amp; Fallback States)
            </span>
          </div>
          <span className="font-label-sm text-[11px] text-on-surface-variant">System Standard Handlers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-1">
          {/* Loading / In-Progress State */}
          <div className="p-3 rounded bg-surface-container-low flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full bg-secondary ${isRunning ? 'animate-ping' : ''}`}></span>
                Simulation In Progress
              </span>
              <span className="font-code text-[11px] text-secondary font-bold">
                {isRunning ? `${progress}% Complete` : '42% Complete'}
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Evaluating Day 13/30 on Policy B2. Solving 142 mixed-integer continuous flow constraints...
            </p>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-300"
                style={{ width: isRunning ? `${progress}%` : '42%' }}
              ></div>
            </div>
          </div>

          {/* Infeasible / Constraint Warning State */}
          <div className="p-3 rounded bg-error-container/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-error uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-error">error</span>
                Convergence Warning
              </span>
              <span className="font-code text-[11px] text-error font-medium">Zone 4 Cascade</span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Policy B1 reached an unrecoverable stockout condition in DC-North due to static lead-time assumptions.
            </p>
            <span className="font-label-sm text-[10px] text-error font-medium">
              B1 execution auto-relaxed with artificial penalty slip.
            </span>
          </div>

          {/* Empty / Standby State */}
          <div className="p-3 rounded bg-surface-container-low flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-outline">hourglass_empty</span>
                Standby / Cold Cache
              </span>
              <span className="font-code text-[11px] text-on-surface-variant">Ready</span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              New partition parameter sets require re-simulation. Click ‘Run Backtest’ to prime fresh traces.
            </p>
            <span className="font-label-sm text-[10px] text-on-surface-variant font-medium">
              Previous cached runs preserved in parquet store.
            </span>
          </div>
        </div>
      </div>

      {/* Run Metadata & Reproducibility Footprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-xs font-label-sm text-[11px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-on-surface-variant uppercase font-semibold">Dataset Identifier</span>
          <span className="font-code text-on-surface truncate">Global_Retail_Q3_Simulated.parquet</span>
          <span className="text-on-surface-variant font-code text-[10px]">Size: 142.8 MB (3.4M records)</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-on-surface-variant uppercase font-semibold">Solver &amp; Python Stack</span>
          <span className="font-code text-on-surface">GLPK MILP v5.2 / Optiqo Engine v1.4.2</span>
          <span className="text-on-surface-variant font-code text-[10px]">Streamlit 1.34 • NumPy 1.26.4</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-on-surface-variant uppercase font-semibold">Execution Timestamp</span>
          <span className="font-code text-on-surface">2025-05-14 11:42:19 UTC</span>
          <span className="text-on-surface-variant font-code text-[10px]">Duration: 48.6s (3 policies x 30 iter)</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-on-surface-variant uppercase font-semibold">Integrity SHA-256 Hash</span>
          <span className="font-code text-primary truncate">sha256:7f8a91b2c4e09d841e739fa45</span>
          <span className="text-tertiary font-code text-[10px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            Verified Deterministic Trace
          </span>
        </div>
      </div>

      {/* Honesty & Intellectual Integrity Callout Banner */}
      <div className="p-space-md rounded-xl bg-surface-container-high/60 text-on-surface-variant flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] text-outline shrink-0 mt-0.5">shield</span>
        <div className="flex flex-col gap-0.5">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Illustrative Simulated Evaluation Notice
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            The quantitative metrics presented above reflect a deterministic discrete-event mathematical simulation conducted over historical retail transaction traces. While the GLPK MILP formulation optimizes within stated operational constraints, no real-world commercial savings, absolute cost reductions, or statistical significance across unmodeled variables are guaranteed. These metrics serve to validate algorithmic policy convergence, FEFO compliance, and solver stability prior to canary deployment in live production environments.
          </p>
        </div>
      </div>
    </div>
  );
};
