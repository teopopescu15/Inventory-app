package net.javaguides.spring_app.entity;

import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_email", nullable = false, unique = true)
    private String companyEmail;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    // Default constructor (required by JPA)
    public User() {
    }

    // Constructor with parameters
    public User(String companyName, String companyEmail, String password) {
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String plainPassword) {
        this.password = passwordEncoder.encode(plainPassword);
    }

    public boolean verifyPassword(String plainPassword) {
        return passwordEncoder.matches(plainPassword, this.password);
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }
}
