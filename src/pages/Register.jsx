import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { auth, db, collection, addDoc, getDocs, query, where } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeSentMsg, setCodeSentMsg] = useState('');
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (name === 'email') setEmailExists(false);
  };

  const checkEmailExists = async (email) => {
    if (!email) return false;
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) { setEmailExists(true); return true; }
      const q = query(collection(db, 'patients'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) { setEmailExists(true); return true; }
    } catch {}
    return false;
  };

  const sendVerificationCode = async () => {
    if (!formData.email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    try {
      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setError('This email is already registered. Please use another email.');
        setLoading(false);
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await addDoc(collection(db, 'verificationCodes'), {
        email: formData.email,
        code,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: `${formData.firstName} ${formData.lastName}`,
          to_email: formData.email,
          otp_code: code
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setCodeSent(true);
      setTimer(60);
      setError('');
      setCodeSentMsg(`Verification code sent to ${formData.email}`);
    } catch (err) {
      const msg = err?.text || err?.message || JSON.stringify(err);
      setError(`Failed to send code: ${msg}`);
      console.error('EmailJS error:', err);
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) { setError('Please fill in all fields'); return; }
    if (!codeSent) { setError('Please verify your email first'); return; }
    if (!formData.verificationCode) { setError('Please enter verification code'); return; }
    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'verificationCodes'),
        where('email', '==', formData.email),
        where('code', '==', formData.verificationCode)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('Invalid verification code. Please try again.');
        setLoading(false);
        return;
      }
      const codeDoc = snapshot.docs[0].data();
      if (new Date() > codeDoc.expiresAt.toDate()) {
        setError('Verification code expired. Please request a new one.');
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    const pwRules = [
      [formData.password.length < 8, 'Password must be at least 8 characters.'],
      [!/[A-Za-z]/.test(formData.password), 'Password must contain at least one letter.'],
      [!/[0-9]/.test(formData.password), 'Password must contain at least one number.'],
      [!/[^A-Za-z0-9]/.test(formData.password), 'Password must contain at least one special character.'],
    ];
    const pwError = pwRules.find(([cond]) => cond);
    if (pwError) { setError(pwError[1]); return; }
    if (!formData.agreeTerms) { setError('Please agree to the Terms and Conditions'); return; }

    setLoading(true);
    const result = await register({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      sessionStorage.setItem('newlyRegistered', '1');
      navigate('/patient/setup-profile');
    } else setError(result.error || 'Failed to register');
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      const userRole = result.user?.role || 'patient';
      if (userRole === 'superadmin') navigate('/superadmin');
      else if (userRole === 'admin' || userRole === 'doctor') navigate('/admin');
      else navigate('/patient/dashboard');
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }
    setLoading(false);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/kapoya.jpg" alt="DonClinic" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Step {step} of 2</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex gap-2">
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  onBlur={() => checkEmailExists(formData.email)}
                  placeholder="Email Address"
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none ${emailExists ? 'border-red-400' : 'border-gray-300'}`}
                  required
                />
                <button
                  type="button" onClick={sendVerificationCode}
                  disabled={loading || (codeSent && timer > 0) || emailExists}
                  className="px-4 py-2.5 bg-steelblue-500 text-white rounded-lg hover:bg-steelblue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {loading ? 'Sending...' : codeSent && timer > 0 ? `${timer}s` : 'Send Code'}
                </button>
              </div>
              {emailExists && (
                <p className="text-xs text-red-500 mt-1">This email is already registered. <Link to="/signin" className="underline font-medium">Sign in instead?</Link></p>
              )}
            </div>

            {codeSentMsg && (
              <p className="text-sm text-green-600">{codeSentMsg}</p>
            )}

            {codeSent && (
              <Input label="Verification Code" name="verificationCode" value={formData.verificationCode} onChange={handleChange} placeholder="Enter 6-digit code" maxLength={6} required />
            )}

            <Button onClick={handleNext} className="w-full">Next</Button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
              </div>
              <div className="mt-6">
                <button
                  type="button" onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Enter Password"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none ${
                    formData.password && formData.password.length < 8 ? 'border-red-400' : 'border-gray-300'
                  }`}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {formData.password && (
                <ul className="mt-2 space-y-1">
                  {[
                    ['At least 8 characters', formData.password.length >= 8],
                    ['At least one number', /[0-9]/.test(formData.password)],
                    ['At least one special character', /[^A-Za-z0-9]/.test(formData.password)],
                  ].map(([label, passed]) => (
                    <li key={label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-red-500'}`}>
                      {passed
                        ? <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="mt-1 w-4 h-4 text-steelblue-500 border-gray-300 rounded focus:ring-steelblue-400" required />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-steelblue-500 hover:text-steelblue-600 font-medium">Terms and Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-steelblue-500 hover:text-steelblue-600 font-medium">Privacy Policy</Link>
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-steelblue-500 hover:text-steelblue-600 hover:underline font-medium">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
