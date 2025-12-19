import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  Sparkles,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import type {
  QuickStats,
  InventoryAnalysis,
  StockRecommendation,
} from '@/types/analysis';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/Sidebar';

const Analysis: React.FC = () => {
  // State management
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [analysis, setAnalysis] = useState<InventoryAnalysis | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState('');

  // Fetch quick stats on mount
  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    setIsLoadingStats(true);
    setError('');
    try {
      const data = await apiService.analysis.getQuickStats();
      setQuickStats(data);
    } catch (err) {
      setError('Failed to load quick stats. Please try again.');
      console.error('Error fetching quick stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setError('');
    try {
      const data = await apiService.analysis.getAnalysis();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to generate AI analysis. Please try again.');
      console.error('Error fetching analysis:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'Excellent':
        return 'text-green-400';
      case 'Good':
        return 'text-blue-400';
      case 'Warning':
        return 'text-yellow-400';
      case 'Critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI Analysis</h1>
            <p className="text-gray-400">
              Get AI-powered insights and recommendations for your inventory
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold text-white">
                {isLoadingStats ? '...' : quickStats?.totalProducts || 0}
              </p>
            </div>

            {/* Low Stock */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-white">
                {isLoadingStats ? '...' : quickStats?.lowStock || 0}
              </p>
            </div>

            {/* Out of Stock */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-white">
                {isLoadingStats ? '...' : quickStats?.outOfStock || 0}
              </p>
            </div>

            {/* Sales Last Month */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Sold Last Month</p>
              <p className="text-3xl font-bold text-white">
                {isLoadingStats ? '...' : quickStats?.totalSoldLastMonth || 0}
              </p>
            </div>
          </div>

          {/* Generate Analysis Button */}
          {!analysis && (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-8 border border-purple-500/20 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    AI-Powered Analysis
                  </h2>
                  <p className="text-gray-400">
                    Get detailed insights and recommendations based on your inventory history
                  </p>
                </div>
              </div>
              <Button
                onClick={fetchAnalysis}
                disabled={isLoadingAnalysis}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                {isLoadingAnalysis ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-4">Overall Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Health Status</p>
                    <p className={`text-2xl font-bold ${getHealthStatusColor(analysis.summary.healthStatus)}`}>
                      {analysis.summary.healthStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-white">
                      {analysis.summary.totalProducts}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Units Sold</p>
                    <p className="text-2xl font-bold text-white">
                      {analysis.summary.totalUnitsSold}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300">{analysis.summary.description}</p>
              </div>

              {/* Top Selling Products */}
              {analysis.topSellingProducts.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-white">Top Selling Products</h2>
                  </div>
                  <div className="space-y-4">
                    {analysis.topSellingProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.productTitle}</p>
                            <p className="text-sm text-gray-400">
                              {product.unitsSold} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            ${product.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">Stock Recommendations</h2>
                  </div>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec) => (
                      <div
                        key={rec.productId}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-white mb-1">{rec.productTitle}</p>
                            <p className="text-sm text-gray-400">
                              Current Stock: {rec.currentStock} units
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(rec.urgency)}`}>
                            {rec.urgency} Priority
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-400 mb-1">Recommended Restock</p>
                            <p className="text-xl font-bold text-white">
                              {rec.recommendedRestock} units
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-3">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Key Insights</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
                            {insight.category}
                          </span>
                          {insight.actionable && (
                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
                              Actionable
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-white mb-2">{insight.title}</h3>
                        <p className="text-sm text-gray-300">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regenerate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={fetchAnalysis}
                  disabled={isLoadingAnalysis}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {isLoadingAnalysis ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analysis;
