import React, { useState, useEffect } from 'react';
import { CONCESSIONS_CATALOG } from '../../utils/cinemaData';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Popcorn, Sparkles } from 'lucide-react';
import {
  listenAdminConcessions,
  addAdminConcession,
  deleteAdminConcession,
} from '../../services/firestoreService';

export default function ConcessionsTab() {
  const [items, setItems] = useState(CONCESSIONS_CATALOG);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Popcorn');
  const [size, setSize] = useState('Large');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const unsub = listenAdminConcessions(CONCESSIONS_CATALOG, (list) => {
      if (list && list.length > 0) setItems(list);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const newItem = {
      id: `conc_${Date.now()}`,
      name,
      category,
      size,
      price: parseFloat(price) || 8.00,
      image: image || 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80',
      description: description || 'Freshly made cinema concession treat.',
    };
    await addAdminConcession(newItem);
    setName('');
    setPrice('');
    setImage('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    await deleteAdminConcession(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add New Concession Form */}
      <form onSubmit={handleAddItem} className="p-6 rounded-3xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add New Concession / Snack to Menu (Live for Users)
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">Live Storefront Sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Truffle Popcorn"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Popcorn">Popcorn</option>
              <option value="Hot Snacks">Hot Snacks</option>
              <option value="Beverages">Beverages</option>
              <option value="Combos">Combos</option>
              <option value="Candy">Candy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Portion / Size</label>
            <input
              type="text"
              required
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. Large Tub"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.25"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 9.50"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Delicious theater-fresh treats..."
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Publish Item to Concessions Menu
        </button>
      </form>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-start justify-between gap-3"
          >
            <div className="flex gap-3 min-w-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {item.category} • {item.size}
                </span>
                <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
