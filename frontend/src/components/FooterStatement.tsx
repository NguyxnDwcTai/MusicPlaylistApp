export default function FooterStatement() {
  return (
    <footer className="w-full max-w-5xl mx-auto py-16 px-4 space-y-10 border-t border-rule/50">
      
      {/* Footer Statement Line */}
      <p className="font-display font-medium text-[26px] sm:text-[36px] md:text-[44px] leading-[1.05] tracking-tighter text-ink max-w-xl">
        The instrument is dark. The output is yours.
      </p>

      {/* Meta Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-rule text-[11px] text-neutral font-medium">
        <span 
          className="font-display font-bold text-[12px] tracking-wider uppercase text-ink cursor-pointer hover:text-accent transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Nocturne
        </span>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#privacy" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#terms" className="hover:text-ink transition-colors">Terms of Sound</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Source</a>
        </div>

        <span className="text-muted font-mono">
          © {new Date().getFullYear()} · MIT · After Hours
        </span>
      </div>

    </footer>
  );
}
