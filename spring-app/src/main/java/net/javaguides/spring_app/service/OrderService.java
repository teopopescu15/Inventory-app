package net.javaguides.spring_app.service;

import net.javaguides.spring_app.dto.CreateOrderDTO;
import net.javaguides.spring_app.dto.OrderItemDTO;
import net.javaguides.spring_app.entity.Order;
import net.javaguides.spring_app.entity.OrderItem;
import net.javaguides.spring_app.entity.Product;
import net.javaguides.spring_app.entity.ProductCountHistory.ChangeType;
import net.javaguides.spring_app.repository.OrderItemRepository;
import net.javaguides.spring_app.repository.OrderRepository;
import net.javaguides.spring_app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCountHistoryService productCountHistoryService;

    /**
     * Get all orders for a company
     */
    public List<Order> getOrders(Long companyId) {
        return orderRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    /**
     * Get orders by status for a company
     */
    public List<Order> getOrdersByStatus(Long companyId, Order.OrderStatus status) {
        return orderRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, status);
    }

    /**
     * Get a single order by ID with items
     */
    public Order getOrderById(Long companyId, Long orderId) {
        return orderRepository.findByIdAndCompanyId(orderId, companyId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));
    }

    /**
     * Create a new order with PENDING status
     */
    @Transactional
    public Order createOrder(Long companyId, CreateOrderDTO dto) {
        // Validate all products exist and belong to company
        Map<Long, Product> productMap = validateAndGetProducts(companyId, dto.getItems());

        // Create order entity
        Order order = new Order(companyId);
        order.setClientName(dto.getClientName());
        order.setClientCompany(dto.getClientCompany());
        order.setClientAddress(dto.getClientAddress());
        order.setClientCity(dto.getClientCity());
        order.setClientPostalCode(dto.getClientPostalCode());
        order.setClientPhone(dto.getClientPhone());
        order.setClientEmail(dto.getClientEmail());
        order.setNotes(dto.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        // Save order to get ID
        Order savedOrder = orderRepository.save(order);

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemDTO itemDto : dto.getItems()) {
            Product product = productMap.get(itemDto.getProductId());
            OrderItem item = OrderItem.fromProduct(product, itemDto.getQuantity());
            item.setOrderId(savedOrder.getId());
            orderItems.add(item);
        }

        // Save all items
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(savedItems);

        // Calculate and update totals
        savedOrder.calculateTotals();
        orderRepository.save(savedOrder);

        return savedOrder;
    }

    /**
     * Update an existing PENDING order
     */
    @Transactional
    public Order updateOrder(Long companyId, Long orderId, CreateOrderDTO dto) {
        // Get existing order
        Order order = orderRepository.findByIdAndCompanyId(orderId, companyId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        // Verify order is PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Cannot update order - only PENDING orders can be modified");
        }

        // Validate all products exist and belong to company
        Map<Long, Product> productMap = validateAndGetProducts(companyId, dto.getItems());

        // Update order details
        order.setClientName(dto.getClientName());
        order.setClientCompany(dto.getClientCompany());
        order.setClientAddress(dto.getClientAddress());
        order.setClientCity(dto.getClientCity());
        order.setClientPostalCode(dto.getClientPostalCode());
        order.setClientPhone(dto.getClientPhone());
        order.setClientEmail(dto.getClientEmail());
        order.setNotes(dto.getNotes());

        // Delete existing items
        orderItemRepository.deleteByOrderId(orderId);

        // Create new items
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemDTO itemDto : dto.getItems()) {
            Product product = productMap.get(itemDto.getProductId());
            OrderItem item = OrderItem.fromProduct(product, itemDto.getQuantity());
            item.setOrderId(order.getId());
            orderItems.add(item);
        }

        // Save all items
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);
        order.setItems(savedItems);

        // Recalculate totals
        order.calculateTotals();
        orderRepository.save(order);

        return order;
    }

    /**
     * Delete a PENDING order
     */
    @Transactional
    public void deleteOrder(Long companyId, Long orderId) {
        // Get existing order
        Order order = orderRepository.findByIdAndCompanyId(orderId, companyId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        // Verify order is PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Cannot delete order - only PENDING orders can be deleted");
        }

        // Delete order (items will be cascade deleted)
        orderRepository.delete(order);
    }

    /**
     * Finalize order - check stock, deduct inventory, generate invoice, change status
     */
    @Transactional
    public Order finalizeOrder(Long companyId, Long orderId) {
        // Get existing order with items
        Order order = orderRepository.findByIdAndCompanyId(orderId, companyId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        // Verify order is PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Cannot finalize order - order is already finalized");
        }

        // Load items
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        if (items.isEmpty()) {
            throw new RuntimeException("Cannot finalize order - order has no items");
        }

        // Step 1: Validate stock availability for all items
        List<String> insufficientStockErrors = new ArrayList<>();
        Map<Long, Product> productMap = new HashMap<>();

        for (OrderItem item : items) {
            Product product = productRepository.findByIdAndCategoryCompanyId(
                    item.getProductId(), companyId)
                    .orElseThrow(() -> new RuntimeException(
                            "Product not found: " + item.getProductTitle()));

            productMap.put(product.getId(), product);

            if (product.getCount() < item.getQuantity()) {
                insufficientStockErrors.add(String.format(
                        "Product '%s' has insufficient stock. Required: %d, Available: %d",
                        product.getTitle(), item.getQuantity(), product.getCount()));
            }
        }

        // If any product has insufficient stock, reject finalization
        if (!insufficientStockErrors.isEmpty()) {
            throw new RuntimeException("Cannot finalize order - insufficient stock:\n" +
                    String.join("\n", insufficientStockErrors));
        }

        // Step 2: All stock is available - proceed with deduction
        for (OrderItem item : items) {
            Product product = productMap.get(item.getProductId());
            Integer oldCount = product.getCount();
            Integer newCount = oldCount - item.getQuantity();

            // Update product count
            product.setCount(newCount);
            productRepository.save(product);

            // Record history with order reference
            String notes = String.format("Sale - Order #%d", orderId);
            productCountHistoryService.recordCountChange(
                    product.getId(), oldCount, newCount, notes);
        }

        // Step 3: Generate invoice number
        String invoiceNumber = generateInvoiceNumber(companyId);
        order.setInvoiceNumber(invoiceNumber);

        // Step 4: Update order status
        order.setStatus(Order.OrderStatus.FINALIZED);
        order.setFinalizedAt(LocalDateTime.now());

        // Save and return
        return orderRepository.save(order);
    }

    /**
     * Generate next invoice number for company
     * Format: INV-00001, INV-00002, etc.
     */
    private String generateInvoiceNumber(Long companyId) {
        String maxInvoice = orderRepository.findMaxInvoiceNumber(companyId);
        int nextNumber = 1;

        if (maxInvoice != null && maxInvoice.startsWith("INV-")) {
            try {
                String numberPart = maxInvoice.substring(4);
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                // If parsing fails, start from 1
                nextNumber = 1;
            }
        }

        return String.format("INV-%05d", nextNumber);
    }

    /**
     * Validate products exist and belong to company
     * Returns map of productId -> Product for easy lookup
     */
    private Map<Long, Product> validateAndGetProducts(Long companyId, List<OrderItemDTO> items) {
        Map<Long, Product> productMap = new HashMap<>();

        for (OrderItemDTO itemDto : items) {
            Product product = productRepository.findByIdAndCategoryCompanyId(
                    itemDto.getProductId(), companyId)
                    .orElseThrow(() -> new RuntimeException(
                            "Product not found or access denied: " + itemDto.getProductId()));

            productMap.put(product.getId(), product);
        }

        return productMap;
    }
}
