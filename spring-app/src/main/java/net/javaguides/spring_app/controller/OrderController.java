package net.javaguides.spring_app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import net.javaguides.spring_app.dto.CreateOrderDTO;
import net.javaguides.spring_app.entity.Order;
import net.javaguides.spring_app.service.InvoiceService;
import net.javaguides.spring_app.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Get all orders for the authenticated company
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");

        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            try {
                Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                orders = orderService.getOrdersByStatus(companyId, orderStatus);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            orders = orderService.getOrders(companyId);
        }

        return ResponseEntity.ok(orders);
    }

    /**
     * Get a specific order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            Order order = orderService.getOrderById(companyId, id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new order with PENDING status
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateOrderDTO createOrderDTO,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            Order order = orderService.createOrder(companyId, createOrderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing PENDING order
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrderDTO createOrderDTO,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            Order order = orderService.updateOrder(companyId, id, createOrderDTO);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a PENDING order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            orderService.deleteOrder(companyId, id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Finalize an order - check stock, deduct inventory, generate invoice number
     */
    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeOrder(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            Order order = orderService.finalizeOrder(companyId, id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Download invoice PDF for a finalized order
     */
    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> downloadInvoice(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            Long companyId = (Long) request.getAttribute("userId");
            Order order = orderService.getOrderById(companyId, id);

            if (order.getStatus() != Order.OrderStatus.FINALIZED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Cannot download invoice for non-finalized order"));
            }

            // Generate PDF
            byte[] pdfBytes = invoiceService.generateInvoicePdf(order);

            // Set headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "invoice-" + order.getInvoiceNumber() + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get order statistics for the company
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOrderStats(HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");

        List<Order> allOrders = orderService.getOrders(companyId);
        List<Order> pendingOrders = orderService.getOrdersByStatus(companyId, Order.OrderStatus.PENDING);
        List<Order> finalizedOrders = orderService.getOrdersByStatus(companyId, Order.OrderStatus.FINALIZED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allOrders.size());
        stats.put("pending", pendingOrders.size());
        stats.put("finalized", finalizedOrders.size());

        // Calculate total revenue from finalized orders
        double totalRevenue = finalizedOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }
}
