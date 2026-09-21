import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { AuthApi } from '../../lib/api/authApi';
import { ArrowRight, Check, Mail, ShieldCheck, UserRound } from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { register, navigate } = useAppStore();
  const [step, setStep] = useState<'email'|'otp'|'profile'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn(v => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [step, resendIn]);

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 'email') {
      if (!email) return;
      setIsLoading(true);
      try {
        if (import.meta.env.VITE_API_ENABLED === 'true') {
          await AuthApi.requestSignupOtp(email);
        }
        setResendIn(30);
        setStep('otp');
      } catch (err: any) {
        setError(err?.message || 'We could not send the verification code.');
      } finally { setIsLoading(false); }
      return;
    }
    if (step === 'otp') {
      if (!/^\d{4,6}$/.test(otp)) return;
      setIsLoading(true);
      try {
        if (import.meta.env.VITE_API_ENABLED === 'true') {
          await AuthApi.verifySignupOtp(email, otp);
        }
        setStep('profile');
      } catch (err: any) {
        setError(err?.message || 'That verification code is invalid or expired.');
      } finally { setIsLoading(false); }
      return;
    }
    if (!username || !displayName || !password) return;
    setIsLoading(true);
    try {
      await register(displayName, username, email, password, bio, '', avatarFile);
    } catch (err: any) {
      setError(err?.message || 'Profile setup failed.');
    } finally { setIsLoading(false); }
  };

  return <div className="max-w-md mx-auto py-6 sm:py-10 animate-fade-in">
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-white font-black mx-auto mb-3 shadow-md">E</div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Create your Everything ID</h1>
        <p className="text-xs text-stone-500 mt-1">One account for social, communities, messages, store, creator and business tools.</p>
      </div>
      {error && <div role="alert" className="mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-[11px] text-rose-700 dark:text-rose-200">{error}</div>}
      <div className="flex items-center justify-between mb-5 text-[10px] font-bold text-stone-400"><span className={step==='email'?'text-violet-600':''}>1 Email</span><span className={step==='otp'?'text-violet-600':''}>2 Verify</span><span className={step==='profile'?'text-violet-600':''}>3 Profile</span></div>
      <form onSubmit={next} className="space-y-3">
        {step === 'email' && <><div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 p-3 text-[11px] text-violet-800 dark:text-violet-200 flex gap-2"><Mail className="w-4 h-4 shrink-0"/><span>Your email is the account ID. We will send a one-time code before creating your profile.</span></div><label className="block text-xs font-semibold">Email<input type="email" autoFocus value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3"/></label></>}
        {step === 'otp' && <><div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-[11px] text-emerald-800 dark:text-emerald-200 flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0"/><span>Verification code sent to <b>{email}</b>. The server verifies this code before account creation.</span></div><label className="block text-xs font-semibold">Email verification code<input inputMode="numeric" maxLength={6} autoFocus value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} placeholder="123456" required className="mt-1 w-full text-center tracking-[.45em] text-lg rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3"/></label><div className="flex items-center justify-between gap-3"><button type="button" onClick={()=>setStep('email')} className="text-[11px] text-violet-600 font-bold">Change email</button><button type="button" disabled={resendIn>0} onClick={async()=>{ setError(''); setIsLoading(true); try { if (import.meta.env.VITE_API_ENABLED === 'true') await AuthApi.requestSignupOtp(email); setResendIn(30); } catch (err:any) { setError(err?.message || 'Could not resend the code.'); } finally { setIsLoading(false); } }} className="text-[11px] font-bold text-stone-500 disabled:opacity-50">{resendIn>0 ? `Resend in ${resendIn}s` : 'Resend code'}</button></div></>}
        {step === 'profile' && <><label className="block text-xs font-semibold">Profile picture <span className="font-normal text-stone-400">optional</span><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){ setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }}} className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-2"/>{avatarPreview && <img src={avatarPreview} alt="Profile preview" className="mt-2 w-14 h-14 rounded-2xl object-cover"/>}</label><div className="rounded-xl bg-stone-50 dark:bg-stone-800 p-3 text-[11px] text-stone-600 dark:text-stone-300 flex gap-2"><UserRound className="w-4 h-4 shrink-0"/><span>Email verified. Create the basic profile now. Identity/payment verification is handled later when a wallet is created.</span></div><label className="block text-xs font-semibold">Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your display name" required className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3"/></label><label className="block text-xs font-semibold">Username<input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="username" required className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3"/></label><label className="block text-xs font-semibold">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3"/></label><label className="block text-xs font-semibold">Bio <span className="font-normal text-stone-400">optional</span><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell people a little about you" className="mt-1 w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-3 min-h-20"/></label><div className="flex items-center gap-2 text-[10px] text-stone-500"><Check className="w-4 h-4 text-emerald-600"/> Wallet/KYC details are not requested during normal signup.</div></>}
        <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"><span>{isLoading ? 'Creating Everything ID…' : step==='email' ? 'Continue' : step==='otp' ? 'Verify email' : 'Create Everything account'}</span><ArrowRight className="w-4 h-4"/></button>
      </form>
      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500">Already have an account? <button onClick={()=>navigate('/login')} className="font-bold text-violet-700 hover:underline">Sign in</button></div>
    </div>
  </div>;
};
