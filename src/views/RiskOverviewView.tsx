import React, { useState } from 'react';
import { ViewMode } from '../types';
import { DC_REGIONAL_NODES } from '../data/mockData';

interface RiskOverviewViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectSku: (skuCode: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const RiskOverviewView: React.FC<RiskOverviewViewProps> = ({
  onNavigate,
  onSelectSku,
  onShowToast
}) => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState('ALL');

  const filteredNodes = DC_REGIONAL_NODES.filter((node) => {
    const regionMatch = selectedRegion === 'ALL' || node.region === selectedRegion;
    const tierMatch = selectedRiskTier === 'ALL' || node.riskLevel === selectedRiskTier;
    return regionMatch && tierMatch;
  });

  const criticalNodes = DC_REGIONAL_NODES.filter((n) => n.riskLevel === 'CRITICAL');
  const warningNodes = DC_REGIONAL_NODES.filter((n) => n.riskLevel === 'WARNING');

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg max-w-[1440px] mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Network Risk Radar &amp; Stockout Exposure
            </h1>
            <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">
              42 SKUs Below Safety Floor
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-semibold">
              Step 02 / Risk Topology
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
            Continuous discrete-event evaluation of inventory buffers, capacity limits, and lead-time
            variances across 12 regional distribution nodes before multi-echelon rebalancing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onShowToast('Refreshed real-time telemetry from ERP SAP connectors', 'info');
            }}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh Telemetry
          </button>
          <button
            onClick={() => onNavigate('allocation-plan')}
            className="px-4 py-1.5 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            Run Rebalance Solver
          </button>
        </div>
      </div>

      {/* 4 Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between text-error">
            <span className="font-label-sm text-[11px] uppercase font-bold tracking-wider">
              Critical Nodes (&lt; 48h)
            </span>
            <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg font-bold text-error font-code">
              {criticalNodes.length}
            </span>
            <span className="font-label-sm text-on-surface-variant text-[11px]">DCs at zero buffer</span>
          </div>
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded">
            Allentown (14h) &amp; Oakland (24h)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800">
            <span className="font-label-sm text-[11px] uppercase font-bold tracking-wider">
              Warning Nodes (DoH &lt; 8d)
            </span>
            <span className="material-symbols-outlined text-[18px]">emergency</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg font-bold text-amber-800 font-code">
              {warningNodes.length}
            </span>
            <span className="font-label-sm text-on-surface-variant text-[11px]">Rebalance recommended</span>
          </div>
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded">
            Charlotte (6.8d) &amp; Memphis (8.4d)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-bold tracking-wider">
              Stockout Exposure ($)
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">attach_money</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg font-bold text-on-surface font-code">
              $342.5k
            </span>
            <span className="font-label-sm text-error font-code font-bold">Unmitigated</span>
          </div>
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded">
            Can salvage $309.7k via lateral transfers
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[11px] uppercase font-bold tracking-wider">
              Cold-Chain Compliance
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">ac_unit</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg font-bold text-primary font-code">
              100%
            </span>
            <span className="font-label-sm text-primary font-code font-semibold">Strict 48h SLA</span>
          </div>
          <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded">
            Zero excursions permitted in transit
          </div>
        </div>
      </div>

      {/* Filter Toolbar for DC Heatmap */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-xs border border-surface-container flex items-center justify-between gap-space-sm flex-wrap">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            Filter DC Nodes:
          </span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="h-8 px-2.5 rounded bg-surface-container-low text-on-surface font-body-sm text-[12px] border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Regions (4)</option>
            <option value="North America East">North America East</option>
            <option value="Midwest Central">Midwest Central</option>
            <option value="Southeast">Southeast</option>
            <option value="Pacific West">Pacific West</option>
          </select>
          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="h-8 px-2.5 rounded bg-surface-container-low text-on-surface font-body-sm text-[12px] border border-surface-container-high focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warnings</option>
            <option value="STABLE">Stable</option>
            <option value="SURPLUS">Surplus</option>
          </select>
        </div>
        <span className="font-label-sm text-[11px] text-outline font-code">
          Showing {filteredNodes.length} of 9 Distribution Centers
        </span>
      </div>

      {/* Regional DC Node Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredNodes.map((node) => {
          const isCrit = node.riskLevel === 'CRITICAL';
          const isWarn = node.riskLevel === 'WARNING';
          const isSurplus = node.riskLevel === 'SURPLUS';

          return (
            <div
              key={node.id}
              className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs border flex flex-col justify-between transition-all hover:shadow-sm ${
                isCrit
                  ? 'border-error/40 ring-1 ring-error/20'
                  : isWarn
                  ? 'border-amber-400/50'
                  : 'border-surface-container'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      warehouse
                    </span>
                    <span className="font-code font-bold text-[13px] text-on-surface">
                      {node.id}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-label-sm text-[10px] font-bold uppercase tracking-wider ${
                      isCrit
                        ? 'bg-error-container text-on-error-container'
                        : isWarn
                        ? 'bg-amber-100 text-amber-900'
                        : isSurplus
                        ? 'bg-sky-100 text-sky-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {node.riskLevel}
                  </span>
                </div>

                <div className="py-2.5">
                  <div className="font-semibold text-[13px] text-on-surface truncate">
                    {node.name}
                  </div>
                  <div className="text-[11px] text-outline font-label-sm">{node.city}</div>
                </div>

                {/* Stockout Countdown if critical */}
                {node.stockoutWithinHours && (
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900 font-label-sm text-[11px] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                      Stockout Imminent:
                    </span>
                    <span className="font-bold font-code">&lt; {node.stockoutWithinHours} Hours</span>
                  </div>
                )}

                {/* Capacity Progress */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] font-label-sm text-on-surface-variant">
                    <span>Cross-dock Capacity</span>
                    <span className="font-code font-semibold">{node.capacityUtilization}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.capacityUtilization > 90
                          ? 'bg-error'
                          : node.capacityUtilization > 80
                          ? 'bg-amber-600'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${node.capacityUtilization}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-1 p-2 rounded bg-surface-container-low font-label-sm text-center text-[10px]">
                  <div>
                    <span className="text-outline block">Days Supply</span>
                    <span className="font-code font-bold text-on-surface text-[11px]">
                      {node.daysOfSupply}d
                    </span>
                  </div>
                  <div>
                    <span className="text-outline block">Critical SKUs</span>
                    <span
                      className={`font-code font-bold text-[11px] ${
                        node.criticalSkus > 0 ? 'text-error' : 'text-on-surface'
                      }`}
                    >
                      {node.criticalSkus}
                    </span>
                  </div>
                  <div>
                    <span className="text-outline block">Active SKUs</span>
                    <span className="font-code font-bold text-on-surface text-[11px]">
                      {node.activeSkus.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-surface-container flex items-center justify-between">
                <span className="text-[11px] text-outline font-label-sm">
                  {node.inboundShipments} inbounds scheduled
                </span>
                <button
                  onClick={() => onNavigate('allocation-plan')}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold font-label-sm text-[11px] transition-colors cursor-pointer"
                >
                  View Dispatches
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Stockout Exposure Priority SKUs */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">crisis_alert</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Top 3 Critical Stockout Emergency Targets
            </h2>
          </div>
          <span className="font-code text-[11px] text-outline font-semibold">Priority 1 Queue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-2">
          {/* Card 1 */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-label-sm">
                <span className="font-code font-bold text-primary">SKU-9921-X</span>
                <span className="px-1.5 py-0.2 rounded bg-error-container text-on-error-container font-bold">
                  14h Stockout
                </span>
              </div>
              <h4 className="font-semibold text-on-surface text-[13px] mt-1">
                Cold-Chain Reagent Pack v3
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Target: Allentown (PA) • Deficit: -42u before Day 1.8
              </p>
            </div>
            <button
              onClick={() => onSelectSku('SKU-9921-X')}
              className="mt-3 w-full py-1.5 rounded bg-primary text-on-primary font-body-sm text-[11px] font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Examine Inbound Corridor (+1,200u)
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-label-sm">
                <span className="font-code font-bold text-primary">SKU-4410-B</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                  FEFO Warn
                </span>
              </div>
              <h4 className="font-semibold text-on-surface text-[13px] mt-1">
                Saline Buffer Solution 500ml
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Target: Queens Depot (NY) • Shelf-life: 18.5d at receipt
              </p>
            </div>
            <button
              onClick={() => onSelectSku('SKU-4410-B')}
              className="mt-3 w-full py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Examine Inbound Corridor (+2,400u)
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-label-sm">
                <span className="font-code font-bold text-primary">SKU-3120-K</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                  Rebalance
                </span>
              </div>
              <h4 className="font-semibold text-on-surface text-[13px] mt-1">
                Immunoassay Assay Cartridge
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Target: Miami South (FL) • Deficit risk in Day 3
              </p>
            </div>
            <button
              onClick={() => onSelectSku('SKU-3120-K')}
              className="mt-3 w-full py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Examine Inbound Corridor (+1,600u)
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="sticky bottom-4 z-30 bg-surface-container-lowest rounded-xl shadow-md border border-surface-container p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold font-label-sm">
            2
          </div>
          <div className="flex flex-col">
            <span className="font-body-md font-semibold text-on-surface">
              Stage 2 of 5 Complete: Risk Topology Mapped
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              42 stockout vulnerabilities identified across Eastern &amp; Western corridors.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => onNavigate('data-validation')}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Validation
          </button>
          <button
            onClick={() => onNavigate('allocation-plan')}
            className="px-4 py-2 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Allocation Plan</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
