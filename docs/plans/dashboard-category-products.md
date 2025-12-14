# Inventory Management Dashboard - Implementation Plan

## Overview

Build a full-featured inventory management dashboard with category and product management, following the dark industrial design theme established in the Login/SignUp pages.

**Key Requirements:**
- Two-section dashboard layout (Categories top, Products bottom)
- Company-isolated data (each company sees only their inventory)
- Category and Product CRUD operations with Edit/Delete actions
- Base64 image storage in PostgreSQL
- Format validation (positive prices, non-negative counts, title length)
- Cascade delete with confirmation (deleting category removes all products)
- Block product creation until at least one category exists
- Informative empty states with helpful messaging
- Automated testing using Playwright MCP for web testing after each phase

---

## Phase 1: Backend Data Model & Entities

### Objective
Create JPA entities with proper relationships and company isolation.

### Files to Create

**1. Category Entity**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/entity/Category.java`
- Fields:
  - `id` (Long, auto-generated)
  - `companyId` (Long, FK to User)
  - `title` (String, @NotBlank, @Size(min=2, max=100))
  - `image` (String, Base64 encoded, @NotBlank)
- Relationships:
  - `@ManyToOne` to User entity
  - `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` to Product entities

**2. Product Entity**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/entity/Product.java`
- Fields:
  - `id` (Long, auto-generated)
  - `categoryId` (Long, FK to Category)
  - `title` (String, @NotBlank, @Size(min=2, max=100))
  - `image` (String, Base64 encoded, @NotBlank)
  - `price` (Double, @DecimalMin("0.01"))
  - `count` (Integer, @Min(0))
- Relationships:
  - `@ManyToOne` to Category entity

### Files to Modify

**1. User Entity**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/entity/User.java`
- Add: `@OneToMany(mappedBy = "companyId", cascade = CascadeType.ALL, orphanRemoval = true)` for categories

### Testing (Post-Phase 1)

**Manual Verification:**
1. Start Spring Boot application
2. Check PostgreSQL for new tables: `categories`, `products`
3. Verify foreign key constraints exist
4. Verify column types and constraints match entity definitions

**Use Playwright MCP for web testing:**
- Database schema validation (tables exist, columns correct)
- Verify Hibernate DDL auto-creation worked

---

## Phase 2: Backend Repositories & REST API

### Objective
Build repository interfaces and RESTful controllers with company-scoped queries.

### Files to Create

**1. CategoryRepository**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/repository/CategoryRepository.java`
- Extends: `JpaRepository<Category, Long>`
- Custom methods:
  - `List<Category> findByCompanyId(Long companyId)`
  - `Optional<Category> findByIdAndCompanyId(Long id, Long companyId)`

**2. ProductRepository**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/repository/ProductRepository.java`
- Extends: `JpaRepository<Product, Long>`
- Custom methods:
  - `List<Product> findByCategoryId(Long categoryId)`
  - `List<Product> findByCategoryCompanyId(Long companyId)`
  - `Optional<Product> findByIdAndCategoryCompanyId(Long id, Long companyId)`
  - `void deleteByCategoryId(Long categoryId)`

**3. CategoryController**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/controller/CategoryController.java`
- Base path: `/api/categories`
- Endpoints:
  - `GET /` - Get all categories for company (param: companyId)
  - `GET /{id}` - Get category by ID (verify ownership)
  - `POST /` - Create category
  - `PUT /{id}` - Update category (verify ownership)
  - `DELETE /{id}` - Delete category with cascade (verify ownership)

**4. ProductController**
- Path: `spring-app/src/main/java/net/javaguides/spring_app/controller/ProductController.java`
- Base path: `/api/products`
- Endpoints:
  - `GET /` - Get all products for company (param: companyId)
  - `GET /category/{categoryId}` - Get products by category
  - `GET /{id}` - Get product by ID (verify ownership)
  - `POST /` - Create product (validate category exists)
  - `PUT /{id}` - Update product (verify ownership)
  - `DELETE /{id}` - Delete product (verify ownership)

### Testing (Post-Phase 2)

**Use Playwright MCP for web testing - API testing:**

1. **Category CRUD:**
   - POST `/api/categories` with companyId=1
   - GET `/api/categories?companyId=1` - verify returned
   - PUT `/api/categories/{id}` - update title
   - GET `/api/categories/{id}` - verify update
   - DELETE `/api/categories/{id}` - verify deletion

2. **Product CRUD:**
   - POST `/api/products` with valid categoryId
   - GET `/api/products?companyId=1` - verify returned
   - PUT `/api/products/{id}` - update price/count
   - DELETE `/api/products/{id}` - verify deletion

3. **Company Isolation:**
   - Create categories with companyId=1 and companyId=2
   - GET `/api/categories?companyId=1` - should only return company 1 data
   - Verify company 1 cannot access company 2's category by ID

4. **Cascade Delete:**
   - Create category with 3 products
   - DELETE category
   - Verify all 3 products deleted

5. **Validation:**
   - POST product with price=-1 - expect 400 Bad Request
   - POST product with count=-5 - expect 400 Bad Request
   - POST product with non-existent categoryId - expect 404 Not Found
   - POST category with empty title - expect 400 Bad Request

---

## Phase 3: Frontend TypeScript Types & API Service

### Objective
Define TypeScript interfaces and extend API service.

### Files to Create

**1. Category Type**
- Path: `frontend/src/types/category.ts`
- Interface:
  ```typescript
  export interface Category {
    id?: number;
    companyId: number;
    title: string;
    image: string; // Base64
  }
  ```

**2. Product Type**
- Path: `frontend/src/types/product.ts`
- Interface:
  ```typescript
  export interface Product {
    id?: number;
    categoryId: number;
    title: string;
    image: string; // Base64
    price: number;
    count: number;
  }
  ```

### Files to Modify

**1. API Service**
- Path: `frontend/src/services/api.ts`
- Add namespaced methods following existing `users` pattern:
  ```typescript
  categories: {
    getAll: async (companyId: number): Promise<Category[]>
    getById: async (id: number): Promise<Category>
    create: async (category: Category): Promise<Category>
    update: async (id: number, category: Partial<Category>): Promise<Category>
    delete: async (id: number): Promise<void>
  },
  products: {
    getAll: async (companyId: number): Promise<Product[]>
    getByCategory: async (categoryId: number): Promise<Product[]>
    getById: async (id: number): Promise<Product>
    create: async (product: Product): Promise<Product>
    update: async (id: number, product: Partial<Product>): Promise<Product>
    delete: async (id: number): Promise<void>
  }
  ```

### Testing (Post-Phase 3)

**Use Playwright MCP for web testing:**

1. **Type Safety:**
   - Verify TypeScript compilation passes
   - Test API service methods in browser console
   - Verify response types match TypeScript interfaces

2. **Integration Testing:**
   - Call `apiService.categories.getAll(1)` - verify array returned
   - Call `apiService.products.getAll(1)` - verify array returned
   - Create category/product via service - verify success

---

## Phase 4: Frontend UI Components

### Objective
Build reusable React components matching dark industrial theme from Login.tsx.

### Files to Create

**1. Dialog Component**
- Path: `frontend/src/components/ui/dialog.tsx`
- Radix UI Dialog wrapper
- Styling: `bg-gray-900 border-white/10 rounded-xl` (match Login theme)

**2. Select Component**
- Path: `frontend/src/components/ui/select.tsx`
- Radix UI Select wrapper
- Styling: Match Input component from Login (bg-white/5, border-white/20)

**3. CategoryCard Component**
- Path: `frontend/src/components/inventory/CategoryCard.tsx`
- Props: `category: Category, onEdit: () => void, onDelete: () => void`
- Design: Card with Base64 image, title, Edit/Delete buttons
- Icons: lucide-react (Edit, Trash2)
- Styling: `bg-white/5 border-white/10 rounded-xl` with gradient hover effects

**4. ProductCard Component**
- Path: `frontend/src/components/inventory/ProductCard.tsx`
- Props: `product: Product, onEdit: () => void, onDelete: () => void`
- Design: Image, title, price badge, count badge, Edit/Delete buttons
- Styling: Match CategoryCard with additional badges for price/count

**5. CategoryForm Component**
- Path: `frontend/src/components/inventory/CategoryForm.tsx`
- Props: `category?: Category, onSubmit: (category: Category) => Promise<void>, onCancel: () => void`
- Fields: Title (Input), Image (file picker → Base64 conversion)
- Validation: Title required, min 2 chars, max 100 chars, file type/size validation
- Styling: Match Login.tsx input styling (bg-white/5, focus:border-secondary-400)

**6. ProductForm Component**
- Path: `frontend/src/components/inventory/ProductForm.tsx`
- Props: `product?: Product, categories: Category[], onSubmit: (product: Product) => Promise<void>, onCancel: () => void`
- Fields: Title, Category (Select), Price, Count, Image
- Validation: All required, price > 0, count >= 0, title min/max length
- Category dropdown disabled if `categories.length === 0`
- Styling: Consistent dark theme

**7. EmptyState Component**
- Path: `frontend/src/components/inventory/EmptyState.tsx`
- Props: `icon: LucideIcon, title: string, description: string, actionLabel?: string, onAction?: () => void, actionDisabled?: boolean`
- Design: Centered icon, title, description, optional action button
- Styling: Gray text with gradient accent for icon

### Testing (Post-Phase 4)

**Use Playwright MCP for web testing - component testing:**

1. **Dialog:**
   - Open/close dialog programmatically
   - Verify dark styling applied
   - Test ESC key closes dialog

2. **Select:**
   - Render with options
   - Open dropdown, select option
   - Verify value updates

3. **CategoryCard:**
   - Render with sample data
   - Verify Base64 image displays
   - Click Edit/Delete, verify callbacks fire

4. **ProductCard:**
   - Render with sample data
   - Verify all fields display (image, title, price, count)
   - Test Edit/Delete callbacks

5. **CategoryForm:**
   - Submit empty form - verify validation errors
   - Fill title with 1 char - verify min length error
   - Upload image - verify Base64 conversion
   - Submit valid form - verify onSubmit called

6. **ProductForm:**
   - Render with no categories - verify dropdown disabled
   - Enter price = -5 - verify validation error
   - Enter count = -2 - verify validation error
   - Fill correctly - verify submission

7. **EmptyState:**
   - Render with disabled action - verify button disabled
   - Click action - verify callback fires

---

## Phase 5: Inventory Dashboard Page

### Objective
Build main inventory page with full CRUD functionality.

### Page Structure

```
Header
  ├─ Title: "Inventory Management"
  └─ Create Category Button (always enabled)

Categories Section
  ├─ Section Header + Count
  ├─ Empty State (if no categories)
  │   ├─ Package icon
  │   ├─ "No categories yet"
  │   └─ "Create Category" button
  └─ Category Grid (if categories exist)
      └─ CategoryCard[] with Edit/Delete

Separator

Products Section
  ├─ Section Header + Create Product Button
  ├─ Empty State (if no products)
  │   ├─ Box icon
  │   ├─ "No products yet" OR "Create a category first"
  │   └─ "Create Product" button (disabled if no categories)
  └─ Product Grid (if products exist)
      └─ ProductCard[] with Edit/Delete
```

### Files to Create

**1. Inventory Page**
- Path: `frontend/src/pages/Inventory.tsx`
- State: categories, products, modals, loading, errors
- Company Context: Hardcode `companyId=1` for now (auth later)
- Features:
  - Fetch categories/products on mount
  - Create/Edit/Delete dialogs for both types
  - Cascade delete confirmation dialog
  - Empty states
  - Loading spinners
  - Error alerts
- Styling: Match Dashboard.tsx layout, Login.tsx theme

### Files to Modify

**1. App Router**
- Path: `frontend/src/App.tsx`
- Add route: `/inventory` → Inventory page

**2. Dashboard Navigation (Optional)**
- Path: `frontend/src/pages/Dashboard.tsx`
- Add "Inventory" menu item/link

### Testing (Post-Phase 5)

**Use Playwright MCP for web testing - full page testing:**

1. **Initial Load:**
   - Navigate to `/inventory`
   - Verify header renders
   - With no data: verify both empty states
   - Verify "Create Category" enabled
   - Verify "Create Product" DISABLED

2. **Category Creation Flow:**
   - Click "Create Category"
   - Fill form, submit
   - Verify category appears in grid
   - Verify empty state replaced

3. **Product Creation Enabled:**
   - After creating category, verify "Create Product" ENABLED
   - Click "Create Product"
   - Verify category dropdown populated
   - Fill form, submit
   - Verify product appears

4. **Edit Flows:**
   - Click Edit on category
   - Verify form pre-populates
   - Modify title, submit
   - Verify card updates
   - Repeat for product (test price/count updates)

5. **Delete Flows:**
   - Click Delete on product
   - Confirm deletion
   - Verify product removed
   - Create category with 2 products
   - Click Delete on category
   - Verify cascade warning: "This will delete 2 products"
   - Confirm deletion
   - Verify category AND products removed

6. **Validation:**
   - Try create product without category - verify error
   - Try create product with negative price - verify error
   - Try create category with empty title - verify error

7. **Company Isolation:**
   - Create data with companyId=1
   - Change to companyId=2, refresh
   - Verify company 1 data NOT visible

---

## Phase 6: Validation, Polish & Complete E2E Testing

### Objective
Finalize validation, error handling, and comprehensive testing.

### Files to Modify

**1. Backend Validation**
- Enhance Category/Product entities with complete validation annotations
- Add proper error responses with meaningful messages

**2. Frontend Validation**
- Add real-time validation feedback in forms
- Disable submit when invalid
- Display backend error messages in Alerts

**3. Image Handling**
- Add file size validation (max 2MB before Base64)
- Add file type validation (only image/*)
- Add image preview in forms

### Complete End-to-End Testing

**Use Playwright MCP for web testing - comprehensive E2E test suite:**

#### Test Suite 1: Company A - Full CRUD Lifecycle

1. Navigate to `/inventory` with companyId=1
2. Create "Electronics" category
3. Create "Furniture" category
4. Verify both in grid
5. Edit "Electronics" → "Electronic Devices"
6. Delete "Furniture" (no products)
7. Create products: "Laptop" ($999.99, qty 10), "Monitor" ($299.99, qty 15), "Keyboard" ($79.99, qty 25)
8. Verify all 3 products in grid
9. Edit "Laptop" → $899.99, qty 8
10. Delete "Keyboard"
11. Attempt delete "Electronic Devices" → verify warning "This will delete 2 products"
12. Cancel, verify still exists
13. Confirm delete → verify category AND products removed
14. Verify empty states reappear

#### Test Suite 2: Company B - Data Isolation

1. Switch to companyId=2
2. Navigate to `/inventory`
3. Verify empty states (no Company A data)
4. Create "Office Supplies" category
5. Create "Notebook" product ($5.99, qty 100)
6. Switch back to companyId=1
7. Verify Company B data NOT visible

#### Test Suite 3: Validation Rules

**Category Validation:**
- Title = "" → "Title is required"
- Title = "A" → "Title must be at least 2 characters"
- Title = 101 chars → "Title must be at most 100 characters"
- Non-image file → "Please select an image file"
- 5MB image → "Image size must be less than 2MB"

**Product Validation:**
- No category selected → "Category is required"
- Price = 0 → "Price must be greater than 0"
- Price = -5 → "Price must be greater than 0"
- Count = -1 → "Count must be 0 or greater"

#### Test Suite 4: Business Logic

1. **Product Creation Blocking:**
   - Start with no categories
   - Verify "Create Product" DISABLED
   - Hover → tooltip "Create a category first"
   - Create category
   - Verify "Create Product" ENABLED
   - Delete only category
   - Verify "Create Product" DISABLED again

2. **Empty States:**
   - Verify "No categories" empty state correct
   - Create category
   - Verify "No products" empty state correct
   - Create product
   - Verify grids replace empty states

#### Test Suite 5: UI/UX Polish

1. **Responsive Design:**
   - Desktop (1920x1080) - 3-4 items per row
   - Tablet (768x1024) - 2 items per row
   - Mobile (375x667) - 1 item per row

2. **Loading States:**
   - Verify spinners during API calls
   - Verify spinners disappear after completion

3. **Theme Consistency:**
   - All components use dark industrial theme
   - Colors match: gray-900 base, cyan/blue secondary, amber accent
   - Gradient buttons match Login.tsx
   - Input styling matches Login.tsx

4. **Accessibility:**
   - Tab through forms - all inputs keyboard accessible
   - ESC in dialog closes it
   - Screen reader labels correct

#### Test Suite 6: Error Handling

1. **API Errors:**
   - Simulate backend down
   - Try create category
   - Verify error alert with meaningful message

2. **Network Errors:**
   - Simulate slow network (3G throttle)
   - Create product
   - Verify loading state persists
   - Verify success after delay

---

## Design System Reference

### Color Palette (Dark Industrial Theme)

From Login.tsx and Tailwind config:
- **Background:** gray-900 (#111827), gray-950 (#030712)
- **Borders:** white/10, white/20
- **Text:** white, gray-100, gray-200
- **Primary (Charcoal):** gray-500 to gray-900
- **Secondary (Cyan/Blue):** #0ea5e9 to #0c4a6e
- **Accent (Amber):** #f59e0b to #78350f
- **Success:** #10b981 to #064e3b
- **Error:** #ef4444 to #7f1d1d

### Component Styling Patterns

**Buttons:**
- Primary: `bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700`
- Destructive: `bg-error-500 hover:bg-error-600`
- Ghost: `hover:bg-white/5`

**Inputs:**
- `bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30`

**Cards:**
- `bg-white/5 border border-white/10 rounded-xl shadow-lg`

**Modals:**
- Overlay: `bg-black/80 backdrop-blur-sm`
- Content: `bg-gray-900 border border-white/10 rounded-xl`

---

## Implementation Order

1. **Phase 1** (Backend Entities) → Test DB schema
2. **Phase 2** (REST API) → Test APIs with Playwright MCP
3. **Phase 3** (TypeScript/API Service) → Test type safety
4. **Phase 4** (UI Components) → Test components with Playwright MCP
5. **Phase 5** (Dashboard Page) → Test page flows with Playwright MCP
6. **Phase 6** (Polish & Complete E2E) → Full test suite with Playwright MCP

**Estimated Time:** 11-16 hours

---

## Critical Files Summary

**Backend:**
1. `spring-app/src/main/java/net/javaguides/spring_app/entity/Category.java`
2. `spring-app/src/main/java/net/javaguides/spring_app/entity/Product.java`
3. `spring-app/src/main/java/net/javaguides/spring_app/controller/CategoryController.java`
4. `spring-app/src/main/java/net/javaguides/spring_app/controller/ProductController.java`

**Frontend:**
1. `frontend/src/pages/Inventory.tsx`
2. `frontend/src/services/api.ts`
3. `frontend/src/components/inventory/CategoryForm.tsx`
4. `frontend/src/components/inventory/ProductForm.tsx`

---

## Risk Mitigation

1. **Base64 Image Size:** Client-side compression + 2MB limit before conversion
2. **Company Isolation:** Future: JWT auth with session-based companyId
3. **Cascade Delete Safety:** Always show product count in confirmation
4. **Performance:** Future: Add pagination for large inventories
