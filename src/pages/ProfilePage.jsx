import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Heart,
  Ticket,
  Star,
  CheckCircle2,
  LogOut,
  Trash2,
  Camera,
  Calendar,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  updateUser,
  logout,
} from "../redux/slices/authSlice";
import { selectFavouriteMovies } from "../redux/slices/favouriteSlice";
import { selectAllTickets } from "../redux/slices/ticketSlice";
import {
  updateStoredUser,
  deleteStoredUser,
} from "../services/mockAuthService";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const favouriteMovies = useSelector(selectFavouriteMovies) || [];
  const allTickets = useSelector(selectAllTickets) || [];

  // Fallback defaults if user is not fully populated
  const defaultUser = {
    id: "user_demo_1",
    name: "Peter Parker",
    email: "peterparker@gmail.com",
    avatar: null,
    dob: "10-10-2001",
    phone: "012 345 678",
    createdAt: "2026-01-01T00:00:00.000Z",
    points: 168,
  };

  const activeUser = user || defaultUser;

  // Form states
  const [userName, setUserName] = useState(activeUser.name || "Peter Parker");
  const [dob, setDob] = useState(activeUser.dob || "10-10-2001");
  const [phone, setPhone] = useState(activeUser.phone || "012 345 678");

  // Editable toggles
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      setDob(user.dob || "10-10-2001");
      setPhone(user.phone || "012 345 678");
    }
  }, [user]);

  // Points & Counts calculation
  const memberYear = activeUser.createdAt
    ? new Date(activeUser.createdAt).getFullYear()
    : "2026";
  const userPoints = activeUser.points || 168;
  const favCount = favouriteMovies.length > 0 ? favouriteMovies.length : 6;
  const bookedCount = allTickets.length > 0 ? allTickets.length : 7;
  const earnedPoints = Math.round(userPoints / 20) || 8;

  // Booking history items (derived from real tickets or standard demo tickets matching Figma)
  const displayBookings =
    allTickets.length > 0
      ? allTickets.slice(0, 3).map((ticket) => ({
          id: ticket.id,
          title:
            ticket.movieTitle || ticket.title || "Spider-Man : No Way Home",
          date: ticket.showtimeDate || ticket.date || "Jul 13, 2026",
        }))
      : [
          { id: "1", title: "Spider-Man : No Way Home", date: "Jul 13, 2026" },
          { id: "2", title: "Spider-Man : No Way Home", date: "Jul 13, 2026" },
          { id: "3", title: "Spider-Man : No Way Home", date: "Jul 13, 2026" },
        ];

  const handleSaveChange = (e) => {
    e?.preventDefault();
    if (!userName.trim()) {
      toast.error("User name cannot be empty");
      return;
    }

    setIsSaving(true);
    const updatedData = {
      name: userName.trim(),
      dob: dob.trim(),
      phone: phone.trim(),
    };

    // Update in Redux
    dispatch(updateUser(updatedData));

    // Update in mock localStorage storage
    if (activeUser?.id) {
      updateStoredUser(activeUser.id, updatedData);
    }

    setIsEditingDob(false);
    setIsEditingPhone(false);
    setIsSaving(false);

    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (activeUser?.id) {
      deleteStoredUser(activeUser.id);
    }
    dispatch(logout());
    toast.warn("Account deleted successfully");
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-sans">
      {/* 1. Page Header: Profile | Information */}
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span className="text-[#B90101] dark:text-white">Profile</span>
          <span className="text-[#B90101] mx-3 sm:mx-4 font-normal">|</span>
          <span className="text-[#B90101] dark:text-white">Information</span>
        </h1>
      </div>

      {/* 2. Main Profile Card */}
      <div className="relative rounded-[32px] border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#1A1F25]/40 backdrop-blur-xl shadow-xl overflow-hidden p-6 sm:p-10 mb-8 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Avatar, Name, Email, Points, Logout */}
          <div className="lg:col-span-4 flex flex-col items-center text-center relative">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-4 border-white dark:border-neutral-700 shadow-md">
                {activeUser.avatar ? (
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-neutral-400 dark:text-neutral-500" />
                )}
              </div>
            </div>

            {/* User Name */}
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-4 tracking-tight">
              {activeUser.name || "Peter Parker"}
            </h2>

            {/* Email with Verified Badge */}
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              <span>{activeUser.email || "peterparker@gmail.com"}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B90101] shrink-0" />
            </div>

            {/* Member since */}
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mt-2">
              Member since {memberYear}
            </p>

            {/* Points Badge */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-500 dark:text-amber-400 mt-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{userPoints} Point</span>
            </div>

            {/* Left Column Bottom Action Buttons */}
            <div className="flex items-center gap-4 mt-8 pt-4 w-full justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs sm:text-sm font-bold text-[#B90101] hover:underline transition cursor-pointer"
              >
                Delete Account
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs sm:text-sm font-bold text-[#B90101] hover:underline transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Vertical Divider in Desktop View */}
          <div className="hidden lg:block absolute left-[36%] top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-[#B90101]/40 to-transparent" />

          {/* Right Column: Editable Profile Fields */}
          <div className="lg:col-span-8 lg:pl-6">
            <form onSubmit={handleSaveChange} className="space-y-5">
              {/* Field 1: User Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-5 py-3 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1A1F25]/60 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#B90101] transition shadow-inner"
                />
              </div>

              {/* Field 2: Date of Birth */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Date of Birth{" "}
                  <span className="text-[#B90101] font-semibold">
                    (Optional)
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={!isEditingDob}
                    placeholder="DD-MM-YYYY"
                    className={`w-full px-5 pr-24 py-3 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#1A1F25]/60 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#B90101] transition shadow-inner ${
                      !isEditingDob
                        ? "opacity-90 select-none cursor-default"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingDob((prev) => !prev)}
                    className="absolute right-4 text-xs sm:text-sm font-bold text-[#B90101] hover:underline cursor-pointer"
                  >
                    {isEditingDob ? "Done" : "Change"}
                  </button>
                </div>
              </div>

              {/* Field 3: Phone Number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number{" "}
                  <span className="text-[#B90101] font-semibold">
                    (Optional)
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditingPhone}
                    placeholder="012 345 678"
                    className={`w-full px-5 pr-24 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1A1F25]/60 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#B90101] transition shadow-inner ${
                      !isEditingPhone
                        ? "opacity-90 select-none cursor-default"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone((prev) => !prev)}
                    className="absolute right-4 text-xs sm:text-sm font-bold text-[#B90101] hover:underline cursor-pointer"
                  >
                    {isEditingPhone ? "Done" : "Change"}
                  </button>
                </div>
              </div>

              {/* Save Change Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-full border border-[#B90101] text-xs sm:text-sm font-bold text-[#B90101] hover:bg-[#B90101] hover:text-white transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: My Activity & Booking History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        {/* Card 1: My Activity (md:col-span-5) */}
        <div className="md:col-span-5 rounded-[28px] border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#1A1F25]/40 backdrop-blur-xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              My Activity
            </h3>
            {/* Red Underline Indicator */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[#B90101] via-[#B90101]/40 to-transparent mt-3 mb-6" />

            {/* 3 Columns Stats */}
            <div className="flex items-center justify-around py-4">
              {/* Column 1: Favourite */}
              <Link
                to="/favourite"
                className="flex flex-col items-center group cursor-pointer"
              >
                <Heart className="w-5 h-5 text-[#B90101] group-hover:scale-110 transition-transform" />
                <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1.5">
                  {favCount}
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Favourite
                </span>
              </Link>

              {/* Vertical Divider */}
              <div className="w-px h-10 bg-neutral-200 dark:border-white/10" />

              {/* Column 2: Ticket Booked */}
              <Link
                to="/my-tickets"
                className="flex flex-col items-center group cursor-pointer"
              >
                <Ticket className="w-5 h-5 text-[#B90101] group-hover:scale-110 transition-transform" />
                <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1.5">
                  {bookedCount}
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Ticket Booked
                </span>
              </Link>

              {/* Vertical Divider */}
              <div className="w-px h-10 bg-neutral-200 dark:border-white/10" />

              {/* Column 3: Point Earned */}
              <div className="flex flex-col items-center">
                <Star className="w-5 h-5 text-[#B90101] fill-[#B90101]" />
                <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1.5">
                  {earnedPoints}
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Point Earned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Booking History (md:col-span-7) */}
        <div className="md:col-span-7 rounded-[28px] border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-[#1A1F25]/40 backdrop-blur-xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                Booking History
              </h3>
              <Link
                to="/my-tickets"
                className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#B90101] transition"
              >
                VIEW ALL
              </Link>
            </div>

            {/* Red Underline Indicator */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[#B90101] via-[#B90101]/40 to-transparent mt-3 mb-4" />

            {/* Bookings List */}
            <div className="space-y-2.5">
              {displayBookings.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20 hover:border-[#B90101]/40 transition"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {item.date}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#B90101] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Delete Account?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Are you sure you want to delete your account? All your profile
              information and data will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-full bg-[#B90101] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
