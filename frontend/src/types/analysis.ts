/**
 * Type definitions for inventory analysis and history tracking
 */

/**
 * Product count history entry
 */
export interface ProductCountHistory {
  id: number;
  productId: number;
  oldCount: number;
  newCount: number;
  changeAmount: number;
  changeType: 'INITIAL' | 'SALE' | 'RESTOCK' | 'ADJUSTMENT';
  changedAt: string;  // ISO datetime string
  notes?: string;
}

/**
 * Overall inventory summary
 */
export interface OverallSummary {
  totalProducts: number;
  totalUnitsSold: number;
  healthStatus: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  description: string;
}

/**
 * Top selling product information
 */
export interface TopSellingProduct {
  productId: number;
  productTitle: string;
  unitsSold: number;
  revenue: number;
}

/**
 * Stock restock recommendation
 */
export interface StockRecommendation {
  productId: number;
  productTitle: string;
  currentStock: number;
  recommendedRestock: number;
  urgency: 'High' | 'Medium' | 'Low';
  reason: string;
}

/**
 * Pattern insight from AI analysis
 */
export interface PatternInsight {
  category: string;  // 'Sales', 'Inventory', 'Seasonal', etc.
  title: string;
  description: string;
  actionable: boolean;
}

/**
 * Complete inventory analysis response from AI
 */
export interface InventoryAnalysis {
  summary: OverallSummary;
  topSellingProducts: TopSellingProduct[];
  recommendations: StockRecommendation[];
  insights: PatternInsight[];
}

/**
 * Quick stats response (no AI analysis)
 */
export interface QuickStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalSoldLastMonth: number;
}
