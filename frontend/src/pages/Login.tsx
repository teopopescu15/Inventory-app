import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Package } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { apiService } from '@/services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check if there's a success message from signup
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call real login API
      const userData = await apiService.auth.login(email, password);

      // Extract and store JWT token separately
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }

      // Store user data (without token) in localStorage
      const userWithoutToken = {
        id: userData.id,
        companyName: userData.companyName,
        companyEmail: userData.companyEmail
      };
      localStorage.setItem('user', JSON.stringify(userWithoutToken));

      // Navigate to inventory
      navigate('/inventory');
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorData = err.response?.data;
      // Handle error object or string
      if (typeof errorData === 'object' && errorData !== null) {
        setError(errorData.message || errorData.error || 'Invalid email or password. Please try again.');
      } else {
        setError(errorData || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex h-screen w-full overflow-hidden">
        
        {/* Left Side - Hero / Branding (50% width on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 border-r border-white/10 items-center justify-center p-12 overflow-hidden">
          {/* Background pattern matching original styling */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
             <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148, 163, 184) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Large Hero Content */}
          <div className="relative z-10 w-full max-w-2xl space-y-8">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">InventoryPro</span>
            </div>

            <h1 className="text-5xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
              Welcome <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-secondary-200">
                Back
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Manage your inventory with confidence. Track products, monitor stock levels, and optimize your operations.
            </p>

            {/* Feature badges */}
            <div className="flex gap-8 pt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">99%</span>
                  <span className="text-sm text-gray-400">Uptime</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">10k+</span>
                  <span className="text-sm text-gray-400">Users</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">24/7</span>
                  <span className="text-sm text-gray-400">Support</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Container (50% width on desktop, 100% on mobile) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 relative bg-gray-950/50 backdrop-blur-sm">
           {/* Mobile header (visible only on small screens) */}
           <div className="absolute top-6 left-6 flex lg:hidden items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">InventoryPro</span>
           </div>

           <div className="w-full max-w-md space-y-8">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold text-white">Sign In</h2>
                <p className="text-gray-400">Enter your email and password to access your account.</p>
              </div>

              {/* SUCCESS MESSAGE (if coming from signup) */}
              {successMessage && (
                <Alert className="border-success-200 bg-success-500/20 backdrop-blur-sm animate-fade-in">
                  <AlertDescription className="text-success-100">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl"
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
                      className="h-12 text-base pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-secondary-400 focus-visible:outline-offset-2 rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500 border-white/30 rounded"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-gray-300 cursor-pointer select-none font-normal"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="#"
                    className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors font-medium hover:underline"
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
                  className="w-full h-12 bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] mt-4"
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
              <p className="text-center text-gray-400 mt-8">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-white hover:text-secondary-400 font-semibold transition-colors hover:underline"
                >
                  Sign up
                </Link>
              </p>
           </div>
        </div>
      </div>
  );
};

export default Login;
