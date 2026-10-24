import React, { useState } from 'react';
import { ValidationState, FindingItem, ViewMode } from '../types';
import { INITIAL_FINDINGS } from '../data/mockData';

interface DataValidationViewProps {
  onNavigate: (view: ViewMode) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const DataValidationView: React.FC<DataValidationViewProps> = ({
  onNavigate,
  onShowToast
}) => {
  const [validationState, setValidationState] = useState<ValidationState>('warning');
  const [findings, setFindings] = useState<FindingItem[]>(INITIAL_FINDINGS);
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [selectedPartition, setSelectedPartition] = useState('demo_supply_chain_q3_simulated.parquet (14.2 MB) [Active]');
  const [selectedDetailFinding, setSelectedDetailFinding] = useState<FindingItem | null>(null);

  const handleStateChange = (state: ValidationState) => {
    setValidationState(state);
    if (state === 'running') {
      onShowToast('Executing deterministic integrity validator across 48,250 records...', 'info');
      setTimeout(() => {
        setValidationState('warning');
        onShowToast('Validation completed with 3 non-blocking warnings', 'warning');
      }, 1500);
    }
  };

  const handleDampen = (id: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              severity: 'RESOLVED',
              status: 'resolved',
              resolvedAction: 'Dampened to 18d proxy',
              message: 'Lead time outlier manually dampened to 18.0 days based on rolling 60-day transit baseline.'
            }
          : f
      )
    );
    onShowToast('Lead time dampened to 18d proxy. Variance eliminated.', 'success');
  };

  const handleAuthorizeOverflow = (id: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              severity: 'RESOLVED',
              status: 'resolved',
              resolvedAction: 'Overflow Authorized',
              message: 'Cross-dock overflow authorized. Secondary terminal DC-02 scheduled for 24% load split.'
            }
          : f
      )
    );
    onShowToast('DC-04 overflow routing authorized to DC-02 terminal', 'success');
  };

  const handleIgnore = (id: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'ignored', resolvedAction: 'Ignored by Planner' } : f
      )
    );
    onShowToast('Finding marked as ignored for this cycle', 'info');
  };

  const handleReloadDemo = () => {
    setFindings(INITIAL_FINDINGS);
    setValidationState('warning');
    onShowToast('Reloaded baseline demonstration dataset and findings', 'info');
  };

  const handleExportAudit = () => {
    const content =
      'Severity,Source Table,Row,Target Field,Validation Rule,Finding Message,Action\n' +
      findings
        .map(
          (f) =>
            `"${f.severity}","${f.sourceTable}","${f.rowNumber}","${f.targetField}","${f.validationRule}","${f.message}","${f.resolvedAction || f.status}"`
        )
        .join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Optiqo_Validation_Audit_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Validation audit exported as CSV', 'success');
  };

  const filteredFindings = findings.filter((f) => {
    const textMatch =
      !searchFilter ||
      f.targetField.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.validationRule.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.sourceTable.toLowerCase().includes(searchFilter.toLowerCase());

    const severityMatch = severityFilter === 'ALL' || f.severity === severityFilter;
    const tableMatch = tableFilter === 'ALL' || f.sourceTable === tableFilter;

    return textMatch && severityMatch && tableMatch;
  });

  const activeWarningsCount = findings.filter((f) => f.severity === 'WARNING').length;

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg max-w-[1440px] mx-auto">
      {/* TOP CONTEXT & STATE SWITCHER */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Data &amp; Validation
            </h1>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-semibold">
              Step 01 / Pipeline Setup
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Ingest source datasets, run integrity validation rules, and resolve schema or anomaly
            discrepancies before generating inventory allocation models.
          </p>
        </div>

        {/* State Simulation Switcher Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-container-low border border-surface-container shadow-2xs overflow-x-auto shrink-0">
          <span className="px-2 py-1 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            Simulate State:
          </span>
          <button
            onClick={() => handleStateChange('ready')}
            className={`px-2.5 py-1 rounded font-label-sm text-[11px] transition-all cursor-pointer ${
              validationState === 'ready'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Before Validation
          </button>
          <button
            onClick={() => handleStateChange('running')}
            className={`px-2.5 py-1 rounded font-label-sm text-[11px] transition-all cursor-pointer ${
              validationState === 'running'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Validating (68%)
          </button>
          <button
            onClick={() => handleStateChange('warning')}
            className={`px-2.5 py-1 rounded font-label-sm text-[11px] transition-all cursor-pointer ${
              validationState === 'warning'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Passed w/ Warnings (Active)
          </button>
          <button
            onClick={() => handleStateChange('passed')}
            className={`px-2.5 py-1 rounded font-label-sm text-[11px] transition-all cursor-pointer ${
              validationState === 'passed'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Passed (Clean)
          </button>
          <button
            onClick={() => handleStateChange('failed')}
            className={`px-2.5 py-1 rounded font-label-sm text-[11px] transition-all cursor-pointer ${
              validationState === 'failed'
                ? 'bg-error text-on-error font-semibold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Failed (Blocked)
          </button>
        </div>
      </div>

      {/* SECTION 1: DATASET SELECTION CARD */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-lg flex flex-col gap-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md bg-surface-container-lowest border-b border-surface-container">
          <div className="flex items-start sm:items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">dataset</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Active Planning Dataset
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[10px] font-semibold tracking-wide">
                  [SIMULATED DATA - DEMO MODE]
                </span>
              </div>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                Source: ERP &amp; WMS Data Pipeline • Automated connector sync
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
            <span className="font-label-sm text-[11px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">history</span>
              Last validated:{' '}
              <span className="font-code text-on-surface-variant font-medium">2025-05-12 09:15 UTC</span>
            </span>
            <button
              onClick={handleReloadDemo}
              className="px-3 py-1.5 rounded bg-surface-container text-on-surface font-body-md text-[12px] font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Reload Demo
            </button>
            <button
              onClick={() => handleStateChange('running')}
              className="px-3.5 py-1.5 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              Validate Data
            </button>
          </div>
        </div>

        {/* Configuration & Ingestion Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md pt-space-xs">
          {/* File Selector */}
          <div className="flex flex-col gap-1 p-space-md rounded-lg bg-surface-container-low border border-surface-container">
            <label className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Select Parquet Partition
            </label>
            <div className="relative flex items-center mt-1">
              <select
                value={selectedPartition}
                onChange={(e) => {
                  setSelectedPartition(e.target.value);
                  onShowToast(`Switched active partition to ${e.target.value.split(' ')[0]}`, 'info');
                }}
                className="w-full h-8 pl-2 pr-7 rounded bg-surface-container-lowest text-on-surface font-code text-[11px] focus:outline-none appearance-none cursor-pointer border border-surface-container-high"
              >
                <option>demo_supply_chain_q3_simulated.parquet (14.2 MB) [Active]</option>
                <option>demo_supply_chain_q2_historical.parquet (13.8 MB)</option>
                <option>stress_test_black_swan_surge.parquet (19.4 MB)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-outline pointer-events-none text-[16px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Ingestion Timestamp */}
          <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Ingestion Timestamp
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-code text-body-md font-semibold text-on-surface">
                Today, 08:42:15 UTC
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-code font-semibold">
                v2.6 Schema
              </span>
            </div>
          </div>

          {/* Node Network Coverage */}
          <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Target Node Topology
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                12 Regional DCs
              </span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                84 Retail Fulfillment Hubs
              </span>
            </div>
          </div>

          {/* Parquet Schema Metadata */}
          <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Integrity Rule Count
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-code text-body-md font-semibold text-on-surface">
                18 Active Rules
              </span>
              <span className="font-label-sm text-[10px] text-tertiary font-bold">
                Deterministic Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DYNAMIC VALIDATION STATUS BANNER */}
      <div id="status-container">
        {/* Warning State */}
        {validationState === 'warning' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="w-2.5 bg-secondary shrink-0"></div>
            <div className="p-space-lg flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded bg-secondary-fixed/50 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-secondary text-[22px]">warning</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-space-sm flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Validation Completed with {activeWarningsCount} Warnings (1 Resolved, {activeWarningsCount} Non-Blocking)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
                      Pass Rate: 98.4%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-medium">
                      Simulation Ready
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
                    Dataset conforms to standard schema thresholds. 2 non-blocking inventory
                    discrepancies detected in Western Distribution Centers. You can proceed directly to
                    the Risk Overview module or review and remediate row-level findings below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-sm shrink-0 self-end lg:self-center">
                <button
                  onClick={() => {
                    const el = document.getElementById('findings-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded bg-surface-container text-on-surface font-body-md text-[12px] font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Review Findings
                </button>
                <button
                  onClick={() => onNavigate('risk-overview')}
                  className="px-3.5 py-1.5 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  Accept &amp; Proceed
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ready State */}
        {validationState === 'ready' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="w-2.5 bg-outline-variant shrink-0"></div>
            <div className="p-space-lg flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-outline text-[22px]">play_circle</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Pipeline Ready for Ingestion Check
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-medium">
                      Idle
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Click <span className="font-semibold text-primary">"Validate Data"</span> to execute
                    validation against 48,250 staging records across 18 deterministic integrity checks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStateChange('running')}
                className="px-4 py-2 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-colors shrink-0 cursor-pointer"
              >
                Run Validation Now
              </button>
            </div>
          </div>
        )}

        {/* Running State */}
        {validationState === 'running' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="w-2.5 bg-secondary-container shrink-0"></div>
            <div className="p-space-lg flex-1 flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-md flex-wrap">
                <div className="flex items-center gap-space-md">
                  <div className="w-9 h-9 rounded bg-secondary-fixed flex items-center justify-center shrink-0 animate-spin">
                    <span className="material-symbols-outlined text-secondary text-[22px]">sync</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Validating Dataset Partitions...
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Step 4 of 6: Lead-time distribution variance &amp; outlier isolation
                    </span>
                  </div>
                </div>
                <span className="font-code text-display-sm text-secondary font-bold">68%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-300 w-[68%]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Passed Clean State */}
        {validationState === 'passed' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="w-2.5 bg-primary shrink-0"></div>
            <div className="p-space-lg flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Dataset Fully Verified • Zero Discrepancies
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-semibold">
                      100% Pass Rate
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    All 18 operational integrity rules passed with 48,250 records accepted. Allocation solver input vectors generated.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('risk-overview')}
                className="px-4 py-2 rounded bg-primary text-on-primary font-body-md text-[12px] font-semibold hover:bg-primary-container transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                Proceed to Risk Overview
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {validationState === 'failed' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="w-2.5 bg-error shrink-0"></div>
            <div className="p-space-lg flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded bg-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-[22px]">block</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold text-error">
                      Validation Blocked: 4 Fatal Schema Errors Found
                    </span>
                    <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[11px] font-semibold">
                      Gated Pipeline
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Fatal foreign key mismatch in <code className="font-code text-error font-medium">sku_catalog</code> and missing demand columns. Downstream model generation is locked.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStateChange('warning')}
                className="px-4 py-2 rounded bg-error text-on-error font-body-md text-[12px] font-semibold hover:opacity-95 transition-opacity shrink-0 cursor-pointer"
              >
                Resolve Schema &amp; Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Total Records
            </span>
            <span className="material-symbols-outlined text-outline-variant text-[18px]">table_rows</span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg font-bold text-on-surface font-code tracking-tight">
              48,250
            </span>
            <span className="font-label-sm text-[11px] text-primary font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +3,120
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-surface-container text-on-surface-variant font-body-sm text-[11px]">
            <span>Across 6 core parquet tables</span>
            <span className="font-code text-outline">14.2 MB</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Fatal Errors
            </span>
            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold">
              Pass
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg font-bold text-on-surface font-code tracking-tight">
              {validationState === 'failed' ? 4 : 0}
            </span>
            <span className="font-label-sm text-[11px] text-primary font-medium">Blocking</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-surface-container text-on-surface-variant font-body-sm text-[11px]">
            <span>Zero fatal schema rejections</span>
            <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Validation Warnings
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[10px] font-bold">
              Review
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg font-bold text-secondary font-code tracking-tight">
              {activeWarningsCount}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-surface-container text-on-surface-variant font-body-sm text-[11px]">
            <span>2 lead-time anomalies, 1 null stock</span>
            <span className="font-label-sm text-secondary font-code font-semibold">1 fixed</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Usable Inventory Units
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-[10px] font-bold">
              99.2%
            </span>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg font-bold text-primary font-code tracking-tight">
              47,890
            </span>
            <span className="font-label-sm text-[11px] text-outline font-medium">SKU-DCs</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs border-t border-surface-container text-on-surface-variant font-body-sm text-[11px]">
            <span>360 rows flagged for proxy interpolation</span>
            <span className="material-symbols-outlined text-outline text-[16px]">info</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: INGESTION PIPELINE DIAGNOSTIC MOSAIC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Vector Density & Distribution Plot */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">waterfall_chart</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Parquet Ingestion Density &amp; Lead-Time Variance
              </span>
            </div>
            <div className="flex items-center gap-space-md font-label-sm text-[11px]">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Valid Rows
              </span>
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Variance Flagged
              </span>
            </div>
          </div>

          {/* Rich Visual Vector Graphic */}
          <div className="py-space-sm">
            <svg className="w-full h-36 overflow-visible" preserveAspectRatio="none" viewBox="0 0 680 140">
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00685f" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#00685f" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              {/* Grid horizontal guides */}
              <line stroke="#e5eeff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="20" y2="20"></line>
              <line stroke="#e5eeff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="60" y2="60"></line>
              <line stroke="#e5eeff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="680" y1="100" y2="100"></line>
              <line stroke="#cbdbf5" strokeWidth="1" x1="0" x2="680" y1="130" y2="130"></line>

              {/* Area fill */}
              <path
                d="M0,110 Q45,95 90,80 T180,65 T270,72 T360,40 T450,55 T540,30 T630,75 L680,82 L680,130 L0,130 Z"
                fill="url(#primaryAreaGrad)"
              ></path>

              {/* Primary curve line */}
              <path
                d="M0,110 Q45,95 90,80 T180,65 T270,72 T360,40 T450,55 T540,30 T630,75 L680,82"
                fill="none"
                stroke="#00685f"
                strokeWidth="2.5"
              ></path>

              {/* Outlier callout 1 */}
              <circle cx="360" cy="40" fill="#5bb8fe" r="5" stroke="#006398" strokeWidth="2"></circle>
              <text
                fill="#00476e"
                fontFamily="JetBrains Mono"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                x="360"
                y="26"
              >
                +3.8σ Lead-Time (Row #18,291)
              </text>

              {/* Outlier callout 2 */}
              <circle cx="540" cy="30" fill="#5bb8fe" r="5" stroke="#006398" strokeWidth="2"></circle>
              <text
                fill="#00476e"
                fontFamily="JetBrains Mono"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                x="540"
                y="16"
              >
                Capacity 104% (DC-04)
              </text>

              {/* Standard ticks */}
              <circle cx="90" cy="80" fill="#00685f" r="3"></circle>
              <circle cx="180" cy="65" fill="#00685f" r="3"></circle>
              <circle cx="270" cy="72" fill="#00685f" r="3"></circle>
              <circle cx="450" cy="55" fill="#00685f" r="3"></circle>
              <circle cx="630" cy="75" fill="#00685f" r="3"></circle>
            </svg>
          </div>
          <div className="flex items-center justify-between pt-space-xs font-label-sm text-[11px] text-outline border-t border-surface-container">
            <span>Partition batch range: Part_00000 to Part_00012</span>
            <span className="font-code text-on-surface-variant font-medium">
              Mean lead time: 14.1 days (σ = 2.4)
            </span>
          </div>
        </div>

        {/* Table Ingestion Status Checklist */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-space-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Table Schema Coverage
            </span>
            <span className="font-label-sm text-[11px] text-primary font-semibold font-code">
              6 / 6 Validated
            </span>
          </div>
          <div className="flex flex-col gap-space-xs my-space-xs">
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span className="font-code text-body-sm font-semibold text-on-surface">inventory_levels</span>
              </div>
              <span className="font-label-sm text-[11px] text-outline font-code">24,120 rows</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">warning</span>
                <span className="font-code text-body-sm font-semibold text-on-surface">lead_time_matrix</span>
              </div>
              <span className="font-label-sm text-[11px] text-secondary font-code font-semibold">
                2 warnings
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span className="font-code text-body-sm font-semibold text-on-surface">dc_master</span>
              </div>
              <span className="font-label-sm text-[11px] text-outline font-code">12 rows</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span className="font-code text-body-sm font-semibold text-on-surface">sku_catalog</span>
              </div>
              <span className="font-label-sm text-[11px] text-outline font-code">4,812 rows</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span className="font-code text-body-sm font-semibold text-on-surface">hub_network_routing</span>
              </div>
              <span className="font-label-sm text-[11px] text-outline font-code">19,308 rows</span>
            </div>
          </div>
          <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] border-t border-surface-container">
            <span>Deterministic Rule Set</span>
            <span className="font-code text-primary font-semibold">v2025.1-prod</span>
          </div>
        </div>
      </div>

      {/* SECTION 5: VALIDATION FINDINGS TABLE */}
      <div
        className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden flex flex-col"
        id="findings-section"
      >
        {/* Table Operational Control Toolbar */}
        <div className="p-space-md bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Validation Audit Log &amp; Findings
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-code font-medium">
              {filteredFindings.length} items
            </span>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            {/* Search filter */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2 text-outline text-[16px] pointer-events-none">
                search
              </span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-8 pl-7 pr-3 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none w-48 sm:w-60 border border-surface-container-high"
                placeholder="Filter field, rule or code..."
                type="text"
              />
            </div>
            {/* Severity dropdown */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 px-2.5 rounded bg-surface-container-low text-on-surface font-label-sm text-[11px] focus:outline-none cursor-pointer border border-surface-container-high"
            >
              <option value="ALL">Severity: All</option>
              <option value="WARNING">Warnings</option>
              <option value="RESOLVED">Resolved</option>
              <option value="INFO">Info</option>
            </select>
            {/* Table dropdown */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="h-8 px-2.5 rounded bg-surface-container-low text-on-surface font-label-sm text-[11px] focus:outline-none cursor-pointer border border-surface-container-high"
            >
              <option value="ALL">Table: All Tables</option>
              <option value="inventory_levels">inventory_levels</option>
              <option value="lead_time_matrix">lead_time_matrix</option>
              <option value="dc_master">dc_master</option>
            </select>
            {/* Export Action */}
            <button
              onClick={handleExportAudit}
              className="h-8 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Export Audit
            </button>
          </div>
        </div>

        {/* Operational Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-outline font-label-sm text-[11px] uppercase tracking-wider h-9 border-b border-surface-container">
                <th className="py-2 px-space-md font-semibold">Severity</th>
                <th className="py-2 px-space-md font-semibold">Source Table</th>
                <th className="py-2 px-space-md font-semibold">Row #</th>
                <th className="py-2 px-space-md font-semibold">Target Field</th>
                <th className="py-2 px-space-md font-semibold">Validation Rule</th>
                <th className="py-2 px-space-md font-semibold">Finding Message &amp; Resolution</th>
                <th className="py-2 px-space-md font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredFindings.map((finding) => {
                const isWarn = finding.severity === 'WARNING';
                const isResolved = finding.severity === 'RESOLVED';
                const isInfo = finding.severity === 'INFO';

                return (
                  <tr
                    key={finding.id}
                    className="hover:bg-surface-container-low/60 transition-colors"
                  >
                    <td className="py-space-sm px-space-md whitespace-nowrap">
                      {isWarn && (
                        <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[10px] font-semibold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> WARNING
                        </span>
                      )}
                      {isResolved && (
                        <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-semibold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">check</span> RESOLVED
                        </span>
                      )}
                      {isInfo && (
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-semibold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> INFO
                        </span>
                      )}
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap">
                      <span className="font-code text-label-sm text-on-surface bg-surface-container px-1.5 py-0.5 rounded">
                        {finding.sourceTable}
                      </span>
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap font-code text-label-sm text-on-surface-variant">
                      {finding.rowNumber}
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap font-code text-label-sm text-on-surface font-semibold">
                      {finding.targetField}
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap font-code text-label-sm text-secondary">
                      {finding.validationRule}
                    </td>
                    <td className="py-space-sm px-space-md font-body-sm text-[12px] text-on-surface max-w-md">
                      {finding.message}
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap text-right">
                      {finding.id === 'f1' && finding.status === 'active' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDampen(finding.id)}
                            className="px-2 py-1 rounded text-primary hover:bg-surface-container font-body-sm text-[11px] font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            Dampen (18d)
                          </button>
                          <button
                            onClick={() => handleIgnore(finding.id)}
                            className="px-2 py-1 rounded text-outline hover:bg-surface-container font-body-sm text-[11px] transition-colors cursor-pointer"
                            type="button"
                          >
                            Ignore
                          </button>
                        </div>
                      )}
                      {finding.id === 'f2' && finding.status === 'active' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAuthorizeOverflow(finding.id)}
                            className="px-2 py-1 rounded text-primary hover:bg-surface-container font-body-sm text-[11px] font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            Authorize Overflow
                          </button>
                          <button
                            onClick={() => handleIgnore(finding.id)}
                            className="px-2 py-1 rounded text-outline hover:bg-surface-container font-body-sm text-[11px] transition-colors cursor-pointer"
                            type="button"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {(finding.status === 'resolved' || finding.status === 'ignored') && (
                        <span className="font-label-sm text-[10px] text-outline font-code">
                          {finding.resolvedAction || 'Resolved'}
                        </span>
                      )}
                      {finding.id === 'f4' && (
                        <button
                          onClick={() => setSelectedDetailFinding(finding)}
                          className="px-2 py-1 rounded text-outline hover:bg-surface-container font-body-sm text-[11px] transition-colors cursor-pointer"
                          type="button"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Meta */}
        <div className="px-space-md py-space-sm bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm text-on-surface-variant font-label-sm text-[11px] border-t border-surface-container">
          <div className="flex items-center gap-space-sm">
            <span>
              Deterministic Rule Engine: <span className="font-code font-medium">18 of 18 Active</span>
            </span>
            <span>•</span>
            <span>
              Filtered view:{' '}
              <span className="font-code font-semibold text-on-surface">
                {filteredFindings.length} items
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>All fatal blocks resolved</span>
          </div>
        </div>
      </div>

      {/* SECTION 6: WORKFLOW NAVIGATION & NEXT-STEP GATE */}
      <div className="sticky bottom-4 z-30 bg-surface-container-lowest rounded-xl shadow-md border border-surface-container p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Dataset Cleared for Risk Analysis
              </span>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold">
                Active Pipeline Stage
              </span>
            </div>
            <span className="font-body-sm text-[12px] text-on-surface-variant">
              {activeWarningsCount} warnings present, but non-blocking. Next module will simulate safety-stock impact and stockout risks.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={() => onShowToast('Exported PDF Data Quality & Audit Report (4 pages)', 'success')}
            className="px-3.5 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Export Quality Report (PDF)
          </button>
          <button
            onClick={() => onNavigate('risk-overview')}
            disabled={validationState === 'failed' || validationState === 'running'}
            className={`px-4 py-2 rounded font-body-md text-[12px] font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              validationState === 'failed' || validationState === 'running'
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            Continue to Risk Overview
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetailFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Rule Diagnostic Detail ({selectedDetailFinding.validationRule})
              </h3>
              <button
                onClick={() => setSelectedDetailFinding(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="my-4 space-y-2 text-body-sm text-on-surface">
              <p>
                <strong>Source Table:</strong>{' '}
                <code className="font-code">{selectedDetailFinding.sourceTable}</code> (Row {selectedDetailFinding.rowNumber})
              </p>
              <p>
                <strong>Target Field:</strong>{' '}
                <code className="font-code text-primary font-semibold">{selectedDetailFinding.targetField}</code>
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                {selectedDetailFinding.message}
              </p>
              <div className="p-3 rounded bg-surface-container-low text-[12px] font-code">
                Constraint: Reorder point boundary check clamped negative allocated vector (-12) to floor 0 units. Residual standard deviation intact.
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-surface-container">
              <button
                onClick={() => setSelectedDetailFinding(null)}
                className="px-4 py-1.5 rounded bg-primary text-on-primary font-semibold text-body-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
