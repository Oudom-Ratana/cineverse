import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Minus, Popcorn, Sparkles } from 'lucide-react';
import { addItem, removeItem } from '../../redux/slices/concessionsSlice';
import { CONCESSIONS_CATALOG } from '../../utils/cinemaData';
import { formatCurrency } from '../../utils/formatters';
import { listenAdminConcessions } from '../../services/firestoreService';

export default function ConcessionsSelector() {
  const dispatch = useDispatch();
  const selectedItems = useSelector((state) => state.concessions.selectedItems);
  const [catalog, setCatalog] = useState(CONCESSIONS_CATALOG);

  // Listen to dynamic concessions menu from Firestore
  useEffect(() => {
    const unsub = listenAdminConcessions(CONCESSIONS_CATALOG, (list) => {
      if (list && list.length > 0) setCatalog(list);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const totalConcessionsCost = Object.values(selectedItems).reduce(
    (sum, entry) => sum + entry.price * entry.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Popcorn className="w-5 h-5 text-amber-400" />
            Cinema Concessions & Treats
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enhance your movie experience with snacks & fountain drinks delivered to your seat.
          </p>
        </div>

        {totalConcessionsCost > 0 && (
          <div className="text-right">
            <span className="text-xs text-slate-400">Concessions Total:</span>
            <span className="text-lg font-bold text-emerald-400 ml-2">
              {formatCurrency(totalConcessionsCost)}
            </span>
          </div>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalog.map((item) => {
          const quantity = selectedItems[item.id]?.quantity || 0;

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between bg-dark-900 border rounded-2xl p-4 transition-all ${
                quantity > 0
                  ? 'border-rose-500/80 ring-1 ring-rose-500/40 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  {item.badge && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold mb-1">
                      {item.badge}
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">{item.size}</span>
                <div className="flex items-center gap-2">
                  {quantity > 0 ? (
                    <>
                      <button
                        onClick={() => dispatch(removeItem(item.id))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => dispatch(addItem(item))}
                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => dispatch(addItem(item))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
