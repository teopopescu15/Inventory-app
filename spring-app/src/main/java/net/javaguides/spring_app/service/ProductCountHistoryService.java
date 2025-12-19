package net.javaguides.spring_app.service;

import net.javaguides.spring_app.entity.ProductCountHistory;
import net.javaguides.spring_app.entity.ProductCountHistory.ChangeType;
import net.javaguides.spring_app.repository.ProductCountHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductCountHistoryService {

    @Autowired
    private ProductCountHistoryRepository productCountHistoryRepository;

    /**
     * Record a count change for a product
     * Automatically determines if it's a SALE (decrease) or RESTOCK (increase)
     * @param productId the product ID
     * @param oldCount the previous count
     * @param newCount the new count
     * @param notes optional notes about the change
     * @return the saved history entry
     */
    @Transactional
    public ProductCountHistory recordCountChange(Long productId, Integer oldCount,
                                                  Integer newCount, String notes) {
        // Determine change type based on count direction
        ChangeType changeType;
        if (oldCount.equals(newCount)) {
            // No change in count, treat as adjustment
            changeType = ChangeType.ADJUSTMENT;
        } else if (newCount < oldCount) {
            // Count decreased - likely a sale
            changeType = ChangeType.SALE;
        } else {
            // Count increased - likely a restock
            changeType = ChangeType.RESTOCK;
        }

        ProductCountHistory history = ProductCountHistory.create(
                productId, oldCount, newCount, changeType, notes);
        return productCountHistoryRepository.save(history);
    }

    /**
     * Record the initial count when a product is created
     * @param productId the product ID
     * @param initialCount the initial count
     * @return the saved history entry
     */
    @Transactional
    public ProductCountHistory recordInitialCount(Long productId, Integer initialCount) {
        ProductCountHistory history = ProductCountHistory.create(
                productId, 0, initialCount, ChangeType.INITIAL, "Product created");
        return productCountHistoryRepository.save(history);
    }

    /**
     * Get all history entries for a specific product
     * @param productId the product ID
     * @return list of history entries, ordered by timestamp descending
     */
    public List<ProductCountHistory> getProductHistory(Long productId) {
        return productCountHistoryRepository.findByProductIdOrderByChangedAtDesc(productId);
    }

    /**
     * Get all history entries for a company for the last N months
     * @param companyId the company ID
     * @param months number of months to look back
     * @return list of history entries
     */
    public List<ProductCountHistory> getCompanyHistoryLastMonths(Long companyId, int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        return productCountHistoryRepository.findByCompanyIdAndDateRange(companyId, startDate);
    }

    /**
     * Get total units sold for specific products since a start date
     * @param productIds list of product IDs
     * @param startDate the start date
     * @return list of objects containing productId and totalSold
     */
    public List<Object[]> getTotalSoldByProducts(List<Long> productIds, LocalDateTime startDate) {
        return productCountHistoryRepository.findTotalSoldByProducts(productIds, startDate);
    }
}
