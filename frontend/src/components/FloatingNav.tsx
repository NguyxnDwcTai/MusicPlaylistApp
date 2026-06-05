interface FloatingNavProps {
  onCtaClick: () => void;
  onSectionScroll: (sectionId: string) => void;
}

export default function FloatingNav({ onCtaClick, onSectionScroll }: FloatingNavProps) {
  return (
    <nav 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-5 py-2.5 w-[calc(100%-2rem)] max-w-[580px] bg-paper/80 backdrop-blur-md border border-rule rounded-full shadow-lg shadow-black/30"
      aria-label="Primary"
    >
      <div 
        onClick={() => onSectionScroll('hero')}
        className="text-[14px] font-display font-semibold tracking-wider text-ink uppercase cursor-pointer hover:text-accent transition-colors duration-200"
      >
        Nocturne
      </div>
      
      <ul className="flex items-center gap-5 text-[13px] font-medium text-neutral">
        <li>
          <button 
            onClick={() => onSectionScroll('player')}
            className="hover:text-ink cursor-pointer transition-colors duration-200"
          >
            Player
          </button>
        </li>
        <li>
          <button 
            onClick={() => onSectionScroll('features')}
            className="hover:text-ink cursor-pointer transition-colors duration-200"
          >
            Features
          </button>
        </li>
        <li>
          <button 
            onClick={() => onSectionScroll('join')}
            className="hover:text-ink cursor-pointer transition-colors duration-200"
          >
            Beta
          </button>
        </li>
      </ul>
      
      <button 
        onClick={onCtaClick}
        className="px-4 py-1.5 text-[12px] font-semibold tracking-wide text-paper bg-accent hover:bg-accent-hover active:bg-accent-active border border-accent rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        Open Player
      </button>
    </nav>
  );
}
