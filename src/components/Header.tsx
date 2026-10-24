import React, { useState } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  datasetName: string;
  onRunOptimizer: () => void;
  isOptimizing: boolean;
  onExportGlobal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  datasetName,
  onRunOptimizer,
  isOptimizing,
  onExportGlobal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'supply-allocation':
        return 'Supply Allocation Overview';
      case 'data-validation':
        return 'Data & Validation';
      case 'risk-overview':
        return 'Risk Overview';
      case 'allocation-plan':
        return 'Allocation Plan';
      case 'recommendation-detail':
        return 'Recommendation Detail';
      case 'backtest':
        return 'Backtest & Policy Benchmark';
      default:
        return 'Supply Allocation';
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'ERP SAP S/4HANA Latency Warning',
      time: '6m ago',
      desc: 'Node DC-West-02 real-time inventory feed delayed. Cached baseline in effect.',
      type: 'warning'
    },
    {
      id: 2,
      title: 'Solver Run #OPT-9412 Converged',
      time: '14m ago',
      desc: '100% FEFO feasibility satisfied. 142 dispatches queued.',
      type: 'success'
    },
    {
      id: 3,
      title: 'Scheduled Nightly Batch',
      time: 'In 2h 18m',
      desc: 'FY25-W18-NightlyRun parameters lock at 22:00 EST.',
      type: 'info'
    }
  ];

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest z-40 px-space-lg flex items-center justify-between shadow-[0_1px_4px_rgba(15,23,42,0.06)] border-b border-surface-container select-none">
      {/* Left: Breadcrumbs & Dataset Tag */}
      <div className="flex items-center gap-space-md min-w-0">
        <div className="flex items-center gap-space-xs font-headline-sm text-[15px] text-on-surface">
          <span
            onClick={() => onNavigate('supply-allocation')}
            className="text-on-surface-variant font-body-sm text-[13px] hover:text-on-surface cursor-pointer transition-colors"
          >
            Operations
          </span>
          <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
          <span className="font-semibold text-on-surface truncate">{getBreadcrumbTitle()}</span>
        </div>

        <div className="h-4 w-px bg-surface-container-high hidden md:block"></div>

        {/* Dataset Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-low font-label-sm text-[11px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px] text-primary">database</span>
          <span className="font-code truncate max-w-[220px]">{datasetName}</span>
        </div>

        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-label-sm text-[10px] font-bold tracking-wide hidden sm:inline-flex items-center gap-1 border border-amber-200">
          <span className="material-symbols-outlined text-[13px] text-amber-700">warning</span>
          SIMULATED DATA
        </span>
      </div>

      {/* Right: Operational telemetry & Actions */}
      <div className="flex items-center gap-space-sm">
        {/* Cycle tag */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low font-label-sm text-[11px] text-on-surface">
          <span className="material-symbols-outlined text-[13px] text-outline">event_repeat</span>
          <span className="text-outline">Cycle:</span>
          <span className="font-semibold">FY25-W18</span>
        </div>

        {/* Last Run badge */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span>Last Run:</span>
          <span className="font-semibold">#OPT-9412</span>
          <span className="text-primary font-bold">(Converged)</span>
        </div>

        {/* Actions */}
        <button
          onClick={onExportGlobal}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-body-sm text-[12px] font-medium transition-colors cursor-pointer"
          title="Export current view as CSV"
        >
          <span className="material-symbols-outlined text-[15px]">file_download</span>
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onRunOptimizer}
          disabled={isOptimizing}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-body-sm text-[12px] font-semibold transition-all shadow-xs cursor-pointer ${
            isOptimizing
              ? 'bg-primary/70 text-on-primary cursor-not-allowed'
              : 'bg-primary hover:bg-primary-container text-on-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[15px] ${isOptimizing ? 'animate-spin' : ''}`}>
            {isOptimizing ? 'sync' : 'bolt'}
          </span>
          <span>{isOptimizing ? 'Optimizing...' : 'Run Optimizer'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            type="button"
            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-space-sm z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container px-2">
                <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                  Operational Alerts
                </span>
                <span className="font-label-sm text-[10px] text-primary font-semibold">
                  3 Unread
                </span>
              </div>
              <div className="flex flex-col gap-1.5 py-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => setShowNotifications(false)}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-outline font-label-sm">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug line-clamp-2">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-1 border-t border-surface-container text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-primary font-semibold hover:underline"
                >
                  Mark all as acknowledged
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
