package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find all categories for a specific company
     * @param companyId the company ID
     * @return list of categories belonging to the company
     */
    List<Category> findByCompanyId(Long companyId);

    /**
     * Find a category by ID and verify it belongs to the specified company
     * @param id the category ID
     * @param companyId the company ID
     * @return optional category if found and belongs to company
     */
    Optional<Category> findByIdAndCompanyId(Long id, Long companyId);
}
