import React, { useState } from 'react';

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  skuCode?: string;
  lotId?: string;
  currentQty?: number;
  onConfirm: (overrideData: {
    adjustedQty: number;
    reason: string;
    carrier: string;
    justification: string;
    plannerSignature: string;
  }) => void;
}

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({
  isOpen,
  onClose,
  skuCode = 'SKU-9921-X',
  lotId = 'LOT-2025-A89',
  currentQty = 1200,
  onConfirm,
}) => {
  const [adjustedQty, setAdjustedQty] = useState<number>(currentQty);
  const [reason, setReason] = useState<string>('Clinical Emergency Surge');
  const [carrier, setCarrier] = useState<string>('PolarLogix Dedicated Reefer #41');
  const [justification, setJustification] = useState<string>(
    'Hospital clinical trial protocol ramped up demand by 28% starting Day 3. Direct planner authorization granted.'
  );
  const [signature, setSignature] = useState<string>('Elena Rostova (Lead Ops)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      adjustedQty,
      reason,
      carrier,
      justification,
      plannerSignature: signature,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Manual Dispatch Override</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-code">
                {skuCode} • Batch {lotId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="p-3 bg-secondary-fixed/20 border border-secondary-fixed-dim rounded-lg text-body-sm text-on-surface">
            <div className="flex items-center gap-1.5 font-semibold text-secondary">
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              Deterministic Auditor Notice
            </div>
            <p className="text-[12px] text-on-surface-variant mt-1 leading-snug">
              Manual interventions bypass the MILP simplex solver optimality guarantees. An immutable audit record with your cryptographic hash will be logged in SAP S/4HANA.
            </p>
          </div>

          {/* Adjusted Qty */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
              Authorized Dispatch Volume (units)
            </label>
            <input
              type="number"
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(parseInt(e.target.value, 10) || 0)}
              className="bg-surface-container-low border border-surface-container rounded px-3 py-1.5 font-code text-headline-sm text-primary font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="font-label-sm text-[10px] text-outline">
              Recommended solver quantity was: {currentQty} units
            </span>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
              Operational Reason Code
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-surface-container-low border border-surface-container rounded px-3 py-1.5 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Clinical Emergency Surge">Clinical Emergency Surge</option>
              <option value="Quarantine Inspection Release">Quarantine Inspection Release</option>
              <option value="Reefer Carrier Diversion">Reefer Carrier Diversion</option>
              <option value="Physical Cycle Count Reconciliation">Physical Cycle Count Reconciliation</option>
            </select>
          </div>

          {/* Carrier */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
              Assigned Logistics Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="bg-surface-container-low border border-surface-container rounded px-3 py-1.5 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="PolarLogix Dedicated Reefer #41">PolarLogix Dedicated Reefer #41 (2-8°C)</option>
              <option value="CryoTrans Express #12">CryoTrans Express #12 (-20°C)</option>
              <option value="MedEx Priority Ground">MedEx Priority Ground (Ambient)</option>
            </select>
          </div>

          {/* Justification Text */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
              Operational Justification & Sign-Off
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="bg-surface-container-low border border-surface-container rounded px-3 py-2 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none text-[12px]"
              required
            />
          </div>

          {/* Planner Signature */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase">
              Authorized Planner Signature
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="bg-surface-container-low border border-surface-container rounded px-3 py-1.5 font-body-sm text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-container mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Commit Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
