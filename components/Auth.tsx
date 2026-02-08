
import React, { useState } from 'react';
import { Leaf, Mail, Lock, User, Loader2, AlertCircle, X, Globe } from 'lucide-react';

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

  // Social Login Simulation State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const [socialData, setSocialData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
        const storedUser = localStorage.getItem(`trishna_mock_user_${formData.email}`);
        
        if (storedUser) {
           const user = JSON.parse(storedUser);
           if (user.password === formData.password) {
             setLoading(false);
             onLogin(formData.email);
           } else {
             setLoading(false);
             setError("The password you entered is incorrect.");
           }
        } else {
           setLoading(false);
           setError("No account found with this email.");
        }
      } else {
        if (formData.password.length < 4) {
            setLoading(false);
            setError("Password too short.");
            return;
        }

        const existingUser = localStorage.getItem(`trishna_mock_user_${formData.email}`);
        if (existingUser) {
            setLoading(false);
            setError("Account already exists.");
            return;
        }

        const newUser = {
            name: formData.name,
            email: formData.email,
            password: formData.password
        };
        
        localStorage.setItem(`trishna_mock_user_${formData.email}`, JSON.stringify(newUser));
        localStorage.setItem('trishna_temp_name', formData.name);

        setLoading(false);
        onLogin(formData.email);
      }
    }, 1200);
  };

  const handleSocialLogin = (provider: string) => {
    setSocialProvider(provider);
    setSocialData({
        name: '',
        email: ''
    });
    setShowSocialModal(true);
  };

  const executeSocialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialData.email || !socialData.name) return;

    setShowSocialModal(false);
    setLoading(true);
    
    // Simulate OAuth Popup and Data Retrieval
    setTimeout(() => {
      setLoading(false);
      
      const { name, email } = socialData;
      const provider = socialProvider;
      
      // Use name directly without appending provider info
      const nameDisplay = name;

      const existingRecord = localStorage.getItem(`trishna_mock_user_${email}`);
      
      if (!existingRecord) {
          localStorage.setItem(`trishna_mock_user_${email}`, JSON.stringify({
              name: name,
              email: email,
              provider: provider,
              joined: new Date().toISOString()
          }));
      }
      
      localStorage.setItem('trishna_temp_name', nameDisplay);
      onLogin(email);
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60 dark:border-gray-800 relative animate-fade-in-up transition-colors duration-500">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-48 h-48 bg-green-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-green-500 to-emerald-600 shadow-xl shadow-green-500/20 mb-6 group transition-transform hover:scale-105">
              <Leaf className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 font-medium">
              {isLogin ? 'Login to your climate-smart assistant' : 'Start your journey to sustainable abundance'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all font-medium"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                required
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all font-medium"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-xl shadow-green-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
            <span className="relative px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')} 
              disabled={loading}
              className="flex justify-center items-center gap-2 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')} 
              disabled={loading}
              className="flex justify-center items-center gap-2 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="text-green-600 dark:text-green-400 font-bold hover:underline transition-colors">
              {isLogin ? 'Join Trishna' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {/* Social Login Simulation Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        {socialProvider === 'google' ? 'Google' : 'Facebook'} Login
                    </h3>
                    <button onClick={() => setShowSocialModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                         <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                             {socialProvider === 'google' ? (
                                <svg className="w-8 h-8" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                             ) : (
                                <svg className="w-8 h-8" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                             )}
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-300">
                             Please confirm the account details received from {socialProvider === 'google' ? 'Google' : 'Facebook'}.
                         </p>
                    </div>

                    <form onSubmit={executeSocialLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Name from Provider</label>
                            <input 
                                type="text" 
                                required
                                value={socialData.name}
                                onChange={e => setSocialData({...socialData, name: e.target.value})}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email from Provider</label>
                            <input 
                                type="email" 
                                required
                                value={socialData.email}
                                onChange={e => setSocialData({...socialData, email: e.target.value})}
                                placeholder="e.g. rahul@example.com"
                                className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">
                            Continue as {socialData.name || 'User'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
