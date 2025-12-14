package net.javaguides.spring_app.repository;

import net.javaguides.spring_app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA will provide implementations for common methods:
    // save(), findAll(), findById(), deleteById(), etc.

    // You can also add custom query methods
    User findByCompanyEmail(String companyEmail);
}
