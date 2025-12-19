package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.Order;
import net.javaguides.spring_app.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find all orders for a company, ordered by creation date descending
     */
    List<Order> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    /**
     * Find order by ID and company ID (for ownership verification)
     */
    Optional<Order> findByIdAndCompanyId(Long id, Long companyId);

    /**
     * Find orders by company and status
     */
    List<Order> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, OrderStatus status);

    /**
     * Count orders by company and status
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.companyId = :companyId AND o.status = :status")
    Long countByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") OrderStatus status);

    /**
     * Find the maximum invoice number for a company to generate the next one
     * Invoice format: INV-XXXXX where XXXXX is a zero-padded number
     */
    @Query("SELECT MAX(o.invoiceNumber) FROM Order o WHERE o.companyId = :companyId AND o.invoiceNumber IS NOT NULL")
    String findMaxInvoiceNumber(@Param("companyId") Long companyId);

    /**
     * Check if any order item uses a specific product
     */
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi JOIN oi.order o WHERE oi.productId = :productId AND o.companyId = :companyId")
    boolean existsOrderItemByProductIdAndCompanyId(@Param("productId") Long productId, @Param("companyId") Long companyId);
}
