# Unified Auth Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Redesign Login and SignUp pages from split-panel layout to unified, single-screen design with centered form fields overlaid on branded gradient background.

**Architecture:** Transform the current two-column layout (left: branding panel, right: white form panel) into a single immersive screen with full gradient background, logo at top, hero text and form centered, footer at bottom. Use glass-morphism effect (semi-transparent card with backdrop blur) for form container to maintain readability while blending with background.

**Tech Stack:** React 19.2, TypeScript, Tailwind CSS 4.x, Radix UI components, React Router

**E2E Test Plan:**
- **Screens to verify:** Login page (`/login`), SignUp page (`/signup`)
- **User flows to test:** 
  1. User navigates to `/login` → sees unified gradient background → sees centered login form with glass-morphism effect → fills email + password → clicks Sign In → redirects to `/dashboard`
  2. User navigates to `/signup` → sees unified gradient background → sees centered signup form → fills company name + email + password → accepts terms → clicks Create Account → redirects to `/login` with success message
  3. User on mobile device (375px) → form scales properly → all fields accessible → keyboard doesn't break layout
- **Success indicators:** 
  - No visual "split" between branding and form
  - Form card has semi-transparent background with blur effect
  - Text is readable with sufficient contrast
  - Responsive layout works on mobile, tablet, desktop
  - All interactive elements maintain proper spacing and touch targets
  - Footer remains visible at bottom
- **Potential failure points:** 
  - Backdrop blur not supported in older browsers (graceful degradation)
  - Text contrast insufficient on gradient background
  - Mobile keyboard overlaps form fields
  - Form card opacity too high/low affecting readability

---

## Task 1: Refactor Login Page Layout

**Files:**
- Modify: `frontend/src/pages/Login.tsx:37-208`

**Step 1: Remove split-panel layout structure**

Update the main container from split layout to unified background:

```tsx
// BEFORE (lines 38-41):
<div className="min-h-screen flex flex-col md:flex-row">
  {/* Left Panel - Branding */}
  <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex flex-col">

// AFTER:
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
  {/* Background pattern - full screen */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148, 163, 184) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }} />
  </div>
```

**Expected result:** Container now uses full viewport with gradient background

**Step 2: Create unified content structure**

Replace the two-panel structure with a single flex column layout:

```tsx
{/* Content container with proper vertical spacing */}
<div className="relative z-10 flex flex-col min-h-screen p-8 md:p-12">
  {/* Logo at top */}
  <div className="flex items-center gap-3 mb-8">
    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
      <Package className="w-7 h-7 text-white" />
    </div>
    <span className="text-2xl font-bold text-white">InventoryPro</span>
  </div>

  {/* Centered content area */}
  <div className="flex-1 flex items-center justify-center">
    <div className="w-full max-w-md space-y-6">
      {/* Hero text - centered */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
          Welcome Back
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          Manage your inventory with confidence. Track products, monitor stock levels, and optimize your warehouse operations in real-time.
        </p>
      </div>

      {/* Form card with glass-morphism effect */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Form header */}
        <div className="space-y-3 mb-6">
          <h2 className="text-3xl font-bold text-white">Sign In</h2>
          <p className="text-base text-gray-300">Sign in to continue to your account</p>
        </div>

        {/* SUCCESS MESSAGE (if coming from signup) */}
        {successMessage && (
          <Alert className="mb-6 border-success-200 bg-success-500/20 backdrop-blur-sm animate-fade-in">
            <AlertDescription className="text-success-100">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* FORM - Keep existing form structure but update styling */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
              <Mail className="w-4 h-4 text-secondary-400" />
              Company Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-secondary-400/30"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
              <Lock className="w-4 h-4 text-secondary-400" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base pr-10 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-secondary-400/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-secondary-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-secondary-600 data-[state=checked]:border-secondary-600 border-white/30"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-gray-300 cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="#"
              className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="animate-fade-in bg-error-500/20 border-error-400 backdrop-blur-sm">
              <AlertDescription className="text-error-100">{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-base text-gray-300 mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-secondary-400 hover:text-secondary-300 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>

  {/* Footer at bottom */}
  <div className="mt-auto pt-8 text-gray-400 text-sm flex items-center gap-4 flex-wrap justify-center">
    <span>&copy; 2025 InventoryPro</span>
    <span className="text-gray-600">•</span>
    <Link to="#" className="hover:text-secondary-400 transition-colors">About</Link>
    <span className="text-gray-600">•</span>
    <Link to="#" className="hover:text-secondary-400 transition-colors">Contact</Link>
    <span className="text-gray-600">•</span>
    <Link to="#" className="hover:text-secondary-400 transition-colors">Privacy Policy</Link>
  </div>
</div>
```

**Expected result:** Login page now has unified layout with centered form card using glass-morphism

**Step 3: Update Input component to support transparent backgrounds**

Modify: `frontend/src/components/ui/input.tsx`

The Input component needs to handle the new transparent background styling. Check if additional variant classes are needed:

```tsx
// Verify the Input component supports custom className overrides
// The current implementation should work with:
// className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"

// If Input component restricts these styles, update it to allow:
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className // Ensure custom className can override defaults
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Expected result:** Input component accepts custom background and border styling

**Step 4: Test responsiveness**

Run: `npm run dev`

Manually test in browser:
1. Desktop (1920x1080): Form should be centered, readable
2. Tablet (768x1024): Form should remain centered, proper spacing
3. Mobile (375x667): Form should fill width with padding, scroll if needed

**Expected result:** Layout adapts gracefully to all screen sizes

**Step 5: Commit Login page changes**

```bash
git add frontend/src/pages/Login.tsx frontend/src/components/ui/input.tsx
git commit -m "feat: redesign login page with unified gradient layout

- Remove split-panel layout (left branding, right form)
- Implement single-screen design with full gradient background
- Add glass-morphism effect to form card (backdrop-blur, semi-transparent)
- Center all content vertically and horizontally
- Update text colors for readability on dark background
- Maintain responsive behavior across all breakpoints"
```

---

## Task 2: Refactor SignUp Page Layout

**Files:**
- Modify: `frontend/src/pages/SignUp.tsx:140-382`

**Step 1: Apply same unified layout structure**

Use the identical pattern from Login page:

```tsx
// Replace lines 141-184 (left panel) and lines 186-187 (right panel start)
// with unified structure:

<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
  {/* Background pattern - full screen */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148, 163, 184) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }} />
  </div>

  {/* Content container */}
  <div className="relative z-10 flex flex-col min-h-screen p-8 md:p-12">
    {/* Logo at top */}
    <div className="flex items-center gap-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
        <Package className="w-7 h-7 text-white" />
      </div>
      <span className="text-2xl font-bold text-white">InventoryPro</span>
    </div>

    {/* Centered content */}
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Hero text */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Join Us Today
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Create your account and start managing your inventory with confidence. Join leading companies optimizing their warehouse operations.
          </p>
        </div>

        {/* Form card with glass-morphism */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Form header */}
          <div className="space-y-3 mb-6">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-base text-gray-300">Fill in your details to get started</p>
          </div>

          {/* FORM - Update styling while keeping all logic */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name field */}
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-secondary-400" />
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full h-12 px-4 text-base rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/30 transition-all duration-200 outline-none"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Company Email field */}
            <div className="space-y-2">
              <label htmlFor="companyEmail" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary-400" />
                Company Email
              </label>
              <input
                id="companyEmail"
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleInputChange}
                required
                className="w-full h-12 px-4 text-base rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/30 transition-all duration-200 outline-none"
                placeholder="you@company.com"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary-400" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-4 pr-12 text-base rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/30 transition-all duration-200 outline-none"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-secondary-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength indicator - update colors for dark theme */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor()
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getPasswordStrengthTextColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                    {passwordErrors.length > 0 && (
                      <span className="text-xs text-gray-400">
                        Missing: {passwordErrors.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-4 pr-12 text-base rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-gray-400 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/30 transition-all duration-200 outline-none"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-secondary-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password match indicator - update for dark theme */}
              {formData.confirmPassword && (
                <div className="flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <span className="text-xs text-success-400">✓ Passwords match</span>
                  ) : (
                    <span className="text-xs text-error-400">✗ Passwords don't match</span>
                  )}
                </div>
              )}
            </div>

            {/* Terms and conditions - update for dark theme */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-white/30 bg-white/10 rounded transition-all mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-secondary-400 hover:text-secondary-300 transition-colors font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-secondary-400 hover:text-secondary-300 transition-colors font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-error-500/20 border border-error-400 text-error-100 text-sm animate-fade-in backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-semibold text-base rounded-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-base text-gray-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary-400 hover:text-secondary-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>

    {/* Footer at bottom */}
    <div className="mt-auto pt-8 text-gray-400 text-sm flex items-center gap-4 flex-wrap justify-center">
      <span>&copy; 2025 InventoryPro</span>
      <span className="text-gray-600">•</span>
      <Link to="#" className="hover:text-secondary-400 transition-colors">About</Link>
      <span className="text-gray-600">•</span>
      <Link to="#" className="hover:text-secondary-400 transition-colors">Contact</Link>
      <span className="text-gray-600">•</span>
      <Link to="#" className="hover:text-secondary-400 transition-colors">Privacy Policy</Link>
    </div>
  </div>
</div>
```

**Expected result:** SignUp page now matches Login page's unified layout structure

**Step 2: Test responsiveness and form functionality**

Run: `npm run dev`

Test signup flow:
1. Navigate to `/signup`
2. Fill in all fields with valid data
3. Verify password strength indicator displays correctly on dark background
4. Verify password match indicator is readable
5. Check terms checkbox renders properly
6. Submit form and verify redirect to `/login` with success message
7. Test on mobile (375px) - verify all fields accessible, keyboard doesn't break layout

**Expected result:** SignUp form fully functional with new styling, works across all breakpoints

**Step 3: Commit SignUp page changes**

```bash
git add frontend/src/pages/SignUp.tsx
git commit -m "feat: redesign signup page with unified gradient layout

- Apply same unified layout as Login page
- Update all form fields for dark theme (text colors, borders, backgrounds)
- Adjust password strength indicator colors for visibility
- Update password match indicator for dark background
- Style checkbox and terms text for readability
- Maintain all existing validation and form logic"
```

---

## Task 3: Accessibility and Contrast Verification

**Files:**
- Review: `frontend/src/pages/Login.tsx`
- Review: `frontend/src/pages/SignUp.tsx`

**Step 1: Check text contrast ratios**

Use browser DevTools or online contrast checker (e.g., WebAIM Contrast Checker) to verify:

Required contrast ratios (WCAG AA):
- Normal text: 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1
- Interactive components: 3:1

Check these combinations:
1. White text (`text-white`) on gradient background → should be 7:1+ (excellent)
2. Gray-300 text (`text-gray-300`) on gradient → should be 4.5:1+ minimum
3. Gray-400 placeholder text on white/10 input background → verify 4.5:1+
4. Input border white/30 against background → verify 3:1+

**Expected result:** All text meets WCAG AA standards for contrast

**Step 2: If contrast issues found, adjust opacity**

If any contrast ratios are insufficient:

Option A: Increase form card background opacity:
```tsx
// Change from bg-white/10 to bg-white/15
className="bg-white/15 backdrop-blur-md border border-white/20"
```

Option B: Adjust specific text colors:
```tsx
// If gray-300 insufficient, use gray-200 or gray-100
<p className="text-xl text-gray-200 leading-relaxed">
```

Option C: Add subtle dark overlay to improve input contrast:
```tsx
// For input fields, add darker semi-transparent background
className="bg-gray-900/40 border-white/30 text-white"
```

**Expected result:** All contrast issues resolved while maintaining glass-morphism aesthetic

**Step 3: Test keyboard navigation**

1. Start from Login page
2. Press Tab key repeatedly
3. Verify focus order: Email → Password → Remember Me → Forgot Password → Sign In → Sign Up link
4. Verify focus indicators are visible on dark background
5. Repeat for SignUp page

**Expected result:** All interactive elements are keyboard-accessible with visible focus states

**Step 4: Commit accessibility fixes (if any)**

```bash
git add frontend/src/pages/Login.tsx frontend/src/pages/SignUp.tsx
git commit -m "fix: improve accessibility and contrast on auth pages

- Adjust text colors to meet WCAG AA contrast standards
- Enhance focus indicators for keyboard navigation
- Optimize form card opacity for readability"
```

---

## Task 4: Visual Verification

> **REQUIRED SKILL:** Use `app-test` skill for this task

**Prerequisites:**
- All previous tasks completed
- All code committed
- Backend running on port 8080
- Frontend running on port 5173

**Step 1: Start the application**

Start backend:
```bash
cd spring-app
.\mvnw.cmd spring-boot:run
```

Start frontend:
```bash
cd frontend  
npm run dev
```

Verify: Both services start without errors, frontend accessible at `http://localhost:5173`

**Step 2: Manual visual inspection**

Before automated testing, manually verify in browser:

**Login Page (`http://localhost:5173/login`):**
- [ ] Full gradient background covers entire viewport
- [ ] Logo and InventoryPro text visible at top
- [ ] "Welcome Back" hero text centered and readable
- [ ] Form card has glass-morphism effect (semi-transparent with blur)
- [ ] Email and password fields have transparent backgrounds
- [ ] Text is white/light and readable on all elements
- [ ] "Remember me" checkbox and "Forgot password" link visible
- [ ] Sign In button has gradient, hover effect works
- [ ] "Sign up" link visible at bottom of form card
- [ ] Footer links centered at bottom of page

**SignUp Page (`http://localhost:5173/signup`):**
- [ ] Same unified layout as Login
- [ ] "Join Us Today" hero text centered
- [ ] All 4 form fields visible and styled correctly
- [ ] Password strength indicator bars visible (test with different passwords)
- [ ] Password match indicator appears and is readable
- [ ] Terms checkbox and links styled for dark theme
- [ ] Create Account button styled identically to Sign In button
- [ ] "Sign in" link visible at bottom

**Step 3: Test responsive breakpoints**

Use browser DevTools responsive mode:

**Mobile (375 x 667):**
- [ ] Background pattern visible
- [ ] Logo at top, not cut off
- [ ] Hero text readable, wraps properly
- [ ] Form card width appropriate, padding maintained
- [ ] All form fields fit within viewport width
- [ ] Button full-width and touch-friendly (min 44px height)
- [ ] Footer links wrap properly

**Tablet (768 x 1024):**
- [ ] Form card remains centered
- [ ] Text sizes appropriate for tablet
- [ ] Spacing proportional

**Desktop (1920 x 1080):**
- [ ] Form card doesn't become too wide (max-w-md constraint working)
- [ ] Hero text not too large
- [ ] Plenty of breathing room around elements

**Step 4: Test user flows**

**Login Flow:**
1. Navigate to `http://localhost:5173/login`
2. Enter test credentials:
   - Email: `teodora.popescu@student.upt.ro`
   - Password: `TeoStudent$44`
3. Click "Sign In"
4. Verify redirect to `/dashboard`
5. Check browser console for any errors

**SignUp Flow:**
1. Navigate to `http://localhost:5173/signup`
2. Fill form with test data:
   - Company Name: `Test Corp`
   - Email: `test@testcorp.com`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Check "I agree to terms"
4. Click "Create Account"
5. Verify redirect to `/login` with success message
6. Verify success message visible and readable in glass card
7. Check browser console for any errors

**Step 5: Console and network checks**

Open browser DevTools:

**Console:**
- [ ] Zero JavaScript errors
- [ ] No warning spam (a few warnings OK)
- [ ] No React hydration errors

**Network:**
- [ ] No failed requests (unless testing error states)
- [ ] API calls to `/api/users` succeed (during signup)
- [ ] Assets load correctly (fonts, icons)

**Step 6: Cross-browser testing (if time permits)**

Test in:
- [ ] Chrome/Edge (primary)
- [ ] Firefox (verify backdrop-blur works)
- [ ] Safari (verify backdrop-blur works or degrades gracefully)

**Expected result:** Layout works and looks good in all tested browsers

**Step 7: Document results**

If **all checks pass:**
- ✅ Implementation complete
- Document any minor visual tweaks made during testing
- Prepare for final review

If **any check fails:**
- Document specific issue (screenshot if visual)
- Return to relevant task to fix
- Re-test after fix

---

## Summary

This plan transforms both authentication pages from split-panel layouts to unified, immersive designs. The key changes are:

1. **Structural**: Remove two-column layout, use single full-screen gradient background
2. **Visual**: Add glass-morphism effect to form cards (backdrop-blur + semi-transparent bg)
3. **Styling**: Update all text colors, input styles, borders for dark theme
4. **Accessibility**: Ensure sufficient contrast ratios, keyboard navigation
5. **Responsive**: Maintain mobile-first approach, test all breakpoints

**Estimated time:** 1-2 hours for implementation + testing

**Risk level:** Low (purely visual/CSS changes, no logic modifications)
