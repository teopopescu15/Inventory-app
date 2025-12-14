package net.javaguides.spring_app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import net.javaguides.spring_app.entity.Product;
import net.javaguides.spring_app.repository.CategoryRepository;
import net.javaguides.spring_app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get all products for a specific company
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return list of products
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        List<Product> products = productRepository.findByCategoryCompanyId(companyId);
        return ResponseEntity.ok(products);
    }

    /**
     * Get all products for a specific category (with ownership verification)
     * @param categoryId the category ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return list of products in the category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable Long categoryId,
            HttpServletRequest request) {
        // Verify category belongs to company before returning products
        Long companyId = (Long) request.getAttribute("userId");
        return categoryRepository.findByIdAndCompanyId(categoryId, companyId)
                .map(category -> {
                    List<Product> products = productRepository.findByCategoryId(categoryId);
                    return ResponseEntity.ok(products);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a specific product by ID (verify ownership)
     * @param id the product ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the product if found and owned by company
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return productRepository.findByIdAndCategoryCompanyId(id, companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new product (validate category exists and belongs to company)
     * @param product the product to create
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the created product
     */
    @PostMapping
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody Product product,
            HttpServletRequest request) {
        // Validate category exists and belongs to company
        Long companyId = (Long) request.getAttribute("userId");
        return categoryRepository.findByIdAndCompanyId(product.getCategoryId(), companyId)
                .<ResponseEntity<?>>map(category -> {
                    Product savedProduct = productRepository.save(product);
                    return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Category not found or does not belong to company"));
    }

    /**
     * Update an existing product (verify ownership)
     * @param id the product ID
     * @param productDetails the updated product details
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the updated product
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product productDetails,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return productRepository.findByIdAndCategoryCompanyId(id, companyId)
                .<ResponseEntity<?>>map(product -> {
                    // Validate new category if changed
                    if (!product.getCategoryId().equals(productDetails.getCategoryId())) {
                        return categoryRepository.findByIdAndCompanyId(productDetails.getCategoryId(), companyId)
                                .<ResponseEntity<?>>map(category -> {
                                    product.setCategoryId(productDetails.getCategoryId());
                                    product.setTitle(productDetails.getTitle());
                                    product.setImage(productDetails.getImage());
                                    product.setPrice(productDetails.getPrice());
                                    product.setCount(productDetails.getCount());
                                    Product updatedProduct = productRepository.save(product);
                                    return ResponseEntity.ok(updatedProduct);
                                })
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body("Category not found or does not belong to company"));
                    } else {
                        product.setTitle(productDetails.getTitle());
                        product.setImage(productDetails.getImage());
                        product.setPrice(productDetails.getPrice());
                        product.setCount(productDetails.getCount());
                        Product updatedProduct = productRepository.save(product);
                        return ResponseEntity.ok(updatedProduct);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a product (verify ownership)
     * @param id the product ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return productRepository.findByIdAndCategoryCompanyId(id, companyId)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
