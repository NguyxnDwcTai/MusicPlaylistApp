import React, { useState } from 'react';
import { SpinnerGap, PaperPlaneTilt, CheckCircle, Warning } from '@phosphor-icons/react';

export default function BetaSubscribe() {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
      setMessage(data.message);
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Connection timeout. Try again.');
    }
  };

  return (
    <section id="join" className="w-full max-w-lg mx-auto py-16 px-4">
      <div className="bg-paper-2 border border-rule rounded-lg p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="font-display font-semibold text-[18px] text-ink">
            Join the Nocturne Inner Circle
          </h3>
          <p className="text-[13px] text-neutral leading-relaxed">
            Beta keys are released in small nocturnal batches. Request access to join our curation circle.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-emerald-400">
            <CheckCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[13px] font-semibold">Request Received</h4>
              <p className="text-[12px] text-emerald-400/90 leading-relaxed">{message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input block (Label ABOVE, helper text inside/below) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="beta-email" className="text-[11px] font-mono tracking-wider text-neutral uppercase">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="beta-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle'); // Clear error on change
                  }}
                  disabled={status === 'loading'}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-4 py-2.5 bg-paper/50 border border-rule hover:border-neutral/30 focus:border-accent rounded text-[13px] text-ink placeholder:text-muted/60 transition-colors disabled:opacity-50"
                />
              </div>
              
              {/* Optional Helper text */}
              <span className="text-[10.5px] text-muted leading-none mt-0.5">
                We only send beta keys. No newsletters or tracking.
              </span>
            </div>

            {/* Error display (Error text BELOW input) */}
            {status === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded flex items-center gap-2 text-rose-400 text-[12px]">
                <Warning size={16} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button (Text fits on 1 line, no duplicate intent) */}
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-rule disabled:opacity-40 text-paper font-semibold text-[13px] rounded tracking-wide transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === 'loading' ? (
                <>
                  <SpinnerGap size={16} className="animate-spin" />
                  <span>Requesting Access...</span>
                </>
              ) : (
                <>
                  <PaperPlaneTilt size={16} />
                  <span>Request Invite</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
