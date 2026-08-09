import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Heart, Stethoscope, Building2, CheckCircle2, Lock, Mail, Phone, Droplet } from 'lucide-react';

export const AuthPage = () => {
  const { user, login, signup, logout, updateUserRole, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91-');
  const [role, setRole] = useState('user');
  const [bloodGroup, setBloodGroup] = useState('O-');

  const [message, setMessage] = useState(null);

  const handleGoogleSignIn = async () => {
    setMessage(null);
    const res = await loginWithGoogle();
    if (res.success) {
      setMessage({ type: 'success', text: `Signed in with Google successfully!` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        setMessage({ type: 'success', text: `Welcome back, ${res.user.name || res.user.email}!` });
      }
    } else {
      const res = await signup(email, password, name, role, bloodGroup, phone);
      if (res.success) {
        setMessage({ type: 'success', text: `Account created successfully as ${role.toUpperCase()}!` });
      }
    }
  };

  const roleOptions = [
    { id: 'user', label: 'Standard User / Victim', icon: User, desc: 'Report emergencies & request rescue' },
    { id: 'donor', label: 'Blood Donor', icon: Heart, desc: 'Alerted for matching blood emergencies' },
    { id: 'volunteer', label: 'First Responder / Volunteer', icon: Stethoscope, desc: 'Trust-scored emergency responder' },
    { id: 'hospital', label: 'Hospital Admin', icon: Building2, desc: 'Manage ICU & antivenom telemetry' }
  ];

  return (
    <div className="w-full pb-28 pt-4 px-4 max-w-md mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 mx-auto flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          {user ? 'Responder Profile & Security' : (isLogin ? 'Access RESQONE AI+' : 'Join Emergency Network')}
        </h2>
        <p className="text-xs text-slate-400">
          Role-based security enforced via Supabase Auth & RLS policies
        </p>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
          message.type === 'success' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-red-950/80 border-red-700 text-red-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Logged In View */}
      {user ? (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="inline-block mt-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                {user.role} ACCOUNT
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Switch Active Role (Demo)</h4>
            <div className="grid grid-cols-2 gap-2">
              {['user', 'donor', 'volunteer', 'hospital'].map((r) => (
                <button
                  key={r}
                  onClick={() => updateUserRole(r)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all uppercase ${
                    user.role === r 
                      ? 'bg-red-600 border-red-500 text-white shadow-md' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={logout}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-red-400 font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Sign Out of Session
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg transition-colors ${isLogin ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${!isLogin ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          {/* Google Sign-In Button */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-3 transition-all shadow-md active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-800/80 w-full"></div>
              <span className="bg-slate-950/90 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute rounded-full border border-slate-800/50 py-0.5">
                or use email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Select Network Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {roleOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = role === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setRole(opt.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                            isSelected ? 'bg-red-950/40 border-red-500 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                          <div>
                            <div className="text-xs font-bold">{opt.label}</div>
                            <div className="text-[10px] text-slate-400">{opt.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="responder@resqone.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-red-950 transition-all text-xs border border-red-500/30 mt-2"
            >
              {isLogin ? 'Sign In to RESQONE Network' : 'Register Profile & Role'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
