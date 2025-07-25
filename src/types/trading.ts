// Type definitions for MetaTrader API integration

export interface LoginRequest {
  accountNumber: string;
  password: string;
  server: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  accountInfo?: AccountInfo;
}

export interface AccountInfo {
  accountNumber: string;
  name: string;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  currency: string;
  leverage: number;
  company: string;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

export interface HistoryTrade {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  closeTime: string;
  comment?: string;
}

export interface SymbolInfo {
  symbol: string;
  description: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  lotSize: number;
  marginRequired: number;
}

export interface SymbolSummary {
  symbol: string;
  netVolume: number;
  netType: 'BUY' | 'SELL' | 'NEUTRAL';
  totalProfit: number;
  totalSwap: number;
  totalCommission: number;
  positionCount: number;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  time: string;
}

// WebSocket message types for real-time updates
export interface WebSocketMessage {
  type: 'ACCOUNT_UPDATE' | 'POSITION_UPDATE' | 'PRICE_UPDATE' | 'TRADE_UPDATE';
  data: any;
  timestamp: string;
}

export interface AccountUpdateData {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
}

export interface PositionUpdateData {
  ticket: number;
  currentPrice: number;
  profit: number;
  swap: number;
}

export interface PriceUpdateData {
  symbol: string;
  bid: number;
  ask: number;
  time: string;
}

export interface TradeUpdateData {
  action: 'OPEN' | 'CLOSE' | 'MODIFY';
  position?: Position;
  historyTrade?: HistoryTrade;
}

// Error types
export interface ApiError {
  code: number;
  message: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}