# Playwright MCP Tools Reference

> **IMPORTANT**: All URLs in examples below use `localhost` as placeholders.
> Before using, check `../env.md` for actual environment URLs.
> Replace `http://localhost:8081` with `FRONTEND_URL` value from env.md.
> Replace `http://localhost:8000` with `BACKEND_URL` value from env.md.

Complete reference for all Playwright MCP tools available for app testing.

## Navigation Tools

### browser_navigate
Navigate to a URL.

```javascript
browser_navigate({ url: "http://localhost:8081" })
```

**When to use**: Starting a test, navigating to specific pages.

### browser_navigate_back
Go back to the previous page.

```javascript
browser_navigate_back({})
```

**When to use**: Testing back navigation, multi-step flows.

### browser_tabs
List, create, close, or select browser tabs.

```javascript
// List all tabs
browser_tabs({ action: "list" })

// Create new tab
browser_tabs({ action: "new" })

// Select tab by index
browser_tabs({ action: "select", index: 0 })

// Close tab
browser_tabs({ action: "close", index: 1 })
```

**When to use**: Multi-tab testing, opening links in new tabs.

## Snapshot & Screenshot Tools

### browser_snapshot
Capture accessibility snapshot of the page. Returns page structure with element refs.

```javascript
browser_snapshot({})
```

**When to use**:
- Before any interaction to get element refs
- After page load to verify structure
- After actions to verify state changes

**Output**: Text representation with refs like `[ref="e1"]` for each element.

### browser_take_screenshot
Take a visual screenshot of the page.

```javascript
// Basic screenshot
browser_take_screenshot({})

// With custom filename
browser_take_screenshot({
  filename: ".playwright/traces/login-page.png"
})

// Full page screenshot
browser_take_screenshot({ fullPage: true })

// JPEG format
browser_take_screenshot({ type: "jpeg" })

// Element-specific screenshot
browser_take_screenshot({
  element: "Login form",
  ref: "e5"
})
```

**When to use**: Visual verification, documenting test results, capturing issues.

## Interaction Tools

### browser_click
Click on an element.

```javascript
browser_click({
  element: "Submit button",
  ref: "e10"
})

// Right click
browser_click({
  element: "Context menu trigger",
  ref: "e10",
  button: "right"
})

// Double click
browser_click({
  element: "Editable text",
  ref: "e10",
  doubleClick: true
})

// With modifier keys
browser_click({
  element: "Link",
  ref: "e10",
  modifiers: ["Control"]  // Ctrl+click
})
```

**When to use**: Buttons, links, toggles, any clickable element.

### browser_type
Type text into an input element.

```javascript
browser_type({
  element: "Email input",
  ref: "e5",
  text: "user@example.com"
})

// Type slowly (triggers key handlers)
browser_type({
  element: "Search box",
  ref: "e5",
  text: "search query",
  slowly: true
})

// Type and submit (press Enter)
browser_type({
  element: "Search box",
  ref: "e5",
  text: "search query",
  submit: true
})
```

**When to use**: Text inputs, search boxes, any editable field.

### browser_fill_form
Fill multiple form fields at once.

```javascript
browser_fill_form({
  fields: [
    { name: "Email field", type: "textbox", ref: "e5", value: "user@example.com" },
    { name: "Password field", type: "textbox", ref: "e6", value: "password123" },
    { name: "Remember me", type: "checkbox", ref: "e7", value: "true" },
    { name: "Country", type: "combobox", ref: "e8", value: "United States" }
  ]
})
```

**Field types**: `textbox`, `checkbox`, `radio`, `combobox`, `slider`

**When to use**: Login forms, registration, any multi-field form.

### browser_hover
Hover over an element.

```javascript
browser_hover({
  element: "Dropdown menu trigger",
  ref: "e10"
})
```

**When to use**: Dropdown menus, tooltips, hover states.

### browser_drag
Drag and drop between elements.

```javascript
browser_drag({
  startElement: "Draggable item",
  startRef: "e5",
  endElement: "Drop zone",
  endRef: "e10"
})
```

**When to use**: Drag-and-drop interfaces, reordering lists.

### browser_select_option
Select option in a dropdown.

```javascript
browser_select_option({
  element: "Country dropdown",
  ref: "e10",
  values: ["United States"]
})

// Multiple selection
browser_select_option({
  element: "Tags",
  ref: "e10",
  values: ["Tag1", "Tag2", "Tag3"]
})
```

**When to use**: Select elements, dropdowns.

### browser_press_key
Press a keyboard key.

```javascript
browser_press_key({ key: "Enter" })
browser_press_key({ key: "Escape" })
browser_press_key({ key: "Tab" })
browser_press_key({ key: "ArrowDown" })
```

**When to use**: Keyboard navigation, shortcuts, form submission.

### browser_file_upload
Upload files.

```javascript
browser_file_upload({
  paths: ["/path/to/file.pdf"]
})

// Multiple files
browser_file_upload({
  paths: ["/path/to/file1.pdf", "/path/to/file2.pdf"]
})

// Cancel file chooser
browser_file_upload({})
```

**When to use**: File upload inputs, image uploads.

## Verification Tools

### browser_console_messages
Get console messages from the page.

```javascript
// All messages
browser_console_messages({})

// Only errors
browser_console_messages({ onlyErrors: true })
```

**Output**: Array of console messages with type (log, warn, error, info).

**When to use**: Error checking, debugging, validation.

### browser_network_requests
List all network requests made by the page.

```javascript
browser_network_requests({})
```

**Output**: Array of requests with URL, method, status.

**When to use**: API verification, checking request failures.

### browser_evaluate
Execute JavaScript in the page context.

```javascript
// Check localStorage
browser_evaluate({
  function: "() => localStorage.getItem('authToken')"
})

// Get page state
browser_evaluate({
  function: "() => ({ url: window.location.href, title: document.title })"
})

// Check element state
browser_evaluate({
  element: "Submit button",
  ref: "e10",
  function: "(el) => ({ disabled: el.disabled, text: el.textContent })"
})
```

**When to use**: localStorage/sessionStorage, custom validations, page state.

## Responsive Testing Tools

### browser_resize
Resize the browser viewport.

```javascript
// Mobile
browser_resize({ width: 375, height: 667 })

// Tablet
browser_resize({ width: 768, height: 1024 })

// Desktop
browser_resize({ width: 1920, height: 1080 })
```

**Standard sizes**:
| Device | Width | Height |
|--------|-------|--------|
| iPhone SE | 375 | 667 |
| iPhone 12/13 | 390 | 844 |
| iPad | 768 | 1024 |
| iPad Pro | 1024 | 1366 |
| Laptop | 1366 | 768 |
| Desktop | 1920 | 1080 |

**When to use**: Responsive testing, mobile verification.

## Waiting Tools

### browser_wait_for
Wait for conditions before proceeding.

```javascript
// Wait for text to appear
browser_wait_for({ text: "Login successful", timeout: 5000 })

// Wait for text to disappear
browser_wait_for({ textGone: "Loading...", timeout: 10000 })

// Wait fixed time (seconds)
browser_wait_for({ time: 2 })
```

**When to use**: After actions, page transitions, async operations.

## Dialog Handling

### browser_handle_dialog
Handle browser dialogs (alert, confirm, prompt).

```javascript
// Accept dialog
browser_handle_dialog({ accept: true })

// Dismiss dialog
browser_handle_dialog({ accept: false })

// Handle prompt with text
browser_handle_dialog({
  accept: true,
  promptText: "User input"
})
```

**When to use**: Alert boxes, confirmation dialogs, prompts.

## Advanced Tools

### browser_run_code
Run arbitrary Playwright code snippet.

```javascript
browser_run_code({
  code: "await page.getByRole('button', { name: 'Submit' }).click();"
})
```

**When to use**: Complex scenarios not covered by other tools.

### browser_install
Install the browser if not present.

```javascript
browser_install({})
```

**When to use**: First-time setup, browser not found errors.

### browser_close
Close the browser page.

```javascript
browser_close({})
```

**When to use**: Cleanup after tests.

## Common Patterns

### Login Flow
```javascript
browser_navigate({ url: "http://localhost:8081" })
browser_snapshot({})  // Get element refs
browser_type({ element: "Email", ref: "e5", text: "user@email.com" })
browser_type({ element: "Password", ref: "e6", text: "password" })
browser_click({ element: "Login button", ref: "e7" })
browser_wait_for({ text: "Dashboard", timeout: 10000 })
browser_console_messages({ onlyErrors: true })  // Check for errors
```

### Form Validation Test
```javascript
browser_navigate({ url: "http://localhost:8081/form" })
browser_snapshot({})
browser_click({ element: "Submit", ref: "e10" })  // Submit empty
browser_snapshot({})  // Check error messages appear
browser_console_messages({})
```

### Responsive Test
```javascript
const sizes = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1920, height: 1080 }
];

for (const size of sizes) {
  browser_resize({ width: size.width, height: size.height })
  browser_take_screenshot({ filename: `.playwright/traces/${size.name}.png` })
  browser_snapshot({})
}
```

### API Request Verification
```javascript
browser_click({ element: "Save", ref: "e10" })
browser_wait_for({ time: 2 })  // Wait for request
browser_network_requests({})  // Check API calls made
```
