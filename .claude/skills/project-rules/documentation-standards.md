# Documentation Standards

**MANDATORY** - Every class and method MUST have up-to-date docstrings.

---

## The Iron Law

```
NEVER modify code without updating docstring.
ALWAYS update docstring when logic/parameters/returns change.
```

---

## Docstring Requirements

Every class and method **MUST** contain:

| Element | Description |
|---------|-------------|
| **Clear, Short Description** | What the class/method does (1-2 sentences) |
| **Parameters** | All input parameters with types and descriptions |
| **Returns** | Return value type and description |
| **Raises** | Exceptions that may be raised (if applicable) |
| **Main Logic Summary** | Brief explanation of core logic (1-2 lines) |

---

## Update Protocol

| Action | Docstring Update |
|--------|------------------|
| Modify code | Update docstring |
| Change logic | Update docstring |
| Change parameters | Update docstring |
| Change return type | Update docstring |
| After any modification | Verify docstring accuracy |

---

## Standard Format - Functions

```python
def process_user_data(user_id: int, include_history: bool = False) -> Dict[str, Any]:
    """
    Process and retrieve user data with optional history.

    Fetches user information from database, applies business logic transformations,
    and optionally includes historical activity records.

    Args:
        user_id (int): Unique identifier for the user
        include_history (bool): Whether to include user's historical data. Defaults to False.

    Returns:
        Dict[str, Any]: Processed user data containing profile info and optional history

    Raises:
        UserNotFoundException: If user_id does not exist in database
        DatabaseConnectionError: If database connection fails

    Main Logic:
        - Validate user_id and fetch from database
        - Apply data transformations and business rules
        - Conditionally append historical records if requested
    """
    # implementation
    pass
```

---

## Standard Format - Classes

```python
class UserService:
    """
    Service layer for user management operations.

    Handles user CRUD operations, authentication, and profile management.
    Coordinates between database layer and API endpoints with business logic.

    Attributes:
        db (Database): Database connection instance
        cache (Cache): Redis cache for user session management

    Main Responsibilities:
        - User creation, retrieval, update, deletion
        - Authentication and authorization
        - Profile data validation and transformation
    """

    def __init__(self, db: Database, cache: Cache):
        """
        Initialize UserService with database and cache connections.

        Args:
            db (Database): Active database connection
            cache (Cache): Redis cache instance for sessions
        """
        self.db = db
        self.cache = cache
```

---

## TypeScript/JavaScript Format

```typescript
/**
 * Process and retrieve user data with optional history.
 *
 * Fetches user information from database, applies business logic transformations,
 * and optionally includes historical activity records.
 *
 * @param userId - Unique identifier for the user
 * @param includeHistory - Whether to include user's historical data
 * @returns Processed user data containing profile info and optional history
 * @throws UserNotFoundException if userId does not exist
 *
 * Main Logic:
 * - Validate userId and fetch from database
 * - Apply data transformations and business rules
 * - Conditionally append historical records if requested
 */
async function processUserData(
  userId: number,
  includeHistory: boolean = false
): Promise<UserData> {
  // implementation
}
```

---

## Checklist Before Committing Code

- [ ] Every new function/class has a docstring
- [ ] Docstrings updated for modified code
- [ ] Args/params match actual function signature
- [ ] Returns type matches actual return
- [ ] Raises section lists actual exceptions
- [ ] Main logic summary reflects current implementation
