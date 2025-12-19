package net.javaguides.spring_app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_company", columnList = "company_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_created", columnList = "created_at")
})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    // Client Information
    @NotBlank(message = "Client name is required")
    @Size(max = 100, message = "Client name must be at most 100 characters")
    @Column(name = "client_name", nullable = false, length = 100)
    private String clientName;

    @Size(max = 100, message = "Company name must be at most 100 characters")
    @Column(name = "client_company", length = 100)
    private String clientCompany;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be at most 255 characters")
    @Column(name = "client_address", nullable = false, length = 255)
    private String clientAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    @Column(name = "client_city", nullable = false, length = 100)
    private String clientCity;

    @NotBlank(message = "Postal code is required")
    @Size(max = 20, message = "Postal code must be at most 20 characters")
    @Column(name = "client_postal_code", nullable = false, length = 20)
    private String clientPostalCode;

    @NotBlank(message = "Phone is required")
    @Size(max = 30, message = "Phone must be at most 30 characters")
    @Column(name = "client_phone", nullable = false, length = 30)
    private String clientPhone;

    @Size(max = 100, message = "Email must be at most 100 characters")
    @Column(name = "client_email", length = 100)
    private String clientEmail;

    @Size(max = 500, message = "Notes must be at most 500 characters")
    @Column(name = "notes", length = 500)
    private String notes;

    // Order Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    // Timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    // Totals
    @Column(name = "total_items")
    private Integer totalItems;

    @Column(name = "total_amount")
    private Double totalAmount;

    // Invoice number (generated when finalized)
    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    // Relationships
    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", insertable = false, updatable = false)
    private User company;

    public enum OrderStatus {
        PENDING,
        FINALIZED
    }

    // Default constructor
    public Order() {
        this.createdAt = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
    }

    // Constructor with companyId
    public Order(Long companyId) {
        this();
        this.companyId = companyId;
    }

    // Helper method to add item
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        item.setOrderId(this.id);
    }

    // Helper method to remove item
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    // Calculate totals
    public void calculateTotals() {
        this.totalItems = items.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
        this.totalAmount = items.stream()
                .mapToDouble(OrderItem::getSubtotal)
                .sum();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientCompany() {
        return clientCompany;
    }

    public void setClientCompany(String clientCompany) {
        this.clientCompany = clientCompany;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getClientCity() {
        return clientCity;
    }

    public void setClientCity(String clientCity) {
        this.clientCity = clientCity;
    }

    public String getClientPostalCode() {
        return clientPostalCode;
    }

    public void setClientPostalCode(String clientPostalCode) {
        this.clientPostalCode = clientPostalCode;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFinalizedAt() {
        return finalizedAt;
    }

    public void setFinalizedAt(LocalDateTime finalizedAt) {
        this.finalizedAt = finalizedAt;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public User getCompany() {
        return company;
    }

    public void setCompany(User company) {
        this.company = company;
    }
}
