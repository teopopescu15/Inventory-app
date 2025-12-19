package net.javaguides.spring_app.controller;

import jakarta.servlet.http.HttpServletRequest;
import net.javaguides.spring_app.dto.InventoryAnalysisResponse;
import net.javaguides.spring_app.entity.Product;
import net.javaguides.spring_app.entity.ProductCountHistory;
import net.javaguides.spring_app.repository.ProductRepository;
import net.javaguides.spring_app.service.GeminiAnalysisService;
import net.javaguides.spring_app.service.ProductCountHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCountHistoryService productCountHistoryService;

    @Autowired
    private GeminiAnalysisService geminiAnalysisService;

    /**
     * Get full AI-powered inventory analysis
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return AI-generated analysis with insights and recommendations
     */
    @GetMapping
    public ResponseEntity<InventoryAnalysisResponse> getAnalysis(HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");

        // Get all products for the company
        List<Product> products = productRepository.findByCategoryCompanyId(companyId);

        // Get history for last 6 months
        List<ProductCountHistory> history =
                productCountHistoryService.getCompanyHistoryLastMonths(companyId, 6);

        // Call Gemini AI for analysis
        InventoryAnalysisResponse analysis =
                geminiAnalysisService.analyzeInventory(products, history);

        return ResponseEntity.ok(analysis);
    }

    /**
     * Get quick stats without AI analysis (faster, no external API call)
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return basic inventory statistics
     */
    @GetMapping("/quick-stats")
    public ResponseEntity<Map<String, Object>> getQuickStats(HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");

        // Get all products for the company
        List<Product> products = productRepository.findByCategoryCompanyId(companyId);

        // Calculate quick stats
        int totalProducts = products.size();
        int lowStock = (int) products.stream()
                .filter(p -> p.getCount() > 0 && p.getCount() <= 10)
                .count();
        int outOfStock = (int) products.stream()
                .filter(p -> p.getCount() == 0)
                .count();

        // Get total sold in last month
        List<ProductCountHistory> lastMonthHistory =
                productCountHistoryService.getCompanyHistoryLastMonths(companyId, 1);
        int totalSoldLastMonth = lastMonthHistory.stream()
                .filter(h -> h.getChangeType() == ProductCountHistory.ChangeType.SALE)
                .mapToInt(h -> Math.abs(h.getChangeAmount()))
                .sum();

        // Build response
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("lowStock", lowStock);
        stats.put("outOfStock", outOfStock);
        stats.put("totalSoldLastMonth", totalSoldLastMonth);

        return ResponseEntity.ok(stats);
    }
}
