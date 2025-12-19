package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Find all items for an order
     */
    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Delete all items for an order
     */
    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.orderId = :orderId")
    void deleteByOrderId(@Param("orderId") Long orderId);

    /**
     * Find items by product ID (to check product usage)
     */
    List<OrderItem> findByProductId(Long productId);

    /**
     * Count items by order ID
     */
    Long countByOrderId(Long orderId);
}
