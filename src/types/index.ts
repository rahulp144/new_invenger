export type ViewMode =
  | 'supply-allocation'
  | 'data-validation'
  | 'risk-overview'
  | 'allocation-plan'
  | 'recommendation-detail'
  | 'backtest';

export type ValidationState = 'ready' | 'running' | 'warning' | 'passed' | 'failed';

export type SolverState = 'optimal' | 'solving' | 'blocked' | 'fallback' | 'not-run';

export interface FindingItem {
  id: string;
  severity: 'WARNING' | 'RESOLVED' | 'INFO' | 'BLOCKING';
  sourceTable: string;
  rowNumber: string;
  targetField: string;
  validationRule: string;
  message: string;
  status: 'active' | 'resolved' | 'ignored';
  resolvedAction?: string;
}

export interface DispatchItem {
  id: string;
  transferId?: string;
  gate?: 'PASSED' | 'WARNING' | 'BLOCKED';
  gateStatus: 'PASSED' | 'WARNING' | 'BLOCKED';
  originDc: string;
  originCity: string;
  batchId?: string;
  batchNumber: string;
  expiryDate: string;
  skuCode: string;
  productName: string;
  skuName: string;
  tempClass: string;
  temperatureClass: string;
  destHub?: string;
  destinationHub: string;
  destCity?: string;
  destinationCity: string;
  allocatedQty: number;
  allocatedUnits: number;
  transitHours: number;
  transitTimeHours: number;
  eta: string;
  shelfLifeDays: number;
  shelfLifeAtArrivalDays: number;
  slaStatus: string;
  freightCost: number;
  freightMode: string;
  onHand?: number;
  safetyThreshold?: number;
  daysSupply?: number;
  recommendationText?: string;
  statusLabel?: 'Critical Risk' | 'Rebalance' | 'Stable' | 'Surplus' | 'In-Transit';
}

export interface DcNodeRisk {
  id: string;
  name: string;
  city: string;
  region: string;
  riskLevel: 'CRITICAL' | 'WARNING' | 'STABLE' | 'SURPLUS';
  stockoutWithinHours: number | null;
  capacityUtilization: number;
  activeSkus: number;
  criticalSkus: number;
  daysOfSupply: number;
  inboundShipments: number;
}
