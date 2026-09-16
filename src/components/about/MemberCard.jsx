
import { Send, Mail } from 'lucide-react';

export default function MemberCard({ member }) {
  const { name, role, image, telegram, github, portfolio, email } = member;

  return (
    <div className="relative group p-6 pt-7 pb-6 rounded-[24px] bg-[#EFEFEF] dark:bg-[#1A1F25]/40 border border-neutral-200/80 dark:border-white/20 shadow-sm dark:shadow-2xl flex flex-col items-center text-center justify-between min-h-[380px] w-full max-w-[240px] mx-auto transition-colors duration-300 font-sans">
      
      {/* Red Outer Frame with Gap between Dots */}
      <div className="absolute inset-3.5 pointer-events-none">
        {/* Continuous Border Box with Gap in Center Top */}
        <div 
          className="absolute inset-0 rounded-[18px] border-2 border-[var(--primary-red)]"
          style={{
            clipPath: 'polygon(0 0, 28% 0, 28% 12px, 72% 12px, 72% 0, 100% 0, 100% 100%, 0 100%)'
          }}
        />

        {/* Left Red Dot */}
        <span className="absolute -top-[5px] left-[28%] -translate-x-1/2 h-3 w-3 rounded-full bg-[var(--primary-red)]" />

        {/* Right Red Dot */}
        <span className="absolute -top-[5px] left-[72%] -translate-x-1/2 h-3 w-3 rounded-full bg-[var(--primary-red)]" />
      </div>

      {/* Profile Image */}
      <div className="relative z-10 w-36 h-36 mt-1 rounded-full overflow-hidden bg-white dark:bg-neutral-800 shadow-sm shrink-0 border border-neutral-200 dark:border-transparent">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Name and Role Badge */}
      <div className="relative z-10 flex flex-col items-center gap-2 my-auto">
        {/* Name with crisp dark contrast in Light Mode */}
        <h3 className="text-h4 font-bold text-neutral-900 dark:text-white tracking-tight leading-tight px-1">
          {name}
        </h3>

        {/* Role Pill Badge matching red tag accent from image */}
        <span className="px-6 py-1 rounded-full text-white font-bold text-[12px] uppercase tracking-wider bg-[var(--primary-red)] shadow-xs">
          {role || "Frontend"}
        </span>
      </div>

      {/* Social Icons Container */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 mb-1">
        {/* Telegram */}
        <a
          href={telegram || '#'}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-full bg-white dark:bg-white/10 text-[var(--primary-red)] dark:text-white hover:bg-[var(--primary-red)] dark:hover:bg-[var(--primary-red)] hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-neutral-200 dark:border-transparent shadow-xs"
          aria-label={`${name}'s Telegram`}
        >
          <Send className="w-4 h-4 -ml-0.5" />
        </a>

        {/* GitHub */}
        <a
          href={github || '#'}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-full bg-white dark:bg-white/10 text-[var(--primary-red)] dark:text-white hover:bg-[var(--primary-red)] dark:hover:bg-[var(--primary-red)] hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-neutral-200 dark:border-transparent shadow-xs"
          aria-label={`${name}'s GitHub`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>

        {/* Email */}
        <a
          href={email ? `mailto:${email}` : (portfolio || '#')}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-full bg-white dark:bg-white/10 text-[var(--primary-red)] dark:text-white hover:bg-[var(--primary-red)] dark:hover:bg-[var(--primary-red)] hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-neutral-200 dark:border-transparent shadow-xs"
          aria-label={`${name}'s Email`}
        >
          <Mail className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
