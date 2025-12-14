package net.javaguides.spring_app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import net.javaguides.spring_app.entity.Category;
import net.javaguides.spring_app.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get all categories for a specific company
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return list of categories
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        List<Category> categories = categoryRepository.findByCompanyId(companyId);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get a specific category by ID (verify ownership)
     * @param id the category ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the category if found and owned by company
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return categoryRepository.findByIdAndCompanyId(id, companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new category
     * @param category the category to create
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the created category
     */
    @PostMapping
    public ResponseEntity<Category> createCategory(
            @Valid @RequestBody Category category,
            HttpServletRequest request) {
        // Set the company ID from JWT token to ensure it matches the authenticated user
        Long companyId = (Long) request.getAttribute("userId");
        category.setCompanyId(companyId);
        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    /**
     * Update an existing category (verify ownership)
     * @param id the category ID
     * @param categoryDetails the updated category details
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return the updated category
     */
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody Category categoryDetails,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return categoryRepository.findByIdAndCompanyId(id, companyId)
                .map(category -> {
                    category.setTitle(categoryDetails.getTitle());
                    category.setImage(categoryDetails.getImage());
                    Category updatedCategory = categoryRepository.save(category);
                    return ResponseEntity.ok(updatedCategory);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a category (cascade delete all products)
     * @param id the category ID
     * @param request the HTTP request containing JWT token with userId (companyId)
     * @return no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long companyId = (Long) request.getAttribute("userId");
        return categoryRepository.findByIdAndCompanyId(id, companyId)
                .map(category -> {
                    categoryRepository.delete(category);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
