# Security & CompanyId Isolation Implementation Plan

## Overview
Fix all security vulnerabilities and ensure proper company data isolation across the entire application. This plan addresses the critical bug in category creation, security vulnerabilities, and implements comprehensive testing with Playwright MCP.

---

## Phase 1: Critical Bug Fix ✅ COMPLETED

**Priority:** P0 - Blocking
**Estimated Time:** 15 minutes
**Testing:** Playwright MCP
**Status:** ✅ **COMPLETED** - All test cases passed

### 1.1 Fix Category Create Method Signature

**File:** `/frontend/src/services/api.ts` (line 113-116)

**Current (BROKEN):**
```typescript
create: async (category: Category): Promise<Category> => {
  const response = await api.post('/categories', category);
  return response.data;
}
```

**Fixed:**
```typescript
create: async (category: Category, companyId: number): Promise<Category> => {
  const response = await api.post('/categories', category, {
    params: { companyId },
  });
  return response.data;
}
```

**Why:** The Inventory.tsx component (line 118) calls `apiService.categories.create(category, companyId)` but the method doesn't accept the second parameter, causing category creation to fail.

### Test Results - Phase 1

**All 4 test cases PASSED:**

1. ✅ **Create new category** - succeeded with 201 status
   - Category "Phase 1 Test Category" created successfully
   - HTTP POST: `/api/categories?companyId=2` → 201 Created

2. ✅ **Verify category saved with correct companyId** - database verification passed
   ```sql
   SELECT id, title, company_id FROM categories WHERE id = 7;
   -- Result: id=7, title="Phase 1 Test Category", company_id=2
   ```

3. ✅ **Verify category only visible to owning company** - isolation confirmed
   - Company ID 2: Shows only their category (Phase 1 Test Category)
   - Company ID 1: Shows only their categories (kn, res)
   - No cross-company data leakage

4. ✅ **Method signature accepts companyId parameter** - code fix validated
   - Query parameter `?companyId=2` correctly passed to backend
   - Backend correctly extracts and uses companyId

**Screenshots:** 8 screenshots captured in `.playwright-mcp/` directory
**Test Date:** December 13, 2025

---

## Phase 2: Security - Products by Category Endpoint

**Priority:** P1 - High
**Estimated Time:** 30 minutes
**Testing:** Playwright MCP + Manual Security Testing
**Status:** 🔄 Pending

### 2.1 Add Company Ownership Verification

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/controller/ProductController.java` (line 40-44)

**Current (VULNERABLE):**
```java
@GetMapping("/category/{categoryId}")
public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
    List<Product> products = productRepository.findByCategoryId(categoryId);
    return ResponseEntity.ok(products);
}
```

**Fixed:**
```java
@GetMapping("/category/{categoryId}")
public ResponseEntity<List<Product>> getProductsByCategory(
        @PathVariable Long categoryId,
        @RequestParam Long companyId) {
    // Verify category belongs to company
    return categoryRepository.findByIdAndCompanyId(categoryId, companyId)
            .map(category -> {
                List<Product> products = productRepository.findByCategoryId(categoryId);
                return ResponseEntity.ok(products);
            })
            .orElse(ResponseEntity.notFound().build());
}
```

**Frontend Update:** `/frontend/src/services/api.ts` (line 145-148)
```typescript
getByCategory: async (categoryId: number, companyId: number): Promise<Product[]> => {
  const response = await api.get(`/products/category/${categoryId}`, {
    params: { companyId },
  });
  return response.data;
}
```

**Test Cases:**
1. ✅ Company A fetches products from their own category - should succeed
2. ❌ Company A attempts to fetch products from Company B's category - should return 404
3. ✅ Non-existent categoryId - should return 404
4. ✅ Valid category but wrong companyId - should return 404

---

## Phase 3: Security - Password Hashing

**Priority:** P1 - High
**Estimated Time:** 1 hour
**Testing:** Playwright MCP + Unit Tests
**Status:** 🔄 Pending

### 3.1 Add BCrypt Dependency

**File:** `/spring-app/pom.xml`

Add dependency:
```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

### 3.2 Update User Entity

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/entity/User.java`

Add password hashing:
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// In User class
private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

public void setPassword(String plainPassword) {
    this.password = passwordEncoder.encode(plainPassword);
}

public boolean verifyPassword(String plainPassword) {
    return passwordEncoder.matches(plainPassword, this.password);
}
```

### 3.3 Update UserController

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/controller/UserController.java`

**Registration (line 29-36):**
```java
@PostMapping
public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
    if (userRepository.findByCompanyEmail(user.getCompanyEmail()).isPresent()) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Email already exists");
    }
    user.setPassword(user.getPassword()); // Triggers BCrypt hashing
    User savedUser = userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
}
```

**Login (line 47):**
```java
// Replace plain text comparison
if (user.getPassword().equals(password)) {

// With BCrypt verification
if (user.verifyPassword(password)) {
```

**Test Cases:**
1. ✅ Register new user - password should be hashed in database
2. ✅ Login with correct password - should succeed
3. ❌ Login with incorrect password - should fail with 401
4. ✅ Verify password is NOT plain text in database
5. ✅ Verify password hashing uses BCrypt with cost factor 12

---

## Phase 4: Security - JWT Authentication

**Priority:** P1 - High
**Estimated Time:** 2 hours
**Testing:** Playwright MCP + Postman
**Status:** 🔄 Pending

### 4.1 Add JWT Dependencies

**File:** `/spring-app/pom.xml`

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 4.2 Create JWT Utility Class

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/security/JwtUtil.java` (NEW)

```java
package net.javaguides.spring_app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration; // milliseconds

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Long userId, String companyEmail) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(companyEmail)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userId", Long.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 4.3 Create JWT Authentication Filter

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/security/JwtAuthenticationFilter.java` (NEW)

```java
package net.javaguides.spring_app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.getUserIdFromToken(token);
                request.setAttribute("userId", userId);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### 4.4 Create Security Configuration

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/config/SecurityConfig.java` (NEW)

```java
package net.javaguides.spring_app.config;

import net.javaguides.spring_app.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/login", "/api/users/register").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 4.5 Update UserController Login Response

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/controller/UserController.java`

```java
@Autowired
private JwtUtil jwtUtil;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
    String companyEmail = loginRequest.get("companyEmail");
    String password = loginRequest.get("password");

    Optional<User> userOptional = userRepository.findByCompanyEmail(companyEmail);

    if (userOptional.isPresent()) {
        User user = userOptional.get();
        if (user.verifyPassword(password)) {
            String token = jwtUtil.generateToken(user.getId(), user.getCompanyEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("companyName", user.getCompanyName());
            response.put("companyEmail", user.getCompanyEmail());

            return ResponseEntity.ok(response);
        }
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
}
```

### 4.6 Update All Controllers to Use JWT

Extract companyId from authenticated user instead of query parameter.

**Example - CategoryController:**
```java
@GetMapping
public ResponseEntity<List<Category>> getAllCategories(HttpServletRequest request) {
    Long companyId = (Long) request.getAttribute("userId");
    List<Category> categories = categoryRepository.findByCompanyId(companyId);
    return ResponseEntity.ok(categories);
}
```

### 4.7 Frontend Updates

**File:** `/frontend/src/services/api.ts`

Add JWT token to all requests:
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Remove companyId from query params (now comes from JWT)
// Example:
getAll: async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
}
```

**Test Cases:**
1. ✅ Login returns JWT token
2. ✅ Token stored in localStorage
3. ✅ Subsequent requests include Authorization header
4. ❌ Request without token - should return 401
5. ❌ Request with invalid token - should return 401
6. ❌ Request with expired token - should return 401
7. ✅ CompanyId extracted from token server-side
8. ❌ Manipulated token - should return 401
9. ✅ Token refresh mechanism (optional)

---

## Phase 5: Security - Environment Variables

**Priority:** P2 - Medium
**Estimated Time:** 30 minutes
**Testing:** Manual verification
**Status:** 🔄 Pending

### 5.1 Create .env Template

**File:** `/spring-app/.env.template` (NEW)

```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-characters
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080
```

### 5.2 Update application.properties

**File:** `/spring-app/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

# Server
server.port=${SERVER_PORT:8080}
```

### 5.3 Update .gitignore

**File:** `/spring-app/.gitignore`

Add:
```
.env
application-local.properties
*.key
*.pem
```

### 5.4 Create Setup Documentation

**File:** `/docs/environment-setup.md` (NEW)

Instructions for developers to set up environment variables.

**Test Cases:**
1. ✅ Application starts with environment variables
2. ❌ Application fails to start without required env vars
3. ✅ No sensitive data in version control
4. ✅ .env file in .gitignore

---

## Phase 6: UI/UX Improvements

**Priority:** P3 - Low
**Estimated Time:** 1 hour
**Testing:** Playwright MCP
**Status:** 🔄 Pending

### 6.1 Remove Hardcoded CompanyId Fallback

**File:** `/frontend/src/components/inventory/CategoryForm.tsx` (line 95)

```typescript
// Remove this fallback
companyId: category?.companyId || 1,

// Use authenticated user's companyId or handle error
companyId: category?.companyId || getUserCompanyId(),
```

### 6.2 Better Error Messages

**File:** `/spring-app/src/main/java/net/javaguides/spring_app/controller/UserController.java`

Enhance error responses:
```java
@PostMapping
public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
    if (userRepository.findByCompanyEmail(user.getCompanyEmail()).isPresent()) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Email already registered");
        error.put("message", "This email is already associated with an account. Please login or use a different email.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    // ...
}
```

**Test Cases:**
1. ✅ Duplicate email - shows user-friendly message
2. ✅ Validation errors - show specific field errors
3. ✅ Network errors - show retry option

---

## Phase 7: Testing & Validation

**Priority:** P0 - Blocking
**Estimated Time:** 2 hours
**Testing:** Playwright MCP (Automated E2E)
**Status:** 🔄 Pending

### 7.1 Playwright Test Suite

**File:** `/tests/security-tests.spec.ts` (NEW)

Comprehensive automated test suite for all security features and company isolation. See plan for full test code.

### 7.2 Manual Security Testing Checklist

- [ ] SQL Injection: Try `' OR '1'='1` in email field
- [ ] XSS: Try `<script>alert('xss')</script>` in category title
- [ ] CSRF: Attempt cross-origin requests without CORS
- [ ] JWT Tampering: Modify token payload and verify rejection
- [ ] Brute Force: Attempt multiple login failures
- [ ] Company Isolation: Verify Company A cannot access Company B's data
- [ ] Password Strength: Test weak passwords

### 7.3 Database Verification Queries

```sql
-- Verify passwords are hashed
SELECT id, company_email,
       CASE
         WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'HASHED ✅'
         ELSE 'PLAIN TEXT ❌'
       END as password_status
FROM users;

-- Verify company isolation
SELECT c.id, c.title, c.company_id, u.company_name
FROM categories c
JOIN users u ON c.company_id = u.id
ORDER BY c.company_id;

-- Verify products linked to correct categories
SELECT p.id, p.title, c.title as category, c.company_id, u.company_name
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN users u ON c.company_id = u.id
ORDER BY u.company_name;
```

---

## Critical Files to Modify

### Frontend
- `/frontend/src/services/api.ts` - Fix category create method ✅, enhance security
- `/frontend/src/components/inventory/CategoryForm.tsx` - Remove hardcoded companyId
- `/frontend/src/pages/Inventory.tsx` - Ensure proper companyId usage

### Backend
- `/spring-app/src/main/java/net/javaguides/spring_app/controller/ProductController.java` - Add ownership verification
- `/spring-app/src/main/java/net/javaguides/spring_app/entity/User.java` - Add password hashing
- `/spring-app/src/main/java/net/javaguides/spring_app/controller/UserController.java` - Implement BCrypt, JWT
- `/spring-app/src/main/resources/application.properties` - Move to environment variables
- `/spring-app/src/main/java/net/javaguides/spring_app/config/SecurityConfig.java` - NEW: JWT configuration

### Documentation
- `/docs/plans/Security.md` - This file
- `/docs/security-fixes-report.md` - Test results after implementation
- `/docs/environment-setup.md` - Environment setup guide

---

## Implementation Order

### Must Do First (Blocking) ✅
1. ✅ **Phase 1** - Fix category create method (15 min) - **COMPLETED**
2. ✅ **Phase 7.1** - Test Phase 1 with Playwright (30 min) - **COMPLETED**

### High Priority (Security) 🔄
3. 🔄 **Phase 3** - Password hashing (1 hour)
4. 🔄 **Phase 4** - JWT authentication (2 hours)
5. 🔄 **Phase 2** - Products by category ownership (30 min)
6. 🔄 **Phase 7.2** - Test security features (1 hour)

### Medium Priority (Best Practices) 🔄
7. 🔄 **Phase 5** - Environment variables (30 min)
8. 🔄 **Phase 6** - UI/UX improvements (1 hour)

### Final Validation 🔄
9. 🔄 **Phase 7.3** - Full test suite + manual verification (1 hour)

---

## Success Criteria

### Phase 1 (Critical Bug) ✅
- [x] Category creation works with companyId
- [x] Categories saved with correct companyId in database
- [x] Categories only visible to owning company

### Phase 2 (Security - Products) 🔄
- [ ] Products by category endpoint verifies ownership
- [ ] Company A cannot access Company B's products
- [ ] Returns 404 for unauthorized category access

### Phase 3 (Security - Passwords) 🔄
- [ ] Passwords hashed with BCrypt in database
- [ ] Login validates against hashed passwords
- [ ] No plain text passwords in database

### Phase 4 (Security - JWT) 🔄
- [ ] Login returns valid JWT token
- [ ] All requests authenticated with JWT
- [ ] CompanyId extracted from token server-side
- [ ] Invalid/expired tokens rejected
- [ ] No companyId manipulation from client

### Phase 5 (Environment) 🔄
- [ ] Database credentials in environment variables
- [ ] JWT secret in environment variables
- [ ] No secrets in version control
- [ ] .env in .gitignore

### Phase 6 (UX) 🔄
- [ ] User-friendly error messages
- [ ] No hardcoded companyId fallbacks
- [ ] Proper validation feedback

### Phase 7 (Testing) 🔄
- [ ] All Playwright tests passing
- [ ] Manual security checklist complete
- [ ] Database verification queries run
- [ ] Zero security vulnerabilities

---

## Estimated Total Time
- **Critical Bug Fix**: 45 minutes (Phase 1 + testing) ✅ DONE
- **Security Features**: 4.5 hours (Phases 2-4 + testing) 🔄 IN PROGRESS
- **Best Practices**: 1.5 hours (Phases 5-6)
- **Testing & Validation**: 2 hours (Phase 7)

**Total: ~8.5 hours** (can be done in 1-2 working days)
**Progress: 1/9 phases complete (11%)**

---

## Rollback Plan

If issues occur during implementation:

1. **Database Backup**: Before Phase 3, backup users table
   ```sql
   pg_dump -U postgres -t users your_database > users_backup.sql
   ```

2. **Code Backup**: Create feature branch
   ```bash
   git checkout -b security-fixes
   git commit -am "Before security fixes"
   ```

3. **Gradual Rollout**: Implement phases incrementally, test after each

4. **Feature Flags**: Add flag for JWT (optional)

---

**Plan Status:** In Progress (Phase 1 Complete)
**Testing Framework:** Playwright MCP
**Rollback Strategy:** Available
**Last Updated:** December 13, 2025
