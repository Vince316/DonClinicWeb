import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, collection, query, where, getDocs } from '../lib/firebase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Check across all Firestore collections that store emails
      const collections = ['patients', 'admins', 'doctors'];
      let found = false;
      for (const col of collections) {
        const snap = await getDocs(query(collection(db, col), where('email', '==', email)));
        if (!snap.empty) { found = true; break; }
      }
      if (!found) {
        setError('No account found with that email address.');
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
    setLoading(false);
  };

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
          <div className="w-16 h-16 bg-steelblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-steelblue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your email and we'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Password reset email sent to <strong>{email}</strong>. Check your inbox.
            </div>
            <Link to="/signin" className="block text-steelblue-500 hover:text-steelblue-600 font-medium text-sm">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/signin" className="text-steelblue-500 hover:text-steelblue-600 font-medium">Sign In</Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
