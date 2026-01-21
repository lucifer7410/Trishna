import React, { useState } from 'react';
import { Leaf, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
        // MOCK LOGIN LOGIC
        // Check if user exists in localStorage
        const storedUser = localStorage.getItem(`trishna_mock_user_${formData.email}`);
        
        if (storedUser) {
           const user = JSON.parse(storedUser);
           if (user.password === formData.password) {
             setLoading(false);
             onLogin(formData.email);
           } else {
             setLoading(false);
             setError("The password you entered is incorrect. Please try again.");
           }
        } else {
           setLoading(false);
           setError("We could not find an account with this email. Please sign up to create one.");
        }
      } else {
        // MOCK SIGNUP LOGIC
        if (formData.password.length < 4) {
            setLoading(false);
            setError("Password must be at least 4 characters long.");
            return;
        }

        // Check if already exists
        const existingUser = localStorage.getItem(`trishna_mock_user_${formData.email}`);
        if (existingUser) {
            setLoading(false);
            setError("An account with this email already exists. Please sign in.");
            return;
        }

        const newUser = {
            name: formData.name,
            email: formData.email,
            password: formData.password
        };
        
        // Save to mock DB
        localStorage.setItem(`trishna_mock_user_${formData.email}`, JSON.stringify(newUser));
        
        // Save name specifically for onboarding to pick up if needed later
        localStorage.setItem('trishna_temp_name', formData.name);

        setLoading(false);
        onLogin(formData.email);
      }
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    // Simulate social login delay
    setTimeout(() => {
      setLoading(false);
      // Mock email for social login
      onLogin('social_user@example.com');
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData(prev => ({ ...prev, password: '' })); // Clear password on switch
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/60 relative animate-fade-in-up">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-48 h-48 bg-green-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              {isLogin ? 'Access your smart farming companion' : 'Start your journey to smarter agriculture'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 sm:text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 sm:text-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 sm:text-sm"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-500/30 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 backdrop-blur text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button 
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
             <p className="text-sm text-gray-600">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button
                 onClick={toggleMode}
                 className="font-semibold text-green-600 hover:text-green-500 transition-colors"
               >
                 {isLogin ? 'Sign up' : 'Log in'}
               </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;