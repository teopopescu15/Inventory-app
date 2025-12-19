package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.ProductCountHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductCountHistoryRepository extends JpaRepository<ProductCountHistory, Long> {

    /**
     * Find all history entries for a specific product, ordered by timestamp descending
     * @param productId the product ID
     * @return list of history entries
     */
    List<ProductCountHistory> findByProductIdOrderByChangedAtDesc(Long productId);

    /**
     * Find all history entries for a company (through product->category relationship)
     * within a date range
     * @param companyId the company ID
     * @param startDate the start date
     * @return list of history entries
     */
    @Query("SELECT h FROM ProductCountHistory h " +
           "JOIN h.product p " +
           "JOIN p.category c " +
           "WHERE c.companyId = :companyId " +
           "AND h.changedAt >= :startDate " +
           "ORDER BY h.changedAt DESC")
    List<ProductCountHistory> findByCompanyIdAndDateRange(
            @Param("companyId") Long companyId,
            @Param("startDate") LocalDateTime startDate);

    /**
     * Calculate total units sold for specific products since a start date
     * Returns aggregated data with product ID and total sold (negative changes)
     * @param productIds list of product IDs
     * @param startDate the start date
     * @return list of objects containing productId and totalSold
     */
    @Query("SELECT h.productId as productId, " +
           "SUM(CASE WHEN h.changeAmount < 0 THEN ABS(h.changeAmount) ELSE 0 END) as totalSold " +
           "FROM ProductCountHistory h " +
           "WHERE h.productId IN :productIds " +
           "AND h.changedAt >= :startDate " +
           "AND h.changeType = 'SALE' " +
           "GROUP BY h.productId")
    List<Object[]> findTotalSoldByProducts(
            @Param("productIds") List<Long> productIds,
            @Param("startDate") LocalDateTime startDate);
}
