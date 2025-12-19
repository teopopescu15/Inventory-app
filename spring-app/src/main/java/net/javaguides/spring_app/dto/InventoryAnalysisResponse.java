package net.javaguides.spring_app.dto;

import java.util.List;

/**
 * Response DTO for AI-powered inventory analysis
 * Contains structured insights from Gemini AI analysis
 */
public class InventoryAnalysisResponse {

    private OverallSummary summary;
    private List<TopSellingProduct> topSellingProducts;
    private List<StockRecommendation> recommendations;
    private List<PatternInsight> insights;

    /**
     * Overall summary of inventory health
     */
    public static class OverallSummary {
        private Integer totalProducts;
        private Integer totalUnitsSold;
        private String healthStatus;  // "Excellent", "Good", "Warning", "Critical"
        private String description;

        public OverallSummary() {}

        public OverallSummary(Integer totalProducts, Integer totalUnitsSold,
                            String healthStatus, String description) {
            this.totalProducts = totalProducts;
            this.totalUnitsSold = totalUnitsSold;
            this.healthStatus = healthStatus;
            this.description = description;
        }

        // Getters and setters
        public Integer getTotalProducts() { return totalProducts; }
        public void setTotalProducts(Integer totalProducts) { this.totalProducts = totalProducts; }

        public Integer getTotalUnitsSold() { return totalUnitsSold; }
        public void setTotalUnitsSold(Integer totalUnitsSold) { this.totalUnitsSold = totalUnitsSold; }

        public String getHealthStatus() { return healthStatus; }
        public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * Top selling product information
     */
    public static class TopSellingProduct {
        private Long productId;
        private String productTitle;
        private Integer unitsSold;
        private Double revenue;

        public TopSellingProduct() {}

        public TopSellingProduct(Long productId, String productTitle,
                                Integer unitsSold, Double revenue) {
            this.productId = productId;
            this.productTitle = productTitle;
            this.unitsSold = unitsSold;
            this.revenue = revenue;
        }

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductTitle() { return productTitle; }
        public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

        public Integer getUnitsSold() { return unitsSold; }
        public void setUnitsSold(Integer unitsSold) { this.unitsSold = unitsSold; }

        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
    }

    /**
     * Stock restock recommendation
     */
    public static class StockRecommendation {
        private Long productId;
        private String productTitle;
        private Integer currentStock;
        private Integer recommendedRestock;
        private String urgency;  // "High", "Medium", "Low"
        private String reason;

        public StockRecommendation() {}

        public StockRecommendation(Long productId, String productTitle,
                                  Integer currentStock, Integer recommendedRestock,
                                  String urgency, String reason) {
            this.productId = productId;
            this.productTitle = productTitle;
            this.currentStock = currentStock;
            this.recommendedRestock = recommendedRestock;
            this.urgency = urgency;
            this.reason = reason;
        }

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductTitle() { return productTitle; }
        public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

        public Integer getCurrentStock() { return currentStock; }
        public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

        public Integer getRecommendedRestock() { return recommendedRestock; }
        public void setRecommendedRestock(Integer recommendedRestock) {
            this.recommendedRestock = recommendedRestock;
        }

        public String getUrgency() { return urgency; }
        public void setUrgency(String urgency) { this.urgency = urgency; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    /**
     * Pattern insight from AI analysis
     */
    public static class PatternInsight {
        private String category;  // "Sales", "Inventory", "Seasonal", etc.
        private String title;
        private String description;
        private Boolean actionable;

        public PatternInsight() {}

        public PatternInsight(String category, String title,
                            String description, Boolean actionable) {
            this.category = category;
            this.title = title;
            this.description = description;
            this.actionable = actionable;
        }

        // Getters and setters
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Boolean getActionable() { return actionable; }
        public void setActionable(Boolean actionable) { this.actionable = actionable; }
    }

    // Main class constructors
    public InventoryAnalysisResponse() {}

    public InventoryAnalysisResponse(OverallSummary summary,
                                    List<TopSellingProduct> topSellingProducts,
                                    List<StockRecommendation> recommendations,
                                    List<PatternInsight> insights) {
        this.summary = summary;
        this.topSellingProducts = topSellingProducts;
        this.recommendations = recommendations;
        this.insights = insights;
    }

    // Main class getters and setters
    public OverallSummary getSummary() { return summary; }
    public void setSummary(OverallSummary summary) { this.summary = summary; }

    public List<TopSellingProduct> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopSellingProduct> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public List<StockRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<StockRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public List<PatternInsight> getInsights() { return insights; }
    public void setInsights(List<PatternInsight> insights) { this.insights = insights; }
}
