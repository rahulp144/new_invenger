import React, { useState } from 'react';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseQty?: number;
  skuCode?: string;
  onApply: (newQty: number, originDc: string) => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  isOpen,
  onClose,
  baseQty = 1200,
  skuCode = 'SKU-9921-X',
  onApply,
}) => {
  const [delta, setDelta] = useState<number>(0);
  const [origin, setOrigin] = useState<string>('DC-East-02');
  const [transitSla, setTransitSla] = useState<string>('24h');

  if (!isOpen) return null;

  const currentTotal = baseQty + delta;
  const shadowPriceImpact = delta * -42.5;
  const projectedCoverageDays = (6.8 * (currentTotal / baseQty)).toFixed(1);
  const reeferUtilization = Math.min(100, (92.4 * (currentTotal / baseQty))).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">What-If Dispatch Simulation</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-code">{skuCode} • Parameter Sensitivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5">
          {/* Slider for volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface uppercase tracking-wider">
                Rebalanced Transfer Volume
              </label>
              <div className="flex items-center gap-2">
                <span className="font-code font-bold text-headline-sm text-primary">
                  {currentTotal > 0 ? `+${currentTotal.toLocaleString()}` : currentTotal} u
                </span>
                <span className={`font-label-sm text-[11px] font-code px-1.5 py-0.5 rounded ${delta >= 0 ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                  {delta >= 0 ? `+${delta}` : delta} u
                </span>
              </div>
            </div>

            <input
              type="range"
              min="-600"
              max="800"
              step="50"
              value={delta}
              onChange={(e) => setDelta(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 bg-surface-container-low rounded-lg cursor-pointer"
            />
            <div className="flex justify-between font-label-sm text-[10px] text-outline">
              <span>-600u (600u)</span>
              <span>Baseline: {baseQty}u</span>
              <span>+800u (2,000u)</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-[11px] text-on-surface-variant">Presets:</span>
            {[-200, 0, +200, +500].map((val) => (
              <button
                key={val}
                onClick={() => setDelta(val)}
                className={`px-2.5 py-1 rounded font-code text-label-sm transition-colors ${
                  delta === val
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>

          {/* Origin and Transit Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
                Origin Facility
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-surface-container-low border border-surface-container rounded px-2.5 py-1.5 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DC-East-02">DC-East-02 (Newark, NJ)</option>
                <option value="DC-Cent-04">DC-Cent-04 (Columbus, OH)</option>
                <option value="DC-South-02">DC-South-02 (Memphis, TN)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
                Reefer SLA Window
              </label>
              <select
                value={transitSla}
                onChange={(e) => setTransitSla(e.target.value)}
                className="bg-surface-container-low border border-surface-container rounded px-2.5 py-1.5 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="24h">24h Passive (Strict)</option>
                <option value="36h">36h Semi-Active</option>
                <option value="48h">48h Active Compressor</option>
              </select>
            </div>
          </div>

          {/* Projected Impact Preview Card */}
          <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[15px]">analytics</span>
              Projected Objective Impact
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-label-sm">
              <div className="p-2 rounded bg-surface-container-lowest">
                <span className="text-[10px] text-on-surface-variant block uppercase">Coverage</span>
                <span className="font-code font-bold text-primary text-[13px]">{projectedCoverageDays} Days</span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest">
                <span className="text-[10px] text-on-surface-variant block uppercase">Reefer Util</span>
                <span className={`font-code font-bold text-[13px] ${parseFloat(reeferUtilization) > 98 ? 'text-error' : 'text-on-surface'}`}>
                  {reeferUtilization}%
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest">
                <span className="text-[10px] text-on-surface-variant block uppercase">Obj Delta</span>
                <span className={`font-code font-bold text-[13px] ${shadowPriceImpact <= 0 ? 'text-primary' : 'text-error'}`}>
                  {shadowPriceImpact < 0 ? `-$${Math.abs(shadowPriceImpact).toLocaleString()}` : `+$${shadowPriceImpact.toLocaleString()}`}
                </span>
              </div>
            </div>
            {parseFloat(reeferUtilization) > 100 && (
              <div className="flex items-center gap-1.5 text-error font-body-sm text-[11px] mt-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Warning: Exceeds standard 6-pallet reefer capacity (requires split dispatch).</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <button
            onClick={() => setDelta(0)}
            className="px-3 py-1.5 rounded font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApply(currentTotal, origin);
                onClose();
              }}
              className="px-4 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Apply Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
