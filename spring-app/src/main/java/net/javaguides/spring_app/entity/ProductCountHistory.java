package net.javaguides.spring_app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_count_history", indexes = {
    @Index(name = "idx_history_product_id", columnList = "product_id"),
    @Index(name = "idx_history_changed_at", columnList = "changed_at")
})
public class ProductCountHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "old_count", nullable = false)
    private Integer oldCount;

    @Column(name = "new_count", nullable = false)
    private Integer newCount;

    @Column(name = "change_amount", nullable = false)
    private Integer changeAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 20)
    private ChangeType changeType;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(name = "notes", length = 255)
    private String notes;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    public enum ChangeType {
        INITIAL,     // When product is first created
        SALE,        // When count decreases (products sold)
        RESTOCK,     // When count increases (products restocked)
        ADJUSTMENT   // Manual inventory adjustment
    }

    // Default constructor
    public ProductCountHistory() {
        this.changedAt = LocalDateTime.now();
    }

    // Factory method for creating history entries
    public static ProductCountHistory create(Long productId, Integer oldCount,
            Integer newCount, ChangeType changeType, String notes) {
        ProductCountHistory history = new ProductCountHistory();
        history.setProductId(productId);
        history.setOldCount(oldCount);
        history.setNewCount(newCount);
        history.setChangeAmount(newCount - oldCount);
        history.setChangeType(changeType);
        history.setNotes(notes);
        return history;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getOldCount() {
        return oldCount;
    }

    public void setOldCount(Integer oldCount) {
        this.oldCount = oldCount;
    }

    public Integer getNewCount() {
        return newCount;
    }

    public void setNewCount(Integer newCount) {
        this.newCount = newCount;
    }

    public Integer getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(Integer changeAmount) {
        this.changeAmount = changeAmount;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
