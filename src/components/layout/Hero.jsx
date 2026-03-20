import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const EyeIcon = ({ show }) => show ? (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const validatePassword = (pw) => {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must contain at least one special character.';
  return null;
};

const Hero = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', verificationCode: '', password: '', confirmPassword: '' });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    try {
      const result = await login({ email: signInEmail, password: signInPassword });
      if (result.success) {
        const role = result.user?.role || 'patient';
        if (role === 'superadmin') navigate('/superadmin');
        else if (role === 'admin') navigate('/admin');
        else if (role === 'doctor') navigate('/doctor');
        else navigate('/patient/dashboard');
      } else {
        setSignInError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      setSignInError(err.message || 'Failed to sign in');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSignInError('');
    setRegisterError('');
    setSignInLoading(true);
    setRegisterLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      const role = result.user?.role || 'patient';
      if (role === 'superadmin') navigate('/superadmin');
      else if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else navigate('/patient/dashboard');
    } else {
      const errorMsg = result.error || 'Failed to sign in with Google';
      if (activeTab === 'signin') setSignInError(errorMsg);
      else setRegisterError(errorMsg);
    }
    setSignInLoading(false);
    setRegisterLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendVerificationCode = async () => {
    if (!formData.email) { setRegisterError('Please enter your email'); return; }
    setRegisterLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (methods.length > 0) {
        setRegisterError('This email is already registered. Please sign in instead.');
        setRegisterLoading(false);
        return;
      }
    } catch {}
    setTimeout(() => {
      setCodeSent(true);
      setTimer(60);
      setRegisterLoading(false);
      alert('Verification code sent to ' + formData.email);
    }, 1000);
  };

  const handleNext = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) { setRegisterError('Please fill in all fields'); return; }
    if (!codeSent) { setRegisterError('Please verify your email first'); return; }
    if (!formData.verificationCode) { setRegisterError('Please enter verification code'); return; }
    setRegisterError('');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    if (formData.password !== formData.confirmPassword) { setRegisterError('Passwords do not match'); return; }
    const pwError = validatePassword(formData.password);
    if (pwError) { setRegisterError(pwError); return; }
    setRegisterLoading(true);
    const result = await register({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password });
    if (result.success) navigate('/patient/dashboard');
    else setRegisterError(result.error || 'Failed to register');
    setRegisterLoading(false);
  };

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Health, Our Priority
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Experience world-class healthcare with our expert team. Book appointments,
              manage your health records, and get personalized care all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 justify-center md:justify-start">
              <Link to="/register"><Button variant="primary" size="lg" className="w-full sm:w-auto">Get Started</Button></Link>
              <Link to="/about"><Button variant="outline" size="lg" className="w-full sm:w-auto">Learn More</Button></Link>
            </div>
            <div className="flex gap-6 sm:gap-8 pt-6 sm:pt-8 justify-center md:justify-start">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm sm:text-base text-gray-600">Patients</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">50+</div>
                <div className="text-sm sm:text-base text-gray-600">Doctors</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-steelblue-500 to-steelblue-700 bg-clip-text text-transparent">98%</div>
                <div className="text-sm sm:text-base text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">

              {activeTab === 'signin' ? (
                <div className="space-y-4">
                  {signInError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{signInError}</div>}

                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Enter email address" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input type={showSignInPassword ? 'text' : 'password'} value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Enter password" required />
                        <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                          <EyeIcon show={showSignInPassword} />
                        </button>
                      </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full" disabled={signInLoading}>
                      {signInLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-steelblue-500 hover:text-steelblue-600 hover:underline font-medium">Forgot Password?</Link>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <Link to="/register">
                      <button type="button" className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                        Create New Account
                      </button>
                    </Link>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                  </div>

                  <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <GoogleIcon />
                    <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {registerError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{registerError}</div>}

                  {step === 1 ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="First name" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Last name" required />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex gap-2">
                          <input type="email" name="email" value={formData.email} onChange={handleChange} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Enter email address" required />
                          <button type="button" onClick={sendVerificationCode} disabled={registerLoading || (codeSent && timer > 0)} className="px-3 py-3 bg-steelblue-500 text-white rounded-lg hover:bg-steelblue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap">
                            {registerLoading ? 'Sending...' : codeSent && timer > 0 ? `${timer}s` : 'Send'}
                          </button>
                        </div>
                      </div>

                      {codeSent && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                          <input type="text" name="verificationCode" value={formData.verificationCode} onChange={handleChange} placeholder="Enter 6-digit code" maxLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" required />
                        </div>
                      )}

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                      </div>

                      <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <GoogleIcon />
                        <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                      </button>

                      <Button onClick={handleNext} className="w-full mt-4">Next</Button>
                    </>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <input type={showRegisterPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Enter password" required />
                          <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <EyeIcon show={showRegisterPassword} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Min. 8 characters with letters, numbers & special characters.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                          <input type={showRegisterConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" placeholder="Confirm password" required />
                          <button type="button" onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <EyeIcon show={showRegisterConfirmPassword} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
                        <Button type="submit" className="w-full" disabled={registerLoading}>{registerLoading ? 'Creating...' : 'Register'}</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
