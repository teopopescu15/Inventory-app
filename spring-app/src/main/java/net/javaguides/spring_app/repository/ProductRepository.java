package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Find all products for a specific category
     * @param categoryId the category ID
     * @return list of products in the category
     */
    List<Product> findByCategoryId(Long categoryId);

    /**
     * Find all products for a specific company (through category relationship)
     * @param companyId the company ID
     * @return list of products belonging to the company
     */
    List<Product> findByCategoryCompanyId(Long companyId);

    /**
     * Find a product by ID and verify it belongs to the specified company
     * @param id the product ID
     * @param companyId the company ID
     * @return optional product if found and belongs to company
     */
    Optional<Product> findByIdAndCategoryCompanyId(Long id, Long companyId);

    /**
     * Delete all products in a specific category (used for cascade delete)
     * @param categoryId the category ID
     */
    @Transactional
    void deleteByCategoryId(Long categoryId);
}
