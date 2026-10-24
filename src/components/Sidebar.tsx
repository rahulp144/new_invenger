import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
  environment: string;
  onSwitchEnvironment: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isDarkTheme = true,
  onToggleTheme,
  environment,
  onSwitchEnvironment
}) => {
  const navItems: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'supply-allocation', label: 'Supply Allocation', icon: 'hub' },
    { id: 'data-validation', label: 'Data & Validation', icon: 'verified' },
    { id: 'risk-overview', label: 'Risk Overview', icon: 'warning' },
    { id: 'allocation-plan', label: 'Allocation Plan', icon: 'inventory_2' },
    { id: 'recommendation-detail', label: 'Recommendation Detail', icon: 'analytics' },
    { id: 'backtest', label: 'Backtest', icon: 'history' }
  ];

  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1WHMuD3UGToF3fAp2yWQIXT1ltmrMo3v5wsOB5_QnoHFzFqbUCicttGrFADK_iqrs5yZu4u1E7CDKlTziQ0avIwqJeyZUjfgKQTpHp0IfdJikhylM7IuNTHaddQwCdbq3HBWnDkiwsf7jsxjBUzrkQYiylqfeMUjCa4y8ebybSnO1_14I3khPzGvHDj6X7Z6qnPJtbANsdVVy6Dvf6hyhT6P2TfU1ghETFhpCK9vZXjRpPxcNLymtkvBbQ';

  const avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDaZRxk1hbQltXke2E11DdOEupdIIsS0Mrb2AYW8YFHImNEgS3MPDkhhbLBnmgowgNYTjN5CfVti2Q84kT-fZuQ4XHm9WGCD_xxlts1y6n37g29cMqPE0aVBDNzN-PUsXG2Hmlie6evRdkFL_oSGcxsfUBgECRNy4tQhPXqNoCtYhaeLimf-35efIlfvENDzIA_xhC2mA-chLDwlxwKIcHRB4SuPsOXO3SOGkdvH853EA3VHrLk7Bv5';

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[260px] z-50 flex flex-col justify-between transition-colors duration-200 select-none ${
        isDarkTheme
          ? 'bg-inverse-surface text-inverse-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.12)]'
          : 'bg-surface-container-lowest text-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container'
      }`}
    >
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div
          className={`h-16 px-space-lg flex items-center gap-space-sm cursor-pointer border-b ${
            isDarkTheme
              ? 'bg-surface-container-lowest/5 border-surface-container-highest/10'
              : 'border-surface-container'
          }`}
          onClick={() => onSelectView('supply-allocation')}
        >
          <img
            alt="Optiqo Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={logoUrl}
            onError={(e) => {
              // Fallback icon container
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-headline-sm text-headline-sm font-bold tracking-tight leading-none ${
                  isDarkTheme ? 'text-surface-container-lowest' : 'text-on-surface'
                }`}
              >
                Optiqo
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-sm font-label-sm text-[10px] font-medium leading-none ${
                  isDarkTheme
                    ? 'bg-surface-container-highest/20 text-inverse-on-surface/80'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                VYROX
              </span>
            </div>
            <span
              className={`font-label-sm text-[10px] uppercase tracking-wider mt-0.5 truncate ${
                isDarkTheme ? 'text-outline-variant' : 'text-outline'
              }`}
            >
              Distribution Intelligence
            </span>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-space-md py-space-sm flex items-center justify-between">
          <div
            className={`font-label-sm text-[11px] uppercase tracking-wider font-semibold ${
              isDarkTheme ? 'text-outline-variant' : 'text-outline'
            }`}
          >
            Operational Modules
          </div>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title="Toggle Sidebar Theme"
              className={`p-1 rounded text-[12px] transition-colors ${
                isDarkTheme
                  ? 'text-inverse-on-surface/60 hover:text-white hover:bg-white/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isDarkTheme ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-space-md">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-space-sm px-space-md py-2 rounded text-left transition-all font-body-md text-body-md whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : isDarkTheme
                    ? 'text-inverse-on-surface/80 hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {item.id === 'risk-overview' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-error animate-pulse"></span>
                )}
                {item.id === 'allocation-plan' && (
                  <span className="ml-auto text-[10px] font-code px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                    142
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Engine & Profile Section */}
      <div
        className={`flex flex-col gap-space-sm p-space-md border-t ${
          isDarkTheme
            ? 'bg-surface-container-lowest/5 border-surface-container-highest/10 text-outline-variant'
            : 'bg-surface-container-low border-surface-container text-on-surface-variant'
        }`}
      >
        {/* Engine Status Box */}
        <div
          className={`flex flex-col gap-1 p-space-sm rounded-lg shadow-xs ${
            isDarkTheme ? 'bg-surface-container-lowest/10' : 'bg-surface-container-lowest'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline">Engine Status</span>
            <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-primary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Active
            </span>
          </div>
          <div
            className={`font-code text-[11px] font-medium ${
              isDarkTheme ? 'text-inverse-on-surface' : 'text-on-surface'
            }`}
          >
            Optimizer: GLPK v5.2
          </div>
          <button
            onClick={onSwitchEnvironment}
            type="button"
            className={`mt-1 flex items-center justify-between w-full px-2 py-1 rounded text-[11px] font-label-sm transition-colors cursor-pointer ${
              isDarkTheme
                ? 'bg-white/10 hover:bg-white/15 text-white'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
          >
            <span className="truncate">{environment}</span>
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-space-sm pt-1">
          <img
            alt="Elena Rostova"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-primary/30"
            src={avatarUrl}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <span
              className={`font-body-sm font-semibold truncate leading-tight ${
                isDarkTheme ? 'text-surface-container-lowest' : 'text-on-surface'
              }`}
            >
              Elena Rostova
            </span>
            <span className="font-label-sm text-[10px] text-outline truncate leading-tight">
              Senior Inventory Ops
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between font-label-sm text-[10px] text-outline pt-1">
          <span>v1.4.2-prod</span>
          <span>Team VYROX</span>
        </div>
      </div>
    </aside>
  );
};
