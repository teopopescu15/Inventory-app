package net.javaguides.spring_app.controller;

import net.javaguides.spring_app.entity.User;
import net.javaguides.spring_app.repository.UserRepository;
import net.javaguides.spring_app.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Validate input
        if (email == null || email.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", "Email is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (password == null || password.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", "Password is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Find user by email
        User user = userRepository.findByCompanyEmail(email);

        if (user != null) {
            // BCrypt password verification
            if (user.verifyPassword(password)) {
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getId(), user.getCompanyEmail());

                // Return user data with JWT token
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("id", user.getId());
                response.put("companyName", user.getCompanyName());
                response.put("companyEmail", user.getCompanyEmail());
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication failed");
                error.put("message", "Invalid email or password. Please try again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed");
            error.put("message", "Invalid email or password. Please try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // Create new user
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // Check if email already exists
        User existingUser = userRepository.findByCompanyEmail(user.getCompanyEmail());
        if (existingUser != null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already registered");
            error.put("message", "This email is already associated with an account. Please login or use a different email.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        // Validate required fields
        if (user.getCompanyName() == null || user.getCompanyName().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", "Company name is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (user.getCompanyEmail() == null || user.getCompanyEmail().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", "Email is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", "Password is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Password is automatically hashed by User entity's setPassword method
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setCompanyName(userDetails.getCompanyName());
            user.setCompanyEmail(userDetails.getCompanyEmail());
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
