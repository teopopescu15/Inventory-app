import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { apiService } from '../services/api';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength calculation
  useEffect(() => {
    const password = formData.password;
    const errors: string[] = [];
    let strength = 0;

    if (password.length > 0) {
      if (password.length >= 8) {
        strength++;
      } else {
        errors.push('At least 8 characters');
      }

      if (/[A-Z]/.test(password)) {
        strength++;
      } else {
        errors.push('One uppercase letter');
      }

      if (/[a-z]/.test(password)) {
        strength++;
      } else {
        errors.push('One lowercase letter');
      }

      if (/[0-9]/.test(password)) {
        strength++;
      } else {
        errors.push('One number');
      }

      if (/[^A-Za-z0-9]/.test(password)) {
        strength++;
      } else {
        errors.push('One special character');
      }
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-error-400';
    if (passwordStrength === 3) return 'bg-accent-400';
    if (passwordStrength === 4) return 'bg-secondary-400';
    return 'bg-success-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Fair';
    if (passwordStrength === 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthTextColor = () => {
    if (passwordStrength <= 2) return 'text-error-600';
    if (passwordStrength === 3) return 'text-accent-600';
    if (passwordStrength === 4) return 'text-secondary-600';
    return 'text-success-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      // Create user via API
      const newUser = await apiService.users.create({
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        password: formData.password,
      });

      console.log('User created successfully:', newUser);

      // Redirect to login page after successful signup
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' }
      });
    } catch (err: unknown) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to create account. Please try again.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
      <div className="flex h-screen w-full overflow-hidden">
        
        {/* Left Side - Hero / Branding (50% width on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 border-r border-white/10 items-center justify-center p-12 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/images/left-side-login-register-page.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gray-900/40" />
          </div>

          {/* Large Hero Content */}
          <div className="relative z-10 w-full max-w-2xl space-y-8">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">InventoryPro</span>
            </div>

            <h1 className="text-5xl xl:text-7xl font-bold text-white leading-tight tracking-tight" style={{textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)'}}>
              Start Your <br />
              <span className="text-cyan-400" style={{textShadow: '0 0 20px rgba(56,189,248,0.8), 0 0 40px rgba(56,189,248,0.5), 0 0 60px rgba(56,189,248,0.3)'}}>
                Journey
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Join thousands of companies optimizing their operations. Create your account today and get instant access.
            </p>

            {/* Feature badges specific to signup */}
            <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-secondary-400 mb-2">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-1">Smart Tracking</h3>
                  <p className="text-sm text-gray-400">Real-time updates on all your stock movements</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-secondary-400 mb-2">
                    <Loader2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-1">Fast Analytics</h3>
                  <p className="text-sm text-gray-400">Instant insights into your business performance</p>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Container (50% width on desktop, 100% on mobile) */}
        <div className="w-full lg:w-1/2 flex items-center justify-end p-4 sm:p-8 md:p-12 lg:pr-8 relative overflow-y-auto">
          {/* Background image - fully visible */}
          <div className="absolute inset-0">
            <img
              src="/images/right-side-login-register-page.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

           {/* Mobile header */}
           <div className="absolute top-6 left-6 flex lg:hidden items-center gap-2 z-10">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">InventoryPro</span>
           </div>

           <style>{`
              @keyframes borderGlow {
                0%, 100% { box-shadow: 0 0 5px #7dd3fc, 0 0 10px #7dd3fc, 0 0 20px #38bdf8, 0 0 30px #38bdf8; }
                50% { box-shadow: 0 0 10px #7dd3fc, 0 0 20px #7dd3fc, 0 0 40px #38bdf8, 0 0 60px #38bdf8; }
              }
            `}</style>
            <div className="w-full max-w-md my-auto relative z-10 bg-white/5 rounded-2xl p-8 space-y-6 border-2 border-sky-400" style={{animation: 'borderGlow 2s ease-in-out infinite'}}>
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold text-gray-900" style={{textShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)'}}>Create Account</h2>
                <p className="text-gray-800 font-semibold" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>Fill in your details to get started</p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Name field */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-bold flex items-center gap-2 text-gray-900" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                    <User className="w-4 h-4 text-secondary-700" style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))'}} />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary-500 focus:ring-secondary-500/30 transition-all rounded-xl"
                    placeholder="Acme Corporation"
                  />
                </div>

                {/* Company Email field */}
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-sm font-bold flex items-center gap-2 text-gray-900" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                    <Mail className="w-4 h-4 text-secondary-700" style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))'}} />
                    Company Email
                  </Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary-500 focus:ring-secondary-500/30 transition-all rounded-xl"
                    placeholder="you@company.com"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold flex items-center gap-2 text-gray-900" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                    <Lock className="w-4 h-4 text-secondary-700" style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))'}} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary-500 focus:ring-secondary-500/30 transition-all rounded-xl"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 focus-visible:outline-offset-2 rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength
                                ? getPasswordStrengthColor()
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${getPasswordStrengthTextColor()}`}>
                          {getPasswordStrengthText()}
                        </span>
                        {passwordErrors.length > 0 && (
                          <span className="text-xs text-gray-500">
                            Missing: {passwordErrors.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold flex items-center gap-2 text-gray-900" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                    <Lock className="w-4 h-4 text-secondary-700" style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9))'}} />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary-500 focus:ring-secondary-500/30 transition-all rounded-xl"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-500 focus-visible:outline-offset-2 rounded"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="flex items-start gap-3 py-1">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-secondary-500 data-[state=checked]:border-secondary-500 border-gray-400 rounded"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-900 cursor-pointer select-none font-semibold leading-relaxed" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                    I agree to the{' '}
                    <Link to="#" className="text-gray-900 hover:text-secondary-700 transition-colors font-bold hover:underline" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="#" className="text-gray-900 hover:text-secondary-700 transition-colors font-bold hover:underline" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Error message */}
                {error && (
                  <Alert variant="destructive" className="animate-fade-in bg-error-500/10 border-error-500">
                    <AlertDescription className="text-error-600">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] mt-4"
                  style={{boxShadow: '0 0 15px rgba(56,189,248,0.5), 0 0 30px rgba(56,189,248,0.3)'}}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign in link */}
              <p className="text-center text-gray-900 font-semibold mt-6" style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-secondary-700 font-bold transition-colors hover:underline"
                  style={{textShadow: '0 0 8px rgba(255,255,255,1), 0 0 16px rgba(255,255,255,0.8)'}}
                >
                  Sign in
                </Link>
              </p>
           </div>
        </div>
      </div>
  );
};

export default SignUp;
