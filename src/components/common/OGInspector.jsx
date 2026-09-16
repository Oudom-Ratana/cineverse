import React, { useState } from 'react';
import { Eye, X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleOGInspector } from '../../redux/slices/uiSlice';

export default function OGInspector({ customMeta }) {
  const isOpen = useSelector((state) => state.ui.ogInspectorOpen);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('facebook');
  const [copied, setCopied] = useState(false);

  // Read current document tags or fallback
  const title = customMeta?.title || document.title || 'Ciniverse | Cinema Ticketing & Streaming';
  const description =
    customMeta?.description ||
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    'Experience Ciniverse: Book cinema seats in real-time with friends and stream unlimited blockbusters.';
  const image =
    customMeta?.image ||
    document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=80';
  const url = customMeta?.url || window.location.href;

  const rawTags = `<!-- Open Graph & Social Preview Tags -->
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:site_name" content="Ciniverse" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => dispatch(toggleOGInspector())}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-2xl backdrop-blur text-xs font-medium transition hover:scale-105"
        title="Open Graph SEO Inspector"
      >
        <Share2 className="w-3.5 h-3.5 text-rose-500" />
        <span>OG Preview</span>
      </button>

      {/* Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="font-display font-bold text-lg text-white">Open Graph & Social Inspector</h3>
              </div>
              <button
                onClick={() => dispatch(toggleOGInspector())}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 my-4 bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              {['facebook', 'twitter', 'discord', 'raw'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition ${
                    activeTab === tab
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'raw' ? 'HTML Tags' : tab}
                </button>
              ))}
            </div>

            {/* Live Preview Panes */}
            <div className="mt-4">
              {activeTab === 'facebook' && (
                <div className="bg-[#18191a] border border-[#3a3b3c] rounded-lg overflow-hidden shadow-lg">
                  <img src={image} alt="OG Preview" className="w-full h-48 object-cover" />
                  <div className="p-3 bg-[#242526]">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Ciniverse.app</div>
                    <div className="font-bold text-sm text-slate-100 line-clamp-1 mt-0.5">{title}</div>
                    <div className="text-xs text-slate-400 line-clamp-2 mt-1">{description}</div>
                  </div>
                </div>
              )}

              {activeTab === 'twitter' && (
                <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <img src={image} alt="OG Preview" className="w-full h-48 object-cover" />
                  <div className="p-3 bg-dark-900 border-t border-slate-800">
                    <div className="text-xs text-slate-500">Ciniverse.app</div>
                    <div className="font-bold text-sm text-white line-clamp-1 mt-0.5">{title}</div>
                    <div className="text-xs text-slate-400 line-clamp-2 mt-1">{description}</div>
                  </div>
                </div>
              )}

              {activeTab === 'discord' && (
                <div className="bg-[#2f3136] border-l-4 border-rose-500 rounded-r-lg p-3 max-w-md shadow-lg">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">Ciniverse</div>
                  <div className="text-sm font-bold text-[#00aff4] hover:underline cursor-pointer line-clamp-1">
                    {title}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 line-clamp-3">{description}</div>
                  <img src={image} alt="OG Preview" className="w-full h-40 object-cover rounded-md mt-2" />
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="relative">
                  <pre className="bg-dark-950 p-3.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800 overflow-x-auto">
                    {rawTags}
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center">
              All social crawlers (Google, Facebook, Twitter, Discord, Slack) will render this card preview when sharing Ciniverse links.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
