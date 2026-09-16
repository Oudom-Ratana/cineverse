import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Building,
  Film,
  Sparkles,
  X,
  Volume2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  listenAdminBranches,
  saveAdminBranch,
} from "../../services/firestoreService";
import { BRANCH_SHOWTIMES } from "../../data/cinemaShowtimeData";

export default function AdminShowtimesPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [newTime, setNewTime] = useState("10:00 AM");
  const [targetHallId, setTargetHallId] = useState("");

  useEffect(() => {
    const unsub = listenAdminBranches(BRANCH_SHOWTIMES, (list) => {
      setBranches(list || []);
      if (list?.length > 0 && !selectedBranchId) {
        setSelectedBranchId(list[0].id);
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleAddTimeSlot = async (hallId) => {
    if (!newTime.trim() || !activeBranch) return;

    const updatedHalls = (activeBranch.halls || []).map((h) => {
      if (h.id === hallId) {
        const times = h.times || [];
        if (!times.includes(newTime)) {
          return { ...h, times: [...times, newTime] };
        }
      }
      return h;
    });

    const updatedBranch = { ...activeBranch, halls: updatedHalls };
    try {
      await saveAdminBranch(updatedBranch);
      toast.success(`Showtime slot "${newTime}" added to Firestore`);
      setIsSlotModalOpen(false);
      setNewTime("");
    } catch (e) {
      toast.error("Failed to add showtime");
    }
  };

  const handleRemoveTimeSlot = async (hallId, timeToRemove) => {
    if (!activeBranch) return;

    const updatedHalls = (activeBranch.halls || []).map((h) => {
      if (h.id === hallId) {
        return {
          ...h,
          times: (h.times || []).filter((t) => t !== timeToRemove),
        };
      }
      return h;
    });

    const updatedBranch = { ...activeBranch, halls: updatedHalls };
    try {
      await saveAdminBranch(updatedBranch);
      toast.success(`Slot "${timeToRemove}" removed from Firestore`);
    } catch (e) {
      toast.error("Failed to remove showtime");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="relative inline-block pb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#B90101] tracking-tight">
              Showtimes & Schedules
            </h1>
            <div className="absolute bottom-0 left-0 w-32 h-0.5 bg-[#B90101] rounded-full" />
          </div>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            Configure movie schedules, auditorium formats (2D, ScreenX, Gold Class VIP), and daily time slots.
          </p>
        </div>
      </div>

      {/* Branch Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBranchId(b.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              (activeBranch?.id || branches[0]?.id) === b.id
                ? "bg-[#B90101] text-white shadow-md"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {b.branchName}
          </button>
        ))}
      </div>

      {/* Active Branch Halls & Showtimes */}
      {activeBranch && (
        <div className="space-y-6">
          {(activeBranch.halls || []).map((hall) => (
            <div
              key={hall.id}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wider border ${
                      hall.goldClass
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-rose-50 text-[#B90101] border-red-200"
                    }`}
                  >
                    {hall.screenType}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 leading-tight">
                      {hall.hallName}
                    </h3>
                    <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                      Audio: {hall.audio || "EN"} • Subtitle: {hall.subtitle || "KH"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTargetHallId(hall.id);
                    setIsSlotModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B90101] hover:brightness-110 text-white font-extrabold text-xs shadow-xs transition active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time Slot</span>
                </button>
              </div>

              {/* Time Slots List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Active Daily Time Slots ({hall.times?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(hall.times || []).map((time, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 text-xs font-extrabold text-neutral-800 dark:text-neutral-200 shadow-xs group"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B90101]" />
                      <span>{time}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(hall.id, time)}
                        className="w-5 h-5 rounded-full hover:bg-red-500 hover:text-white text-neutral-400 transition flex items-center justify-center cursor-pointer ml-1"
                        title="Delete slot"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {(!hall.times || hall.times.length === 0) && (
                    <p className="text-xs text-neutral-400 italic">
                      No showtime slots added for this hall yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="font-extrabold text-base text-neutral-900">
                Add Showtime Slot
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 mb-1">Time (e.g. 02:45 PM)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 02:45 PM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#B90101] text-neutral-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTimeSlot(targetHallId)}
                  className="px-5 py-2 rounded-full bg-[#B90101] text-white font-extrabold shadow-sm hover:brightness-110 active:scale-95"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
