# CRITICAL SECURITY FIXES REQUIRED

**Date:** December 14, 2025
**Priority:** P0 - BLOCKING PRODUCTION DEPLOYMENT
**Status:** ⚠️ APPLICATION NON-FUNCTIONAL

---

## Overview

Phase 7 security testing has identified **2 critical issues** that MUST be resolved before the application can function properly or be deployed to production.

---

## Critical Issue #1: SecurityConfig Blocks Registration and Login

### Problem
The SecurityConfig.java file contains a configuration that blocks ALL unauthenticated requests, including the registration and login endpoints that are supposed to be public.

### Impact
- ❌ Users cannot register new accounts
- ❌ Users cannot login to existing accounts
- ❌ Application is completely non-functional

### Root Cause
File: `/mnt/c/Users/Teo/Desktop/PCBE/spring-app/src/main/java/net/javaguides/spring_app/config/SecurityConfig.java`

Line 40 contains:
```java
.anonymous(anonymous -> anonymous.disable())
```

This line **prevents all anonymous (unauthenticated) access**, overriding the `.permitAll()` configuration for public endpoints.

### Fix Required

**Step 1: Edit SecurityConfig.java**

Remove or comment out line 40:

**BEFORE (Lines 34-42):**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/users/login", "/api/users", "/api/auth/login").permitAll()
    .anyRequest().authenticated()
)
.httpBasic(httpBasic -> httpBasic.disable())
.formLogin(formLogin -> formLogin.disable())
.anonymous(anonymous -> anonymous.disable())  // ❌ REMOVE THIS LINE
.addFilterBefore(jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class);
```

**AFTER (Lines 34-41):**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/users/login", "/api/users", "/api/auth/login").permitAll()
    .anyRequest().authenticated()
)
.httpBasic(httpBasic -> httpBasic.disable())
.formLogin(formLogin -> formLogin.disable())
// .anonymous(anonymous -> anonymous.disable())  // ✅ COMMENTED OUT
.addFilterBefore(jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class);
```

**Step 2: Rebuild the application**

```bash
cd /mnt/c/Users/Teo/Desktop/PCBE/spring-app

# Option 1: Maven (if installed)
mvn clean package -DskipTests

# Option 2: Gradle (if using Gradle)
./gradlew clean build

# Option 3: IDE (IntelliJ IDEA / Eclipse)
# Right-click project -> Maven -> Clean
# Right-click project -> Maven -> Package
```

**Step 3: Restart Spring Boot**

```bash
# Kill existing process
lsof -ti:8080 | xargs kill -9

# Start new process
java -jar target/spring-app-0.0.1-SNAPSHOT.jar
```

**Step 4: Verify the fix**

Test registration:
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "companyName": "Test Company",
    "companyEmail": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Expected: HTTP 201 Created (or 409 Conflict if email exists)
# NOT Expected: HTTP 403 Forbidden
```

Test login:
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Expected: HTTP 200 OK with JWT token
# NOT Expected: HTTP 403 Forbidden
```

---

## Critical Issue #2: Plain Text Passwords in Database

### Problem
3 out of 6 users in the database have **plain text passwords** instead of BCrypt hashes.

### Impact
- ❌ **Complete account compromise** if database is accessed
- ❌ Passwords visible to anyone with database access (DBAs, backup operators, hackers)
- ❌ **CVE-level security vulnerability**

### Affected Users
| User ID | Email | Password (Visible!) | Status |
|---------|-------|---------------------|--------|
| 1 | companya@test.com | Test123!@# | ❌ PLAIN TEXT |
| 2 | companyb@test.com | Test123!@# | ❌ PLAIN TEXT |
| 7 | security@test.com | test123 | ❌ PLAIN TEXT |

### Root Cause
These users were created before the BCrypt password hashing implementation was added to the User entity. The database was not migrated after the code changes.

### Fix Required

**Option 1: Delete Test Users (Recommended for Development)**

```sql
-- Connect to database
psql -h localhost -U postgres -d springpcbe

-- Delete users with plain text passwords
DELETE FROM users WHERE id IN (1, 2, 7);

-- Verify deletion
SELECT id, company_email,
       CASE
         WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'HASHED ✅'
         ELSE 'PLAIN TEXT ❌'
       END as password_status
FROM users;

-- Expected: Only users 3, 4, 5 remain (all with HASHED status)
```

**Option 2: Force Password Reset (For Production)**

```sql
-- Connect to database
psql -h localhost -U postgres -d springpcbe

-- Option A: Set passwords to NULL (requires password reset flow)
UPDATE users
SET password = NULL
WHERE password NOT LIKE '$2%';

-- Option B: Add password_reset_required flag (if implemented)
ALTER TABLE users ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE;

UPDATE users
SET password = NULL,
    password_reset_required = TRUE
WHERE password NOT LIKE '$2%';

-- Verify
SELECT id, company_email,
       password IS NULL as needs_reset
FROM users
WHERE password IS NULL;
```

**Option 3: Migrate Existing Passwords (NOT RECOMMENDED)**

This is technically possible but **NOT RECOMMENDED** because:
- Original plain text passwords cannot be re-hashed without user input
- Defeats the purpose of password hashing

**Step 4: Prevent Future Occurrences**

Add a database constraint to enforce BCrypt format:

```sql
-- Add constraint to prevent plain text passwords
ALTER TABLE users
ADD CONSTRAINT password_format_check
CHECK (password IS NULL OR password LIKE '$2_$%');

-- This will prevent any future plain text passwords from being saved
```

**Step 5: Verify All Passwords Are Hashed**

```bash
# Run verification query
PGPASSWORD="Teodora44" psql -h localhost -U postgres -d springpcbe -c "
SELECT id, company_email,
       CASE
         WHEN password LIKE '\$2a\$%' OR password LIKE '\$2b\$%' THEN 'HASHED ✅'
         ELSE 'PLAIN TEXT ❌'
       END as password_status
FROM users
ORDER BY id;"

# Expected: All rows show 'HASHED ✅'
```

---

## Additional Issue: Missing Maven Build Tool

### Problem
Maven is not installed on the system, preventing application rebuilds.

### Impact
- ❌ Cannot apply SecurityConfig fix
- ❌ Cannot rebuild application after code changes
- ❌ Cannot run tests

### Fix Required

**Step 1: Install Maven**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install maven

# macOS
brew install maven

# Windows (with Chocolatey)
choco install maven
```

**Step 2: Verify Installation**

```bash
mvn --version

# Expected output:
# Apache Maven 3.x.x
# Maven home: /usr/share/maven
# Java version: 17.x.x
```

**Step 3: Test Build**

```bash
cd /mnt/c/Users/Teo/Desktop/PCBE/spring-app
mvn clean package -DskipTests

# Expected: BUILD SUCCESS
```

---

## Verification Checklist

After applying all fixes, verify:

- [ ] **SecurityConfig Fixed**
  - [ ] Line 40 removed or commented out
  - [ ] Application rebuilt successfully
  - [ ] Registration endpoint returns 201 (not 403)
  - [ ] Login endpoint returns 200 with JWT token (not 403)

- [ ] **Plain Text Passwords Fixed**
  - [ ] Users 1, 2, 7 deleted or passwords reset
  - [ ] Database query shows 0 plain text passwords
  - [ ] All remaining users have BCrypt hashes ($2a$12$...)

- [ ] **Maven Installed**
  - [ ] `mvn --version` shows Maven 3.x
  - [ ] `mvn clean package` completes successfully

- [ ] **Application Functional**
  - [ ] Users can register new accounts
  - [ ] Users can login with correct credentials
  - [ ] JWT tokens are generated and returned
  - [ ] Authenticated requests work with token

---

## Timeline

**IMMEDIATE (Today):**
1. Fix SecurityConfig.java (5 minutes)
2. Install Maven (5 minutes)
3. Rebuild application (2 minutes)
4. Delete plain text password users (1 minute)
5. Test registration and login (5 minutes)

**Total Time:** ~20 minutes

---

## Success Criteria

✅ **Application is functional:**
- Users can register
- Users can login
- JWT tokens work

✅ **Zero security vulnerabilities:**
- No plain text passwords in database
- All passwords BCrypt hashed (cost factor 12)
- Public endpoints accessible without authentication

✅ **Build system working:**
- Maven installed and functional
- Application can be rebuilt

---

## Next Steps After Fixes

Once critical issues are resolved, proceed with:

1. **Complete JWT Token Tests** (Phase 7 remaining tests)
   - Test invalid tokens
   - Test expired tokens
   - Test token tampering

2. **Run Full End-to-End Tests**
   - Registration flow
   - Login flow
   - Category CRUD with data isolation
   - Product CRUD with data isolation

3. **Deploy to Production** (if all tests pass)

---

## Contact

For questions or issues applying these fixes:
- Refer to: `/mnt/c/Users/Teo/Desktop/PCBE/docs/security-test-report.md`
- Security Plan: `/mnt/c/Users/Teo/Desktop/PCBE/docs/plans/Security.md`

---

**CRITICAL: DO NOT DEPLOY TO PRODUCTION UNTIL ALL FIXES ARE APPLIED AND VERIFIED**

