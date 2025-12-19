# Architecture Diagrams Collection

This document contains all Mermaid diagrams for easy export and visualization. You can render these diagrams using:
- [Mermaid Live Editor](https://mermaid.live/)
- GitHub (renders automatically in markdown)
- VS Code with Mermaid extension
- Any Mermaid-compatible tool

---

## 1. System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end

    subgraph "Frontend Container :4200"
        React[React 19 App]
        Router[React Router]
        Context[Cart Context]
        APIClient[Axios API Client]
    end

    subgraph "Backend Container :4201"
        Filter[JWT Auth Filter]
        Controllers[REST Controllers]
        Services[Business Services]
        Repositories[JPA Repositories]
    end

    subgraph "Data Layer :5433"
        PostgreSQL[(PostgreSQL 16)]
    end

    subgraph "External Services"
        Gemini[Google Gemini 3 Flash]
    end

    Browser --> React
    React --> Router
    React --> Context
    React --> APIClient
    APIClient -->|HTTP + JWT| Filter
    Filter --> Controllers
    Controllers --> Services
    Services --> Repositories
    Services -->|AI Analysis| Gemini
    Repositories --> PostgreSQL

    style Browser fill:#e1f5fe
    style React fill:#bbdefb
    style PostgreSQL fill:#c8e6c9
    style Gemini fill:#fff3e0
```

---

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CATEGORIES : "owns"
    USERS ||--o{ ORDERS : "creates"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    PRODUCTS ||--o{ PRODUCT_COUNT_HISTORY : "has"
    ORDERS ||--o{ ORDER_ITEMS : "contains"

    USERS {
        bigint id PK
        varchar company_name
        varchar company_email UK
        varchar password
    }

    CATEGORIES {
        bigint id PK
        bigint company_id FK
        varchar title
        text image
    }

    PRODUCTS {
        bigint id PK
        bigint category_id FK
        varchar title
        text image
        double price
        integer count
    }

    ORDERS {
        bigint id PK
        bigint company_id FK
        varchar client_name
        varchar status
        timestamp created_at
        varchar invoice_number
        double total_amount
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        double unit_price
        double subtotal
    }

    PRODUCT_COUNT_HISTORY {
        bigint id PK
        bigint product_id FK
        integer old_count
        integer new_count
        varchar change_type
        timestamp changed_at
    }
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    Note over U,DB: Login Flow
    U->>F: Enter email & password
    F->>B: POST /api/users/login
    B->>DB: Find user by email
    DB-->>B: User record
    B->>B: Verify BCrypt password
    B->>B: Generate JWT token
    B-->>F: {token, id, companyName, companyEmail}
    F->>F: Store token in localStorage
    F->>F: Store user in localStorage
    F-->>U: Redirect to /inventory

    Note over U,DB: Authenticated Request
    U->>F: View products
    F->>F: Get token from localStorage
    F->>B: GET /api/products + Authorization: Bearer <token>
    B->>B: JwtAuthFilter validates token
    B->>B: Extract userId from token
    B->>DB: Query products WHERE company_id = userId
    DB-->>B: Products list
    B-->>F: JSON response
    F-->>U: Display products

    Note over U,DB: Logout Flow
    U->>F: Click logout
    F->>F: Remove token from localStorage
    F->>F: Remove user from localStorage
    F-->>U: Redirect to /login
```

---

## 4. Order Workflow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Order
    PENDING --> PENDING: Update Order
    PENDING --> [*]: Delete Order
    PENDING --> FINALIZED: Finalize Order

    state FINALIZED {
        [*] --> ValidateStock
        ValidateStock --> DeductInventory: Stock Available
        ValidateStock --> Error: Insufficient Stock
        DeductInventory --> RecordHistory
        RecordHistory --> GenerateInvoice
        GenerateInvoice --> [*]
    }

    FINALIZED --> DownloadPDF: Get Invoice
```

---

## 5. Order Finalization Process

```mermaid
flowchart TD
    A[User clicks Finalize] --> B{Order Status?}
    B -->|PENDING| C[Validate Stock]
    B -->|FINALIZED| X[Error: Already Finalized]

    C --> D{All items in stock?}
    D -->|No| Y[Error: Insufficient Stock]
    D -->|Yes| E[Deduct Inventory]

    E --> F[Record History for each item]
    F --> G[Generate Invoice Number]
    G --> H[Set status = FINALIZED]
    H --> I[Set finalizedAt timestamp]
    I --> J[Save Order]
    J --> K[Return Updated Order]

    style X fill:#ffcdd2
    style Y fill:#ffcdd2
    style K fill:#c8e6c9
```

---

## 6. AI Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Analysis Page
    participant C as AnalysisController
    participant G as GeminiService
    participant P as ProductRepo
    participant H as HistoryService
    participant AI as Gemini AI

    U->>F: Click "Generate AI Analysis"
    F->>F: Set loading = true
    F->>C: GET /api/analysis

    C->>P: getProductsByCompany(companyId)
    P-->>C: List<Product>

    C->>H: getCompanyHistoryLastMonths(companyId, 6)
    H-->>C: Stock movement data

    C->>G: analyzeInventory(products, history)

    G->>G: buildAnalysisPrompt()
    Note over G: Construct detailed prompt with<br/>products + sales + restock data

    G->>AI: Send prompt to Gemini 3 Flash
    AI-->>G: JSON response

    G->>G: parseGeminiResponse()
    Note over G: Convert JSON to DTO

    G-->>C: InventoryAnalysisResponse

    C-->>F: JSON response
    F->>F: Set loading = false
    F-->>U: Display Analysis Dashboard
```

---

## 7. Frontend Component Hierarchy

```mermaid
graph TB
    subgraph "App Root"
        App[App.tsx]
    end

    subgraph "Providers"
        BR[BrowserRouter]
        CP[CartProvider]
    end

    subgraph "Layout"
        SB[Sidebar]
    end

    subgraph "Pages"
        Login[Login]
        SignUp[SignUp]
        Inventory[Inventory]
        TableView[TableView]
        Analysis[Analysis]
        Checkout[Checkout]
        Orders[Orders]
        OrderDetail[OrderDetail]
    end

    subgraph "Shared Components"
        UI[UI Components]
        INV[Inventory Components]
        CART[Cart Components]
    end

    App --> BR
    BR --> CP
    CP --> SB
    CP --> Pages
    Inventory --> INV
    Inventory --> CART
    Inventory --> UI
    Orders --> UI
    Analysis --> UI
    Checkout --> UI
    Checkout --> CART

    style App fill:#e3f2fd
    style Pages fill:#fff3e0
    style UI fill:#e8f5e9
```

---

## 8. Backend Layer Architecture

```mermaid
graph LR
    subgraph "Controllers"
        UC[UserController]
        CC[CategoryController]
        PC[ProductController]
        OC[OrderController]
        AC[AnalysisController]
    end

    subgraph "Services"
        OS[OrderService]
        IS[InvoiceService]
        GS[GeminiService]
        HS[HistoryService]
    end

    subgraph "Repositories"
        UR[UserRepo]
        CR[CategoryRepo]
        PR[ProductRepo]
        OR[OrderRepo]
        OIR[OrderItemRepo]
        HR[HistoryRepo]
    end

    UC --> UR
    CC --> CR
    PC --> PR
    PC --> HS
    OC --> OS
    OS --> OR
    OS --> OIR
    OS --> PR
    OS --> IS
    OS --> HS
    AC --> GS
    GS --> PR
    GS --> HS
    HS --> HR
```

---

## 9. Multi-Tenant Data Isolation

```mermaid
graph TB
    subgraph "Company A (userId=1)"
        UA[User A]
        CA1[Category: Electronics]
        CA2[Category: Clothing]
        PA1[Product: Laptop]
        PA2[Product: T-Shirt]
        OA[Orders A]
    end

    subgraph "Company B (userId=2)"
        UB[User B]
        CB1[Category: Food]
        PB1[Product: Pizza]
        PB2[Product: Burger]
        OB[Orders B]
    end

    subgraph "Shared Database"
        DB[(PostgreSQL)]
    end

    subgraph "JWT Authentication"
        JWT[JWT Token contains userId]
    end

    UA --> CA1
    UA --> CA2
    CA1 --> PA1
    CA2 --> PA2
    UA --> OA

    UB --> CB1
    CB1 --> PB1
    CB1 --> PB2
    UB --> OB

    PA1 --> DB
    PA2 --> DB
    PB1 --> DB
    PB2 --> DB
    OA --> DB
    OB --> DB

    JWT -.->|Filters all queries| DB

    style UA fill:#bbdefb
    style UB fill:#c8e6c9
```

---

## 10. Docker Container Architecture

```mermaid
graph TB
    subgraph "Docker Network"
        subgraph "Frontend Container"
            NGINX[Nginx :80]
            REACT[React Build]
        end

        subgraph "Backend Container"
            SPRING[Spring Boot :4201]
            JVM[JVM 21]
        end

        subgraph "Database Container"
            PG[PostgreSQL :5432]
            VOL[(Volume: postgres_data)]
        end
    end

    subgraph "Host Machine"
        P4200[Port 4200]
        P4201[Port 4201]
        P5433[Port 5433]
    end

    subgraph "External"
        BROWSER[Browser]
        GEMINI[Gemini API]
    end

    BROWSER --> P4200
    P4200 --> NGINX
    NGINX --> REACT
    REACT -.->|API Calls| P4201
    P4200 -.->|Proxy /api| P4201
    P4201 --> SPRING
    SPRING --> PG
    SPRING --> GEMINI
    PG --> VOL

    style BROWSER fill:#e1f5fe
    style GEMINI fill:#fff3e0
```

---

## 11. Request Lifecycle

```mermaid
flowchart LR
    subgraph "Client"
        A[User Action]
    end

    subgraph "Frontend"
        B[React Component]
        C[API Service]
    end

    subgraph "Backend"
        D[CORS Filter]
        E[JWT Filter]
        F[Controller]
        G[Service]
        H[Repository]
    end

    subgraph "Database"
        I[(PostgreSQL)]
    end

    A --> B
    B --> C
    C -->|HTTP Request| D
    D --> E
    E -->|Extract userId| F
    F --> G
    G --> H
    H --> I
    I --> H
    H --> G
    G --> F
    F --> E
    E --> D
    D -->|HTTP Response| C
    C --> B
    B --> A
```

---

## Usage Instructions

### Rendering in GitHub
Simply view any `.md` file containing these diagrams in GitHub - they render automatically.

### Rendering Locally
1. Install VS Code extension: "Markdown Preview Mermaid Support"
2. Open any diagram file
3. Press `Ctrl+Shift+V` to preview

### Export to Image
1. Go to [Mermaid Live Editor](https://mermaid.live/)
2. Paste any diagram code
3. Download as PNG, SVG, or PDF

### Embedding in Documents
Use the exported images in:
- PowerPoint/Google Slides
- Word/Google Docs
- Confluence/Notion
- Any documentation platform
