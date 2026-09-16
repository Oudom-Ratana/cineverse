import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Building,
  Save,
  X,
  Tv,
  Film,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  listenAdminBranches,
  saveAdminBranch,
  deleteAdminBranch,
} from "../../services/firestoreService";
import { BRANCH_SHOWTIMES } from "../../data/cinemaShowtimeData";

export default function AdminCinemaBranchPage() {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    branchName: "",
    location: "",
    halls: [
      {
        id: "h1",
        hallName: "Regular Hall",
        screenType: "2D",
        goldClass: false,
        audio: "EN",
        subtitle: "KH",
        times: ["10:00 AM", "01:30 PM", "04:30 PM", "07:30 PM"],
      },
      {
        id: "h2",
        hallName: "Gold Class VIP",
        screenType: "GOLD",
        goldClass: true,
        audio: "EN",
        subtitle: "KH",
        times: ["11:00 AM", "03:00 PM", "08:00 PM"],
      },
    ],
  });

  useEffect(() => {
    const unsub = listenAdminBranches(BRANCH_SHOWTIMES, (list) => {
      setBranches(list || []);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      id: `branch_${Date.now()}`,
      branchName: "",
      location: "",
      halls: [
        {
          id: "h1",
          hallName: "Regular Hall",
          screenType: "2D",
          goldClass: false,
          audio: "EN",
          subtitle: "KH",
          times: ["10:00 AM", "01:30 PM", "04:30 PM", "07:30 PM"],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({ ...branch });
    setIsModalOpen(true);
  };

  const handleDelete = async (branchId, name) => {
    if (window.confirm(`Delete cinema branch "${name}"?`)) {
      try {
        await deleteAdminBranch(branchId);
        toast.success(`Branch ${name} removed`);
      } catch (e) {
        toast.error("Failed to delete branch");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.branchName.trim()) {
      toast.error("Please enter a cinema branch name");
      return;
    }

    try {
      await saveAdminBranch({
        ...formData,
        location: formData.location || formData.branchName,
      });
      toast.success(editingBranch ? "Branch updated in Firestore" : "New Cinema Branch added to Firestore");
      setIsModalOpen(false);
    } catch (e) {
      toast.error("Failed to save branch");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="relative inline-block pb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#B90101] tracking-tight">
              Cinema Branches & Theaters
            </h1>
            <div className="absolute bottom-0 left-0 w-32 h-0.5 bg-[#B90101] rounded-full" />
          </div>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            Manage cinema venues, auditorium formats, and location schedules synced with Firestore.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B90101] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cinema Branch</span>
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-[#B90101]/10 text-[#B90101]">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 leading-tight">
                      {b.branchName}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#B90101]" />
                      <span>{b.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Halls Summary */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Auditoriums ({b.halls?.length || 0} Halls)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(b.halls || []).map((h, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                        h.goldClass
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-neutral-100 text-neutral-800 border-neutral-200"
                      }`}
                    >
                      {h.screenType}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => handleOpenEdit(b)}
                className="p-2 rounded-full bg-neutral-100 hover:bg-[#B90101] hover:text-white text-neutral-600 transition"
                title="Edit Branch"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b.id, b.branchName)}
                className="p-2 rounded-full bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 transition"
                title="Delete Branch"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-extrabold text-lg text-neutral-900">
                {editingBranch ? "Edit Cinema Branch" : "Add Cinema Branch"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciniverse SenSok Mall"
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#B90101] text-neutral-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sen Sok, Phnom Penh"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#B90101] text-neutral-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#B90101] hover:brightness-110 text-white font-extrabold shadow-md transition active:scale-95"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
