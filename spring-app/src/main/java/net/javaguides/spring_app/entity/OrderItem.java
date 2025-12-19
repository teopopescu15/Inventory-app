package net.javaguides.spring_app.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "order_items", indexes = {
    @Index(name = "idx_order_item_order", columnList = "order_id"),
    @Index(name = "idx_order_item_product", columnList = "product_id")
})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @NotNull(message = "Product ID is required")
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_title", nullable = false, length = 100)
    private String productTitle;

    @Column(name = "product_image", columnDefinition = "TEXT")
    private String productImage;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    // Relationships
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    // Default constructor
    public OrderItem() {
    }

    // Constructor with all required fields
    public OrderItem(Long productId, String productTitle, String productImage,
                     Integer quantity, Double unitPrice) {
        this.productId = productId;
        this.productTitle = productTitle;
        this.productImage = productImage;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = quantity * unitPrice;
    }

    // Factory method for creating from Product
    public static OrderItem fromProduct(Product product, Integer quantity) {
        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setProductTitle(product.getTitle());
        item.setProductImage(product.getImage());
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        item.calculateSubtotal();
        return item;
    }

    // Calculate subtotal
    public void calculateSubtotal() {
        if (this.quantity != null && this.unitPrice != null) {
            this.subtotal = this.quantity * this.unitPrice;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateSubtotal();
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
        calculateSubtotal();
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
