import React, { useState, useEffect } from 'react';
import { HALLS } from '../../utils/cinemaData';
import { formatCurrency } from '../../utils/formatters';
import { Shield, Sparkles, Sliders, Check } from 'lucide-react';
import { listenAdminHalls, updateAdminHall } from '../../services/firestoreService';

export default function HallsTab() {
  const [halls, setHalls] = useState(HALLS);
  const [editingId, setEditingId] = useState(null);
  const [priceAdjust, setPriceAdjust] = useState({ basePrice: '', vipPrice: '' });

  useEffect(() => {
    const unsub = listenAdminHalls(HALLS, (list) => {
      if (list && list.length > 0) {
        setHalls(list);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleStartEdit = (hall) => {
    setEditingId(hall.id);
    setPriceAdjust({ basePrice: hall.basePrice, vipPrice: hall.vipPrice });
  };

  const handleSavePrice = async (id) => {
    const updates = {
      basePrice: parseFloat(priceAdjust.basePrice) || 16.00,
      vipPrice: parseFloat(priceAdjust.vipPrice) || 24.00,
    };
    await updateAdminHall(id, updates);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Auditoriums & Seating Architectures</h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage theater configurations, IMAX/Dolby/VIP hardware, and seating capacities. Dynamic updates affect booking seat maps live.
          </p>
        </div>
        <span className="text-xs text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          Live Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {halls.map((hall) => {
          const isEditing = editingId === hall.id;

          return (
            <div
              key={hall.id}
              className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                    {hall.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {hall.capacity} Seats
                  </span>
                </div>

                <h4 className="font-display font-bold text-base text-white mt-3">{hall.name}</h4>
                <p className="text-xs text-cyan-400 font-medium mt-1">{hall.screenType}</p>

                <div className="my-4 p-3 rounded-2xl bg-dark-950 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Rows:</span>
                    <span className="font-semibold text-slate-200">
                      {hall.rows.join(', ')} ({hall.totalRows} rows)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Seats Per Row:</span>
                    <span className="font-semibold text-slate-200">{hall.seatsPerRow} seats</span>
                  </div>
                  <div className="flex justify-between text-purple-400">
                    <span>VIP Rows:</span>
                    <span className="font-semibold">{hall.vipRows.join(', ')}</span>
                  </div>
                </div>

                {/* Price Adjustment */}
                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Base Price:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={priceAdjust.basePrice}
                        onChange={(e) => setPriceAdjust({ ...priceAdjust, basePrice: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-dark-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">VIP Price:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={priceAdjust.vipPrice}
                        onChange={(e) => setPriceAdjust({ ...priceAdjust, vipPrice: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-dark-950 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Base: </span>
                      <span className="font-bold text-white">{formatCurrency(hall.basePrice)}</span>
                    </div>
                    <div>
                      <span className="text-purple-400">VIP: </span>
                      <span className="font-bold text-purple-300">{formatCurrency(hall.vipPrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                {isEditing ? (
                  <button
                    onClick={() => handleSavePrice(hall.id)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Pricing & Sync
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(hall)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Adjust Rates
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
