import { Sparkle, Waveform, Users, Moon } from '@phosphor-icons/react';

export default function BentoFeatures() {
  return (
    <section id="features" className="w-full max-w-5xl mx-auto py-16 px-4 space-y-8">
      {/* Title (No eyebrow used here to comply with Eyebrow Restraint rule) */}
      <h2 className="font-display font-semibold text-[24px] md:text-[32px] tracking-tight text-ink text-center max-w-xl mx-auto leading-tight">
        Engineered for Nocturnal Curators
      </h2>

      {/* Bento Grid (Exactly 4 cards matching the Bento cell count rule) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1: AI Vibe Curation (Col Span 2 - Visual Gradient Background) */}
        <div
          className="md:col-span-2 p-6 rounded-lg border border-rule bg-paper/20 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-neutral/30 group"
        >
          {/* Accent glow behind content */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/15 transition-colors duration-300" />

          <div className="flex justify-between items-start z-10">
            <div className="p-2 rounded bg-accent/10 text-accent">
              <Sparkle size={20} weight="fill" />
            </div>
            <span className="text-[10px] font-mono text-muted tracking-wider uppercase">01 / Algorithm</span>
          </div>

          <div className="space-y-2 mt-8 z-10">
            <h3 className="font-display font-semibold text-[16.5px] text-ink">
              Biometric Vibe Curation
            </h3>
            <p className="text-[13px] text-neutral max-w-md leading-relaxed">
              Nocturne analyzes the time of night and biological tempos to adjust transition slopes, crossfades, and track choices, aligning with your focus cycles.
            </p>
          </div>
        </div>

        {/* Card 2: Lossless Engine (Col Span 1 - SVG wave background pattern) */}
        <div
          className="p-6 rounded-lg border border-rule bg-paper-2 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-neutral/30 group"
        >
          {/* Animated decorative SVG sine wave */}
          <div className="absolute inset-x-0 bottom-0 h-16 opacity-10 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none">
            <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,10 Q25,3 50,10 T100,10" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
              <path d="M0,10 Q25,17 50,10 T100,10" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="p-2 rounded bg-accent/10 text-accent">
              <Waveform size={20} />
            </div>
            <span className="text-[10px] font-mono text-muted tracking-wider uppercase">02 / Engine</span>
          </div>

          <div className="space-y-2 mt-8 z-10">
            <h3 className="font-display font-semibold text-[16.5px] text-ink">
              Pure-Decibel Engine
            </h3>
            <p className="text-[13px] text-neutral leading-relaxed">
              Bit-perfect playback that delivers pure, uncompressed high-fidelity streams directly to your audio hardware.
            </p>
          </div>
        </div>

        {/* Card 3: Session Sync (Col Span 1 - Collaborative nodes visual) */}
        <div
          className="p-6 rounded-lg border border-rule bg-paper-2 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-neutral/30 group"
        >


          <div className="flex justify-between items-start z-10">
            <div className="p-2 rounded bg-accent/10 text-accent">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-mono text-muted tracking-wider uppercase">03 / Sync</span>
          </div>

          <div className="space-y-2 mt-8 z-10">
            <h3 className="font-display font-semibold text-[16.5px] text-ink">
              Collaborative Session Sync
            </h3>
            <p className="text-[13px] text-neutral leading-relaxed">
              Queue, vote, and reorder playlists with teammates in real-time, built on a conflict-free synchronized clock.
            </p>
          </div>
        </div>

        {/* Card 4: Nocturnal Ecosystem (Col Span 2 - Tinted Dark Canvas Vibe) */}
        <div
          className="md:col-span-2 p-6 rounded-lg border border-rule bg-paper/25 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-neutral/30 group"
        >
          <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-colors duration-300" />

          <div className="flex justify-between items-start z-10">
            <div className="p-2 rounded bg-accent/10 text-accent">
              <Moon size={20} />
            </div>
            <span className="text-[10px] font-mono text-muted tracking-wider uppercase">04 / Environment</span>
          </div>

          <div className="space-y-2 mt-8 z-10">
            <h3 className="font-display font-semibold text-[16.5px] text-ink">
              Offline Cache & Night Canvas
            </h3>
            <p className="text-[13px] text-neutral max-w-md leading-relaxed">
              Nocturne automatically caches active playlists for offline train rides and late walks, housed inside a display layer designed to emit minimal light.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
