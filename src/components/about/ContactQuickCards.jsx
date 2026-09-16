
import { Ticket, CreditCard, QrCode, Info } from 'lucide-react';

export default function ContactQuickCards() {
  const cards = [
    {
      id: 'booking',
      title: 'Booking Support',
      desc: 'Need help with a booking or seat selection?',
      icon: Ticket,
    },
    {
      id: 'payment',
      title: 'Payment Support',
      desc: 'Questions about payment, discounts, or promo codes?',
      icon: CreditCard,
    },
    {
      id: 'qr',
      title: 'QR Ticket Help',
      desc: 'Cannot find or scan your digital ticket?',
      icon: QrCode,
    },
    {
      id: 'cinema',
      title: 'Cinema Information',
      desc: 'Need information about halls, showtimes, or locations?',
      icon: Info,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Grid Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="group p-6 rounded-3xl bg-[#EFEFEF] dark:bg-[#1A1F25]/40 hover:bg-white dark:hover:bg-[#1A1F25]/80 border border-neutral-200/80 dark:border-white/20 hover:border-[var(--primary-red)] dark:hover:border-[var(--primary-red)] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 min-h-[170px] shadow-xs dark:shadow-2xl"
            >
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-neutral-200 dark:border-transparent group-hover:bg-[var(--primary-red)] group-hover:border-[var(--primary-red)] flex items-center justify-center transition-colors shadow-xs">
                <Icon className="w-5 h-5 text-[var(--primary-red)] dark:text-white group-hover:text-white transition-colors" />
              </div>

              {/* Text Content */}
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1.5 group-hover:text-[var(--primary-red)] dark:group-hover:text-[var(--primary-red)] transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
