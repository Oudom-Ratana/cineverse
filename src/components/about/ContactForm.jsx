
import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!formData.agree) {
      toast.warning('Please accept the data processing terms.');
      return;
    }

    toast.success('Thank you! Your message has been sent to our cinema team.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      agree: false,
    });
  };

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-[#EFEFEF] dark:bg-[#1A1F25]/40 border border-neutral-200/80 dark:border-white/20 shadow-sm dark:shadow-2xl space-y-8 font-sans transition-colors duration-300">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          Send Us a Message
        </h3>
        <p className="text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.7)] mt-2">
          Our support team will respond as soon as possible
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Full Name <span className="text-[var(--primary-red)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-5 py-3.5 bg-white dark:bg-transparent border border-neutral-300 dark:border-white/20 rounded-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:border-[var(--primary-red)] dark:focus:border-[var(--primary-red)] transition-colors shadow-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Email Address <span className="text-[var(--primary-red)]">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-5 py-3.5 bg-white dark:bg-transparent border border-neutral-300 dark:border-white/20 rounded-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:border-[var(--primary-red)] dark:focus:border-[var(--primary-red)] transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Phone & Subject Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-5 py-3.5 bg-white dark:bg-transparent border border-neutral-300 dark:border-white/20 rounded-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:border-[var(--primary-red)] dark:focus:border-[var(--primary-red)] transition-colors shadow-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Select a subject"
              className="w-full px-5 py-3.5 bg-white dark:bg-transparent border border-neutral-300 dark:border-white/20 rounded-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:border-[var(--primary-red)] dark:focus:border-[var(--primary-red)] transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            Message <span className="text-[var(--primary-red)]">*</span>
          </label>
          <textarea
            name="message"
            required
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write any message here"
            className="w-full p-5 bg-white dark:bg-transparent border border-neutral-300 dark:border-white/20 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:border-[var(--primary-red)] dark:focus:border-[var(--primary-red)] resize-none transition-colors shadow-xs"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="agree"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="w-4 h-4 rounded bg-white dark:bg-transparent border-neutral-300 dark:border-white/30 accent-[var(--primary-red)] cursor-pointer"
          />
          <label
            htmlFor="agree"
            className="text-xs sm:text-sm text-neutral-600 dark:text-[rgba(255,255,255,0.8)] cursor-pointer select-none"
          >
            I agree that ISTAD AngkorCine may use my information to this request.
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-bold text-sm bg-[var(--primary-red)] hover:bg-[#8b0101] transition-colors cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </div>
      </form>
    </div>
  );
}
