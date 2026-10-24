import React, { useState } from 'react';
import { ViewMode } from '../types/index.ts';
import { DISPATCH_QUEUE } from '../data/mockData.ts';
import { WhatIfModal } from '../components/WhatIfModal.tsx';
import { ManualOverrideModal } from '../components/ManualOverrideModal.tsx';

interface RecommendationDetailViewProps {
  onNavigate: (view: ViewMode) => void;
  selectedSkuCode: string;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RecommendationDetailView: React.FC<RecommendationDetailViewProps> = ({
  onNavigate,
  selectedSkuCode,
  onShowToast,
}) => {
  // Find current item or default to first
  const initialIndex = Math.max(
    0,
    DISPATCH_QUEUE.findIndex((d) => d.skuCode === selectedSkuCode)
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const item = DISPATCH_QUEUE[currentIndex] || DISPATCH_QUEUE[0];

  const [proposedQty, setProposedQty] = useState(item.allocatedUnits);
  const [isApproved, setIsApproved] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + DISPATCH_QUEUE.length) % DISPATCH_QUEUE.length;
    setCurrentIndex(nextIdx);
    setProposedQty(DISPATCH_QUEUE[nextIdx].allocatedUnits);
    setIsApproved(false);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % DISPATCH_QUEUE.length;
    setCurrentIndex(nextIdx);
    setProposedQty(DISPATCH_QUEUE[nextIdx].allocatedUnits);
    setIsApproved(false);
  };

  const handleApprove = () => {
    setIsApproved(true);
    onShowToast(`Dispatch #DSP-2025-05-${item.skuCode.replace('SKU-', '')} authorized for immediate WMS fulfillment!`, 'success');
  };

  const handleApplyWhatIf = (newQty: number) => {
    setProposedQty(newQty);
    onShowToast(`Updated simulation transfer to +${newQty.toLocaleString()} units`, 'info');
  };

  const handleApplyOverride = (data: { adjustedQty: number; reason: string; carrier: string }) => {
    setProposedQty(data.adjustedQty);
    setIsApproved(true);
    onShowToast(
      `Manual Override Confirmed: +${data.adjustedQty.toLocaleString()} units via ${data.carrier}. Reason: ${data.reason}`,
      'warning'
    );
  };

  const handleExportTrace = () => {
    const log = `OPTIQO SOLVER TRACE REPORT
==================================================
Report ID: DSP-2025-05-${item.skuCode.replace('SKU-', '')}
Timestamp: ${new Date().toISOString()}
SKU: ${item.skuCode} (${item.skuName})
Origin: ${item.originDc} (${item.originCity})
Destination: ${item.destinationHub} (${item.destinationCity})
Batch ID: ${item.batchNumber} (Expiry: ${item.expiryDate})
Allocated Units: +${proposedQty.toLocaleString()} u
Freight Cost: $${item.freightCost} (${item.freightMode})
Arrival Shelf-Life: ${item.shelfLifeAtArrivalDays} Days (Gate >30 Days PASSED)
Audit Verdict: DETERMINISTIC COMPLIANCE PASSED
Integrity Hash: sha256:7f8a91b2c4e09d841e739fa45
==================================================`;
    const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Optiqo_Trace_${item.skuCode}_${item.batchNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported full solver trace log for ${item.skuCode}`, 'info');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Operational Breadcrumbs & Context Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => onNavigate('allocation-plan')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-body-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">arrow_back</span>
            <span>Back to Allocation Plan</span>
          </button>
          <span className="text-outline-variant font-label-sm">/</span>
          <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
            <span className="text-on-surface-variant font-code">Operations</span>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="text-on-surface-variant font-code">Allocation Plan</span>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="px-2 py-0.5 rounded bg-surface-container font-code font-semibold text-primary">
              #DSP-2025-05-{item.skuCode.replace('SKU-', '')}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-sm font-semibold tracking-wide">
            [SIMULATED SOLVER TRACE]
          </span>
        </div>

        {/* Recommendation Pager / Trace Switcher */}
        <div className="flex items-center gap-space-xs self-start md:self-auto bg-surface-container-lowest px-2 py-1 rounded shadow-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-1.5">
            Trace Switcher
          </span>
          <div className="h-3.5 w-px bg-surface-container-high"></div>
          <button
            onClick={handlePrev}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Previous Recommendation"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="px-2 py-0.5 rounded bg-surface-container-low font-code font-semibold text-body-sm text-on-surface">
            {item.batchNumber} • Rec 0{currentIndex + 1} of 0{DISPATCH_QUEUE.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Next Recommendation"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Primary Identity Card */}
      <div className="bg-surface-container-lowest rounded shadow-xs mb-space-md overflow-hidden">
        {/* Header strip */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded bg-primary-container/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[24px]">ac_unit</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-lg text-headline-lg text-on-surface font-code font-bold">
                  {item.skuCode}
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal">
                  {item.skuName}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-sm font-semibold">
                  {item.temperatureClass === '2-8°C'
                    ? 'Thermolabile Class 2–8°C'
                    : item.temperatureClass === '-20°C'
                    ? 'Cryogenic Class -20°C'
                    : 'Ambient Controlled'}
                </span>
                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                  FEFO Priority: Rank #1
                </span>
              </div>
              <div className="flex items-center gap-space-md mt-1 text-on-surface-variant font-label-sm flex-wrap">
                <span className="font-code">
                  Lot ID: <span className="text-on-surface font-semibold">{item.batchNumber}</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">warehouse</span>
                  Origin: {item.originCity} (<span className="font-code font-medium">{item.originDc}</span>)
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline-variant">arrow_forward</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">local_shipping</span>
                  Destination: {item.destinationCity} (<span className="font-code font-medium">{item.destinationHub}</span>)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              onClick={() => setIsOverrideOpen(true)}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Manual Override</span>
            </button>
            <button
              onClick={handleExportTrace}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Audit Log</span>
            </button>
            <button
              onClick={handleApprove}
              className={`px-3.5 py-1.5 rounded font-body-sm font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isApproved
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isApproved ? 'verified' : 'check_circle'}
              </span>
              <span>{isApproved ? 'WMS Cleared' : 'Approve for WMS'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 p-space-md gap-space-md bg-surface-container-lowest">
          <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Proposed Transfer
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display-sm text-display-sm text-on-surface font-code">
                +{proposedQty.toLocaleString()}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">units</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline mt-0.5">
              {Math.ceil(proposedQty / 200)} passive reefer pallets
            </span>
          </div>

          <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Scheduled Delivery
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline-lg text-headline-lg text-on-surface font-code">{item.eta}</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline mt-0.5">
              {item.transitTimeHours}h lead • {item.freightMode}
            </span>
          </div>

          <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Landed Freight Cost
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display-sm text-display-sm text-on-surface font-code">
                ${item.freightCost.toLocaleString()}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-code">USD</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-medium mt-0.5">
              ${(item.freightCost / proposedQty).toFixed(2)}/unit consolidated
            </span>
          </div>

          <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Freshness at Arrival
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display-sm text-display-sm text-primary font-code">
                {item.shelfLifeAtArrivalDays} Days
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold mt-0.5">
              +{item.shelfLifeAtArrivalDays - 30}d above hospital SLA
            </span>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col p-space-sm rounded bg-surface-container-low justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Constraint Engine
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">PASSED</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline mt-0.5">Zero negative-stock violation</span>
          </div>
        </div>
      </div>

      {/* Main Analytical 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-md">
        {/* LEFT COLUMN: Section A & B (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Section A: Demand Forecast Chart */}
          <div className="bg-surface-container-lowest rounded shadow-xs p-space-lg flex flex-col">
            <div className="flex items-start justify-between mb-space-sm flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-code font-bold text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary">
                    SEC A
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Demand Forecast &amp; Consumption Trajectory
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  7-Day probabilistic draw at {item.destinationHub} ({item.destinationCity}) vs. safety buffers
                </p>
              </div>
              <div className="flex items-center gap-3 font-label-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-error"></span>
                  <span className="text-on-surface-variant">Baseline (Deficit)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-primary rounded-full"></span>
                  <span className="text-on-surface-variant">With Transfer (+{(proposedQty / 1000).toFixed(1)}k)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-primary/20 rounded"></span>
                  <span className="text-on-surface-variant">90% CI</span>
                </div>
              </div>
            </div>

            {/* Inline Plotly-Style SVG Canvas */}
            <div className="relative w-full h-[220px] bg-surface-container-low/40 rounded p-3 flex flex-col justify-between overflow-hidden">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-40">
                <div className="border-b border-outline-variant/30 w-full h-0"></div>
                <div className="border-b border-outline-variant/30 w-full h-0"></div>
                <div className="border-b border-outline-variant/30 w-full h-0"></div>
                <div className="border-b border-outline-variant/30 w-full h-0"></div>
              </div>

              {/* SVG Visual Representation */}
              <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 650 180">
                {/* Safety Threshold 1,800 units horizontal reference */}
                <line opacity="0.6" stroke="#6d7a77" strokeDasharray="3,3" strokeWidth="1" x1="40" x2="630" y1="65" y2="65" />
                <text className="font-label-sm" fill="#6d7a77" fontSize="10" x="45" y="60">
                  Target Buffer (1,800u)
                </text>

                {/* Zero Stock line */}
                <line opacity="0.4" stroke="#ba1a1a" strokeDasharray="2,2" strokeWidth="1" x1="40" x2="630" y1="155" y2="155" />
                <text className="font-label-sm" fill="#ba1a1a" fontSize="10" x="510" y="150">
                  Zero Inventory (Depletion)
                </text>

                {/* Confidence Interval polygon (soft teal) */}
                <polygon
                  fill="rgba(0, 104, 95, 0.12)"
                  points="
                    40,75
                    130,70
                    220,68
                    310,65
                    400,60
                    500,58
                    610,62
                    610,95
                    500,90
                    400,96
                    310,102
                    220,100
                    130,95
                    40,90"
                />

                {/* Baseline without transfer (Plunges to 0 at Day 1.8) */}
                <path
                  d="M 40,88 Q 110,120 150,155 T 220,155 L 610,155"
                  fill="none"
                  stroke="#ba1a1a"
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
                {/* Stockout point marker */}
                <circle cx="150" cy="155" fill="#ba1a1a" r="4.5" />
                <rect fill="#ffdad6" height="26" rx="3" width="144" x="156" y="125" />
                <text className="font-label-sm font-semibold" fill="#93000a" fontSize="10.5" x="162" y="142">
                  Critical Deficit: Day 1.8 (-42u)
                </text>

                {/* Post-Transfer trajectory (+1,200u at day 1 arrival) */}
                <path
                  d="M 40,88 L 120,110 L 125,40 Q 220,48 310,55 T 450,50 T 610,64"
                  fill="none"
                  stroke="#00685f"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                {/* Inbound arrival marker */}
                <circle cx="125" cy="40" fill="#00685f" r="5" />
                <text className="font-label-sm font-bold" fill="#00685f" fontSize="11" x="135" y="36">
                  +{proposedQty.toLocaleString()}u Inbound (08:30)
                </text>

                {/* Axis Labels & Day markers */}
                <g className="font-label-sm" fill="#3d4947" fontSize="10">
                  <text x="40" y="174">May 14</text>
                  <text x="130" y="174">May 15 (Arr)</text>
                  <text x="220" y="174">May 16</text>
                  <text x="310" y="174">May 17</text>
                  <text x="400" y="174">May 18 (Surge)</text>
                  <text x="500" y="174">May 19</text>
                  <text x="590" y="174">May 20</text>
                </g>
              </svg>
            </div>

            {/* Consumption Distribution Table Summary */}
            <div className="grid grid-cols-7 gap-1 mt-space-sm text-center font-label-sm">
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D1 (May 14)</span>
                <span className="font-code font-semibold text-on-surface">240u</span>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D2 (May 15)</span>
                <span className="font-code font-semibold text-on-surface">280u</span>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D3 (May 16)</span>
                <span className="font-code font-semibold text-on-surface">310u</span>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D4 (May 17)</span>
                <span className="font-code font-semibold text-on-surface">290u</span>
              </div>
              <div className="bg-surface-container-high p-1.5 rounded">
                <span className="text-primary block font-semibold text-[10px]">D5 (Surge)</span>
                <span className="font-code font-bold text-primary">350u</span>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D6 (May 19)</span>
                <span className="font-code font-semibold text-on-surface">220u</span>
              </div>
              <div className="bg-surface-container-low p-1.5 rounded">
                <span className="text-on-surface-variant block text-[10px]">D7 (May 20)</span>
                <span className="font-code font-semibold text-on-surface">190u</span>
              </div>
            </div>

            {/* Demand Signal Explain Box */}
            <div className="mt-space-sm p-space-sm bg-surface-container-low rounded flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">psychology</span>
              <div className="text-on-surface font-body-sm">
                <span className="font-semibold text-primary">Model Signal:</span>
                {' '}Ensemble Gradient Boosted Trees (<span className="font-code text-on-surface">XGB-Forecaster v3.2</span>) detected a
                <strong className="text-on-surface"> +28% demand spike</strong> driven by Regional Clinical Protocol at {item.destinationCity} Network.
                Mean absolute error across 14d rolling validation: <span className="font-code font-semibold">4.8%</span>.
              </div>
            </div>
          </div>

          {/* Section B: Inventory Freshness & FEFO Compliance */}
          <div className="bg-surface-container-lowest rounded shadow-xs p-space-lg flex flex-col">
            <div className="flex items-start justify-between mb-space-sm flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-code font-bold text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary">
                    SEC B
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Inventory Freshness &amp; FEFO Compliance
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Origin batch clearance, shelf-life runway, and destination receipt window
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                FEFO Verification: Optimal Rank #1
              </span>
            </div>

            {/* Visual Freshness Runway Bar */}
            <div className="bg-surface-container-low p-space-md rounded mb-space-sm">
              <div className="flex items-center justify-between text-on-surface font-label-sm mb-2">
                <span className="font-medium text-on-surface-variant">Batch Timeline ({item.batchNumber})</span>
                <span className="font-code text-primary font-semibold">
                  {item.shelfLifeAtArrivalDays} Days remaining at receipt
                </span>
              </div>
              <div className="w-full h-7 bg-surface-container rounded-xs relative overflow-hidden flex">
                {/* Elapsed */}
                <div
                  className="h-full bg-surface-dim flex items-center justify-center text-on-surface-variant text-[11px] font-label-sm"
                  style={{ width: '32%' }}
                >
                  Manufactured (Jan 15)
                </div>
                {/* In-Transit */}
                <div
                  className="h-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-[11px] font-label-sm font-medium"
                  style={{ width: '8%' }}
                >
                  Transit ({item.transitTimeHours}h)
                </div>
                {/* Usable Clinical Window */}
                <div
                  className="h-full bg-primary/25 flex items-center justify-center text-primary text-[11px] font-label-sm font-bold"
                  style={{ width: '35%' }}
                >
                  Clinical Window (+{item.shelfLifeAtArrivalDays - 30}d Buffer)
                </div>
                {/* Minimum Hospital SLA Gate (30d) */}
                <div
                  className="h-full bg-error-container flex items-center justify-center text-on-error-container text-[11px] font-label-sm font-semibold"
                  style={{ width: '25%' }}
                >
                  Min SLA Gate (30 Days)
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-label-sm text-outline mt-1.5 px-0.5">
                <span>Prod: Jan 15, 2025</span>
                <span className="font-medium text-on-surface">Arrival: {item.eta}</span>
                <span className="text-error font-medium">Cutoff SLA: 30d</span>
                <span>Expiry: {item.expiryDate}</span>
              </div>
            </div>

            {/* Shelf life parameter cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-sm font-label-sm">
              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant uppercase text-[10px] block">Origin Usable Stock</span>
                <span className="font-code font-bold text-headline-sm text-on-surface">3,450 u</span>
                <span className="text-[11px] text-outline block mt-0.5">{item.originDc} {item.originCity}</span>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant uppercase text-[10px] block">Origin Inbound Supply</span>
                <span className="font-code font-bold text-headline-sm text-on-surface">+1,200 u</span>
                <span className="text-[11px] text-primary block mt-0.5">Arriving May 18 (Mfg)</span>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="text-on-surface-variant uppercase text-[10px] block">Hospital SLA Margin</span>
                <span className="font-code font-bold text-headline-sm text-primary">+{item.shelfLifeAtArrivalDays - 30} Days</span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Req: 30d • Actual: {item.shelfLifeAtArrivalDays}d
                </span>
              </div>
            </div>

            {/* Note on Alternative Lot */}
            <div className="mt-space-sm p-space-sm bg-surface-container-low rounded font-body-sm text-on-surface-variant flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">info</span>
              <div>
                <strong className="text-on-surface">FEFO Gate Validation:</strong> Alternative lot{' '}
                <span className="font-code font-semibold text-on-surface">LOT-2025-K11</span> (Exp: Aug 28, 2025) was evaluated at {item.originDc} but held in reserve to prioritize older stock{' '}
                <span className="font-code font-semibold text-on-surface">{item.batchNumber}</span>, preventing $4,850 in potential Q3 write-offs.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Section C & D (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Section C: Alternative Allocation Analysis */}
          <div className="bg-surface-container-lowest rounded shadow-xs p-space-lg flex flex-col">
            <div className="flex items-start justify-between mb-space-sm flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-code font-bold text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary">
                    SEC C
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Alternative Fulfillment Corridors</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Next-best eligible origin corridors evaluated by MILP
                </p>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="flex flex-col gap-space-sm">
              {/* Option 1: Selected */}
              <div className="p-space-sm rounded bg-surface-container-high/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-body-lg font-bold text-on-surface">
                      Option 1: {item.originCity} ({item.originDc})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm font-semibold">
                    SELECTED
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-label-sm text-on-surface-variant">
                  <div>Dist: <span className="text-on-surface font-code font-medium">94 mi</span></div>
                  <div>Freight: <span className="text-on-surface font-code font-bold">${item.freightCost}</span></div>
                  <div>Lead: <span className="text-on-surface font-code font-medium">{item.transitTimeHours}h</span></div>
                  <div>Score: <span className="text-primary font-code font-bold">94.2/100</span></div>
                </div>
                <div className="text-[12px] font-body-sm text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  <span>Optimal landed cost • 10.2h before projected hospital stockout</span>
                </div>
              </div>

              {/* Option 2: Columbus */}
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1.5 opacity-90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    <span className="font-body-md font-semibold text-on-surface">Option 2: Columbus (DC-Cent-04)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm">
                    REJECTED
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-label-sm text-on-surface-variant">
                  <div>Dist: <span className="text-on-surface font-code">412 mi</span></div>
                  <div>Freight: <span className="text-error font-code font-semibold">$2,850</span></div>
                  <div>Lead: <span className="text-on-surface font-code">28h (+10h)</span></div>
                  <div>Score: <span className="text-on-surface font-code">71.0</span></div>
                </div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">
                  <span className="text-error font-medium">Rejection Reason:</span> +$1,430 freight penalty; would deplete Columbus buffer prior to W19 regional intake.
                </div>
              </div>

              {/* Option 3: Memphis */}
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1.5 opacity-90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    <span className="font-body-md font-semibold text-on-surface">Option 3: Memphis (DC-South-02)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm">
                    DISQUALIFIED
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-label-sm text-on-surface-variant">
                  <div>Dist: <span className="text-on-surface font-code">860 mi</span></div>
                  <div>Freight: <span className="text-error font-code font-semibold">$4,100</span></div>
                  <div>Lead: <span className="text-error font-code font-semibold">42h (+24h)</span></div>
                  <div>Score: <span className="text-on-surface font-code">38.4</span></div>
                </div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">
                  <span className="text-error font-medium">Constraint Violation:</span> 42h transit violates the strict 36h thermal excursion limit for passive containers.
                </div>
              </div>
            </div>

            <div className="mt-space-sm p-space-sm rounded bg-surface-container font-body-sm text-on-surface">
              <span className="font-semibold text-primary">Preference Rationale:</span> {item.originCity} ({item.originDc}) delivers lowest freight rate while satisfying FEFO priority without cannibalizing origin inventory safety stock.
            </div>
          </div>

          {/* Section D: Mathematical Traceability & Binding Constraints */}
          <div className="bg-surface-container-lowest rounded shadow-xs p-space-lg flex flex-col flex-1">
            <div className="flex items-start justify-between mb-space-sm flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-code font-bold text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary">
                    SEC D
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Binding Constraints &amp; Solvers</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Mathematical optimality proof and model parameters
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm flex-1">
              {/* Card 1: Active Constraints */}
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm font-semibold text-on-surface uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[15px]">lock</span>
                  Active Binding Constraints
                </span>
                <div className="space-y-1.5 mt-1 font-body-sm text-[12px]">
                  <div className="flex items-start justify-between">
                    <span className="text-on-surface-variant">Safety Stock Target Floor:</span>
                    <span className="font-code font-semibold text-on-surface">I(t=2) ≥ 1,800u</span>
                  </div>
                  <div className="text-[11px] font-code text-on-surface-variant pl-2">
                    → Shadow Price: -$42.50 / unit deficit penalty
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-on-surface-variant">Reefer Pallet Slot Utilization:</span>
                    <span className="font-code font-semibold text-primary">92.4% (Bound)</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-on-surface-variant">Max Allowed Thermal Transit:</span>
                    <span className="font-code font-semibold text-on-surface">≤ 24.0h Passive</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Model & Solver Stats */}
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm font-semibold text-on-surface uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[15px]">memory</span>
                  Solver Telemetry
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] font-label-sm">
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">OPTIMIZER</span>
                    <span className="font-code text-on-surface font-medium">GLPK MILP v5.2</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">FEASIBILITY GAP</span>
                    <span className="font-code text-primary font-bold">0.00% (Global Opt)</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">SOLVE DURATION</span>
                    <span className="font-code text-on-surface font-medium">14.8 seconds</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block text-[10px]">VALIDATION CODE</span>
                    <span className="font-code text-on-surface font-medium">chk-deterministic-0</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Caveat & Unmodeled Assumptions */}
              <div className="p-space-sm rounded bg-surface-container-high/30 flex flex-col gap-1 text-[11px] font-body-sm text-on-surface-variant mt-auto">
                <span className="font-label-sm font-semibold text-on-surface uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[14px]">warning</span>
                  Model Limitations &amp; Caveats
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Road weather telemetry: <em>Not available (historical matrix applied)</em></li>
                  <li>Hospital return rate: <em>Assumed 0.0% for Lot {item.batchNumber}</em></li>
                  <li>All metrics reflect simulated optimization outcomes for FY25-W18.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Operational Workflow & Confirmation Drawer Bar */}
      <div className="bg-surface-container-lowest rounded shadow-xs p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">Recommendation Audit Complete</span>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm font-semibold">
                {isApproved ? 'WMS Clearance Active' : 'Ready for Dispatch'}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Validated against WMS manifest, DOT driver hours, and FEFO expiry rules.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs flex-wrap">
          <button
            onClick={() => onNavigate('allocation-plan')}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium transition-colors cursor-pointer"
          >
            Back to Plan
          </button>
          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">exposure</span>
            <span>What-If (+/- 200u)</span>
          </button>
          <button
            onClick={handleExportTrace}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Trace</span>
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary-container font-body-sm font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Authorize Dispatch</span>
          </button>
        </div>
      </div>

      {/* What-If Modal */}
      <WhatIfModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        baseQty={proposedQty}
        skuCode={item.skuCode}
        onApply={handleApplyWhatIf}
      />

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        skuCode={item.skuCode}
        lotId={item.batchNumber}
        currentQty={proposedQty}
        onConfirm={handleApplyOverride}
      />
    </div>
  );
};
