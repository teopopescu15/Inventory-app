# Code Implementation Integrity

**ABSOLUTE MANDATE** - These rules override all other considerations.

---

## The Iron Law

```
ONE class, ONE responsibility, ONE implementation.
NEVER duplicate. ALWAYS modify existing.
```

---

## Zero Duplication Policy

### Classes

**NEVER create duplicate classes.**

| Action | Approach |
|--------|----------|
| Modifying functionality | Modify the existing production class |
| Changing API parameters | Update the actual implementation |
| Altering logic | Refactor the existing code |

**FORBIDDEN:**
- Parallel classes: `UserService` vs `UserServiceV2`
- Alternative implementations: `OpenAIClient` vs `OpenAIClientNew`
- "Temporary" duplicate classes

**Example:**
```python
# WRONG - Creating duplicate class
class OpenAIClient:
    def generate(self, model="gpt-3.5-turbo"):
        pass

class OpenAIClientGPT4:  # NEVER DO THIS
    def generate(self, model="gpt-4"):
        pass

# CORRECT - Modify existing class
class OpenAIClient:
    def generate(self, model="gpt-4", temperature=0.7):
        # updated logic supporting new parameters
        pass
```

---

### Database Schemas

**NEVER create duplicate schemas.**

| Action | Approach |
|--------|----------|
| Schema changes | Modify existing schema definitions |
| Migration required | Create migration, update existing schema |

**FORBIDDEN:**
- `UserSchemaV1`, `UserSchemaV2`, `UserSchemaOld`
- Parallel table definitions
- Multiple schema versions in codebase

**Example:**
```python
# WRONG - Creating duplicate schema
class UserSchema(BaseModel):
    name: str
    email: str

class UserSchemaV2(BaseModel):  # NEVER DO THIS
    name: str
    email: str
    phone: str

# CORRECT - Modify existing schema
class UserSchema(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None  # Added with backward compatibility
```

---

### Endpoints

**NEVER create duplicate endpoints.**

| Action | Approach |
|--------|----------|
| Endpoint logic changes | Modify existing endpoint |
| API contract changes | Version the API route, not the implementation |

**FORBIDDEN:**
- `/api/users` and `/api/users-new`
- Duplicate route handlers with slightly different logic

---

## Modify Production Code Directly

**All changes go into actual production code:**
- Refactor existing implementations to support new requirements
- Use feature flags if gradual rollout needed, NOT duplicate code
- Delete old code after migration, never leave both versions

---

## Clean Codebase Principles

| DO | DON'T |
|----|-------|
| Enhance existing classes with new functionality | Create parallel implementations |
| Refactor existing code to support new requirements | Leave multiple versions in codebase |
| Replace outdated logic with updated implementation | Create "temporary" alternative classes |
| Delete obsolete code after changes | Keep "reference" copies |

---

## Checklist Before Writing Code

- [ ] Am I modifying existing code (not creating duplicate)?
- [ ] Is there an existing class/schema/endpoint I should update?
- [ ] Will I delete old code after migration?
- [ ] Am I following ONE class = ONE implementation?

**If creating something new, verify nothing similar exists first.**
