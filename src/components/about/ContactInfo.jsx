
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import mapImg from '../../assets/others/map.png';

export default function ContactInfo({ mapImage }) {
  // Replace this link with your actual Google Maps URL
  const googleMapsUrl = "https://maps.google.com/?q=ISTAD+Phnom+Penh";

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-[#EFEFEF] dark:bg-[#1A1F25]/40 border border-neutral-200/80 dark:border-white/20 shadow-sm dark:shadow-2xl space-y-8 flex flex-col justify-between font-sans transition-colors duration-300">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Contact Information
          </h3>
        </div>

        <div className="space-y-5">
          {/* Address */}
          <div className="flex items-start gap-3.5">
            <MapPin className="w-5 h-5 text-[var(--primary-red)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Address</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)]">
                Phnom Penh
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3.5">
            <Phone className="w-5 h-5 text-[var(--primary-red)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Phone</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)]">
                +855 12 44 55 66
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3.5">
            <Mail className="w-5 h-5 text-[var(--primary-red)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Email</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)]">
                angkorcine@gmail.com
              </p>
            </div>
          </div>

          {/* Working Hour */}
          <div className="flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-[var(--primary-red)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Working Hour</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)]">
                Daily, 7:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Clickable Map Image Container */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden border border-neutral-300 dark:border-white/20 shadow-xs aspect-[16/9] relative group cursor-pointer"
        >
          <img
            src={mapImage || mapImg}
            alt="ISTAD AngkorCine Location Map"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Subtle Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
            Open in Google Maps
          </div>
        </a>
      </div>

      <div className="border-t border-neutral-300/70 dark:border-white/20 pt-4">
        <p className="text-xs text-neutral-600 dark:text-[rgba(255,255,255,0.7)] text-center">
          For immediate assistance while at the cinema, please visit the ticket counter
        </p>
      </div>
    </div>
  );
}
