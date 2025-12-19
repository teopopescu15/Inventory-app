package net.javaguides.spring_app.controller;

import jakarta.servlet.http.HttpServletRequest;
import net.javaguides.spring_app.entity.ProductCountHistory;
import net.javaguides.spring_app.repository.ProductRepository;
import net.javaguides.spring_app.service.ProductCountHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductCountHistoryController {

    @Autowired
    private ProductCountHistoryService productCountHistoryService;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get history for a specific product (with ownership verification)
     * @param productId the product ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return list of history entries for the product
     */
    @GetMapping("/{productId}/history")
    public ResponseEntity<List<ProductCountHistory>> getProductHistory(
            @PathVariable Long productId,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");

        // Verify product belongs to company
        return productRepository.findByIdAndCategoryCompanyId(productId, companyId)
                .map(product -> {
                    List<ProductCountHistory> history =
                        productCountHistoryService.getProductHistory(productId);
                    return ResponseEntity.ok(history);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all history for a company for the last 6 months
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return list of history entries for the company
     */
    @GetMapping("/history")
    public ResponseEntity<List<ProductCountHistory>> getCompanyHistory(
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        List<ProductCountHistory> history =
            productCountHistoryService.getCompanyHistoryLastMonths(companyId, 6);
        return ResponseEntity.ok(history);
    }
}
