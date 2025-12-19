# API Reference, Authentication & Deployment

## Part 1: REST API Reference

### Base URL
```
http://localhost:4201/api
```

### Authentication
All endpoints except login and registration require JWT token:
```
Authorization: Bearer <token>
```

---

## User Endpoints

### POST /api/users/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "company@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "companyName": "Acme Corp",
  "companyEmail": "company@example.com"
}
```

### POST /api/users
Register new user/company.

**Request:**
```json
{
  "companyName": "Acme Corp",
  "companyEmail": "company@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):** User object (without password)

### GET /api/users
List all users. **Auth Required**

### GET /api/users/{id}
Get user by ID. **Auth Required**

### PUT /api/users/{id}
Update user. **Auth Required**

### DELETE /api/users/{id}
Delete user. **Auth Required**

---

## Category Endpoints

### GET /api/categories
List all categories for authenticated company.

**Response:**
```json
[
  {
    "id": 1,
    "companyId": 1,
    "title": "Electronics",
    "image": "data:image/png;base64,..."
  }
]
```

### GET /api/categories/{id}
Get single category.

### POST /api/categories
Create new category.

**Request:**
```json
{
  "title": "Electronics",
  "image": "data:image/png;base64,..."
}
```

### PUT /api/categories/{id}
Update category.

### DELETE /api/categories/{id}
Delete category (cascades to products).

---

## Product Endpoints

### GET /api/products
List all products for company.

**Response:**
```json
[
  {
    "id": 1,
    "categoryId": 1,
    "title": "Laptop",
    "image": "data:image/png;base64,...",
    "price": 999.99,
    "count": 50
  }
]
```

### GET /api/products/category/{categoryId}
List products in specific category.

### GET /api/products/{id}
Get single product.

### POST /api/products
Create new product.

**Request:**
```json
{
  "categoryId": 1,
  "title": "Laptop",
  "image": "data:image/png;base64,...",
  "price": 999.99,
  "count": 50
}
```

### PUT /api/products/{id}
Update product. Records history if count changes.

### DELETE /api/products/{id}
Delete product.

### GET /api/products/{id}/history
Get stock change history for product.

### GET /api/products/history
Get 6-month stock history for company.

---

## Order Endpoints

### GET /api/orders
List orders. Optional `?status=PENDING|FINALIZED` filter.

**Response:**
```json
[
  {
    "id": 1,
    "companyId": 1,
    "clientName": "John Doe",
    "clientCompany": "Client Inc",
    "clientAddress": "123 Main St",
    "clientCity": "New York",
    "clientPostalCode": "10001",
    "clientPhone": "+1234567890",
    "clientEmail": "john@example.com",
    "notes": "Rush order",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00",
    "finalizedAt": null,
    "invoiceNumber": null,
    "totalItems": 3,
    "totalAmount": 2999.97,
    "items": [...]
  }
]
```

### GET /api/orders/{id}
Get single order with items.

### POST /api/orders
Create new order.

**Request:**
```json
{
  "clientName": "John Doe",
  "clientCompany": "Client Inc",
  "clientAddress": "123 Main St",
  "clientCity": "New York",
  "clientPostalCode": "10001",
  "clientPhone": "+1234567890",
  "clientEmail": "john@example.com",
  "notes": "Rush order",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

### PUT /api/orders/{id}
Update order (PENDING only).

### DELETE /api/orders/{id}
Delete order (PENDING only).

### POST /api/orders/{id}/finalize
Finalize order:
- Validates stock availability
- Deducts inventory
- Generates invoice number
- Sets FINALIZED status

**Response:** Updated order with invoiceNumber

### GET /api/orders/{id}/invoice
Download PDF invoice.

**Response:** `application/pdf` file

### GET /api/orders/stats
Get order statistics.

**Response:**
```json
{
  "total": 25,
  "pending": 5,
  "finalized": 20,
  "totalRevenue": 45000.00
}
```

---

## Analysis Endpoints

### GET /api/analysis
Get AI-powered inventory analysis (calls Gemini).

**Response:**
```json
{
  "summary": {
    "totalProducts": 150,
    "totalUnitsSold": 2500,
    "healthStatus": "Good",
    "description": "Inventory is healthy with stable turnover..."
  },
  "topSellingProducts": [
    {
      "productId": 5,
      "productTitle": "Wireless Mouse",
      "unitsSold": 450,
      "revenue": 13500.00
    }
  ],
  "recommendations": [
    {
      "productId": 12,
      "productTitle": "USB Cable",
      "currentStock": 5,
      "recommendedRestock": 50,
      "urgency": "High",
      "reason": "High sales velocity, stock will deplete in 3 days"
    }
  ],
  "insights": [
    {
      "category": "Sales",
      "title": "Strong Q4 Performance",
      "description": "Sales increased 25% compared to Q3",
      "actionable": false
    }
  ]
}
```

### GET /api/analysis/quick-stats
Get basic stats (no AI call).

**Response:**
```json
{
  "totalProducts": 150,
  "lowStock": 12,
  "outOfStock": 3,
  "totalSoldLastMonth": 890
}
```

---

## Part 2: Authentication

### JWT Token Structure

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "company@example.com",
  "userId": 1,
  "iat": 1705312800,
  "exp": 1705399200
}
```

### Security Configuration

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .cors(cors -> cors.configurationSource(corsConfig()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### Password Hashing
BCrypt with strength 12:
```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hashedPassword = encoder.encode(rawPassword);
```

### CORS Configuration
Allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:4200`
- `http://34.13.240.241:4200`
- `http://34.13.240.241:4201`

---

## Part 3: Deployment

### Docker Compose Setup

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  database:
    image: postgres:16
    container_name: inventory-db
    environment:
      POSTGRES_DB: inventory
      POSTGRES_USER: inventory
      POSTGRES_PASSWORD: inventory123
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U inventory"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./spring-app
    container_name: inventory-backend
    depends_on:
      database:
        condition: service_healthy
    environment:
      DB_URL: jdbc:postgresql://database:5432/inventory
      DB_USERNAME: inventory
      DB_PASSWORD: inventory123
      JWT_SECRET: your-256-bit-secret-key-here-minimum-32-characters
      JWT_EXPIRATION: 86400000
      SERVER_PORT: 4201
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "4201:4201"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4201/api/hello"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: inventory-frontend
    depends_on:
      - backend
    ports:
      - "4200:80"

volumes:
  postgres_data:
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_URL | PostgreSQL JDBC URL | jdbc:postgresql://database:5432/inventory |
| DB_USERNAME | Database user | inventory |
| DB_PASSWORD | Database password | inventory123 |
| JWT_SECRET | JWT signing key (32+ chars) | - |
| JWT_EXPIRATION | Token validity (ms) | 86400000 (24h) |
| SERVER_PORT | Backend port | 4201 |
| GEMINI_API_KEY | Google Gemini API key | - |

### Port Mapping

| Service | Internal | External | Description |
|---------|----------|----------|-------------|
| PostgreSQL | 5432 | 5433 | Database |
| Backend | 4201 | 4201 | Spring Boot API |
| Frontend | 80 | 4200 | React + Nginx |

### Quick Start Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Reset database (destructive)
docker-compose down -v
docker-compose up -d
```

### Production Considerations

1. **JWT Secret**: Use a strong, random 256-bit key
2. **Database Password**: Change default password
3. **HTTPS**: Add SSL/TLS termination (nginx or load balancer)
4. **Gemini API Key**: Set via environment variable, not in code
5. **CORS**: Restrict to production domains only
6. **Logging**: Configure production logging levels
