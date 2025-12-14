# Environment Setup Guide

This guide explains how to configure environment variables for the Spring Boot application.

## Overview

The application uses environment variables to manage sensitive configuration data such as database credentials and JWT secrets. This approach keeps secrets out of version control and allows for different configurations across environments.

## Quick Start

1. **Copy the template file:**
   ```bash
   cd spring-app
   cp .env.template .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```bash
   # Use your preferred text editor
   nano .env
   # or
   vim .env
   ```

3. **Configure the required variables** (see sections below)

4. **Start the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

## Required Environment Variables

### Database Configuration

**DB_URL**
- PostgreSQL connection string
- Format: `jdbc:postgresql://localhost:5432/database_name`
- Example: `jdbc:postgresql://localhost:5432/springpcbe`

**DB_USERNAME**
- PostgreSQL username
- Example: `postgres`

**DB_PASSWORD**
- PostgreSQL password
- Example: `your_secure_password`

### JWT Configuration

**JWT_SECRET**
- Secret key for signing JWT tokens
- **IMPORTANT:** Must be at least 256 bits (32 characters) for HS256 algorithm
- Recommended: Use a cryptographically secure random string
- Example: `your-secret-key-here-must-be-at-least-256-bits-long-for-hs256`

**How to generate a secure JWT secret:**

```bash
# Using OpenSSL (Linux/Mac)
openssl rand -base64 32

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**JWT_EXPIRATION**
- Token expiration time in milliseconds
- Default: `86400000` (24 hours)
- 1 hour = 3600000 ms
- 7 days = 604800000 ms

### Server Configuration

**SERVER_PORT**
- Port the application listens on
- Default: `8080`
- Optional: Will use default if not specified

## Environment-Specific Configuration

### Development Environment

Create a `.env` file in the `spring-app` directory:

```properties
DB_URL=jdbc:postgresql://localhost:5432/springpcbe
DB_USERNAME=postgres
DB_PASSWORD=your_dev_password
JWT_SECRET=dev-secret-key-minimum-32-characters-long
JWT_EXPIRATION=86400000
SERVER_PORT=8080
```

### Production Environment

For production, use strong, unique values:

```properties
DB_URL=jdbc:postgresql://prod-db-host:5432/prod_database
DB_USERNAME=prod_user
DB_PASSWORD=<strong-random-password>
JWT_SECRET=<cryptographically-secure-random-string-32-chars-min>
JWT_EXPIRATION=3600000
SERVER_PORT=8080
```

**Production Security Checklist:**
- Use a strong, randomly generated JWT secret (minimum 32 characters)
- Use strong database passwords (minimum 16 characters, mixed case, numbers, symbols)
- Set shorter JWT expiration times (1-4 hours recommended)
- Use database connection pooling in production
- Enable SSL/TLS for database connections
- Store environment variables in a secure secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)

### Docker Environment

When using Docker, you can pass environment variables:

```bash
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://db:5432/springpcbe \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your-secret-key \
  -e JWT_EXPIRATION=86400000 \
  -e SERVER_PORT=8080 \
  your-app-image
```

Or use a `.env` file with Docker Compose:

```yaml
# docker-compose.yml
services:
  app:
    image: your-app-image
    env_file:
      - .env
    ports:
      - "8080:8080"
```

## Troubleshooting

### Application fails to start with "Could not resolve placeholder"

**Problem:** Missing required environment variable

**Solution:**
1. Check that `.env` file exists in the `spring-app` directory
2. Verify all required variables are defined in `.env`
3. Ensure there are no typos in variable names
4. Restart the application

### Database connection fails

**Problem:** Incorrect database credentials or connection string

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check DB_URL format: `jdbc:postgresql://host:port/database`
3. Test credentials: `psql -U username -d database`
4. Verify database exists: `psql -l`

### JWT token validation fails

**Problem:** JWT_SECRET too short or incorrect

**Solution:**
1. Ensure JWT_SECRET is at least 32 characters
2. Generate a new secret using one of the methods above
3. Update `.env` file
4. Restart the application
5. Log in again to get a new token

### Environment variables not loading

**Problem:** Spring Boot not reading `.env` file

**Solution:**
1. Verify `.env` file is in the `spring-app` directory (same level as `pom.xml`)
2. Check file name is exactly `.env` (not `.env.txt` or similar)
3. Ensure no BOM (Byte Order Mark) in `.env` file
4. Try using system environment variables as fallback
5. Check Spring Boot version supports `.env` files (2.7+ recommended)

### Port already in use

**Problem:** Port 8080 already occupied

**Solution:**
1. Change SERVER_PORT in `.env` to another port (e.g., `8081`)
2. Or stop the process using port 8080:
   ```bash
   # Find process using port 8080
   lsof -i :8080
   # Kill the process
   kill -9 <PID>
   ```

## Security Best Practices

1. **Never commit `.env` files to version control**
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.template` with placeholder values

2. **Use strong secrets**
   - JWT secrets: minimum 32 characters, cryptographically random
   - Database passwords: minimum 16 characters, mixed case, numbers, symbols

3. **Rotate secrets regularly**
   - Change JWT secrets every 3-6 months
   - Change database passwords every 6-12 months
   - Immediately rotate if compromise suspected

4. **Limit secret access**
   - Only share secrets with authorized team members
   - Use secret management tools in production
   - Never share secrets via email or chat

5. **Use different secrets per environment**
   - Development, staging, and production should have unique secrets
   - Never use production secrets in development

6. **Monitor for exposure**
   - Check that `.env` is not committed: `git status`
   - Scan for secrets in commit history
   - Use GitHub secret scanning alerts

## Verifying Configuration

After setting up environment variables, verify the configuration:

1. **Check environment variables are loaded:**
   ```bash
   # Start the application
   ./mvnw spring-boot:run

   # Look for successful startup logs
   # Should show: "Started SpringAppApplication"
   ```

2. **Test database connection:**
   ```bash
   # Application logs should show successful database connection
   # Look for: "HikariPool-1 - Start completed"
   ```

3. **Test authentication:**
   ```bash
   # Login with valid credentials
   curl -X POST http://localhost:8080/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'

   # Should return JWT token
   ```

4. **Test protected endpoints:**
   ```bash
   # Use the JWT token from login
   curl -X GET http://localhost:8080/users/profile \
     -H "Authorization: Bearer <your-jwt-token>"

   # Should return user profile data
   ```

## Additional Resources

- [Spring Boot External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Support

If you encounter issues not covered in this guide:

1. Check application logs: `tail -f logs/spring-app.log`
2. Verify Spring Boot version: `./mvnw -v`
3. Review Security.md implementation plan
4. Contact the development team
