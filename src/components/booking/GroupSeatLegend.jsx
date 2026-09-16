import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/slices/uiSlice";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import { useAuth } from "../../context/AuthContext";
import { Users, Info, Plus, Share2 } from "lucide-react";

const getFallbackSvg = (initials, bg) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodeURIComponent(bg)}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="36" fill="%23ffffff">${initials}</text></svg>`;

export default function GroupSeatLegend({
  mySeats = [],
  members = [],
  selectedSeatsMap = {},
  onInviteClick,
}) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const reduxUser = useSelector(selectCurrentUser);
  const { user: authUser } = useAuth();
  const user = reduxUser || authUser;

  // Real logged-in user profile details
  const myName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "You";
  const myAvatar = user?.avatar || user?.photoURL || null;
  const myInitials = (myName || "U").slice(0, 2).toUpperCase();
  const myColor = "#FFD700"; // Gold ring for current user

  // Friends connected to this group session in Firestore
  const myUid = String(user?.uid || user?.id || "host");
  const friends = Array.isArray(members)
    ? members.filter((m) => String(m.uid) !== myUid)
    : [];

  const mySeatLabel = mySeats.length > 0 ? mySeats.join(", ") : "Select a seat";

  // Glassmorphic design tokens
  const glassCardStyle = {
    backgroundColor: isDark
      ? "var(--primary-color-30)"
      : "var(--primary-color-5)",
    borderColor: isDark
      ? "var(--border-dark-mode)"
      : "var(--border-light-mode)",
  };

  return (
    <div className="w-full space-y-3 pt-2 select-none font-sans">
      {/* 2-Card Layout matching Figma */}
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {/* ── Left Card: Legend + Your Seat / Friends Seat ── */}
        <div
          className="flex-1 rounded-2xl sm:rounded-3xl border p-5 sm:p-6 space-y-4 shadow-sm backdrop-blur-md transition-all"
          style={glassCardStyle}
        >
          {/* Row 1: AVAILABLE / SELECTED / RESERVED Status Dots */}
          <div className="flex items-center justify-around text-xs sm:text-sm font-black tracking-wider">
            {/* Available */}
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <span className="w-4 h-4 rounded-full bg-[#B5B0B0] shadow-xs" />
              <span className="uppercase">AVAILABLE</span>
            </div>

            {/* Selected */}
            <div className="flex items-center gap-2 text-[#EAB308]">
              <span className="w-4 h-4 rounded-full bg-[#FFD700] shadow-xs" />
              <span className="uppercase">SELECTED</span>
            </div>

            {/* Reserved */}
            <div className="flex items-center gap-2 text-[#B90101]">
              <span className="w-4 h-4 rounded-full bg-[#B90101] shadow-xs" />
              <span className="uppercase">RESERVED</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-300/60 dark:border-white/15 my-2" />

          {/* Row 2: YOUR SEAT / FRIENDS SEAT */}
          <div className="flex items-center justify-around pt-1">
            {/* YOUR SEAT */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-md transition-transform hover:scale-105 bg-neutral-800"
                style={{ borderColor: myColor }}
              >
                <img
                  src={myAvatar || getFallbackSvg(myInitials, "#EAB308")}
                  alt={myName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getFallbackSvg(myInitials, "#EAB308");
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                YOUR SEAT
              </span>
            </div>

            {/* FRIENDS SEAT */}
            <div className="flex flex-col items-center gap-2">
              {friends.length > 0 ? (
                <div className="flex items-center -space-x-2.5">
                  {friends.slice(0, 3).map((friend, idx) => {
                    const friendInitials = (friend.name || "F")
                      .slice(0, 2)
                      .toUpperCase();
                    const friendColor = friend.color || "#3B82F6";
                    return (
                      <div
                        key={friend.uid || idx}
                        className="w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-md relative bg-neutral-800 transition-transform hover:scale-105"
                        style={{
                          borderColor: friendColor,
                          zIndex: 10 - idx,
                        }}
                      >
                        <img
                          src={
                            friend.avatar ||
                            getFallbackSvg(friendInitials, friendColor)
                          }
                          alt={friend.name || "Friend"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackSvg(
                              friendInitials,
                              friendColor,
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onInviteClick}
                  className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-400 dark:border-white/30 flex items-center justify-center text-neutral-400 hover:text-[#B90101] hover:border-[#B90101] dark:hover:text-[#B90101] dark:hover:border-[#B90101] transition hover:scale-105 active:scale-95 cursor-pointer"
                  title="Invite friends to join"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                {friends.length > 0
                  ? `FRIENDS SEAT (${friends.length})`
                  : "FRIENDS SEAT"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Card: LIVE PRESENCE ── */}
        <div
          className="w-full md:w-72 rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm backdrop-blur-md flex flex-col justify-between"
          style={glassCardStyle}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-[#B90101] uppercase tracking-wider">
                  LIVE PRESENCE
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[11px] font-bold text-neutral-500">
                {1 + friends.length} Online
              </span>
            </div>

            <div className="space-y-3">
              {/* You (Host / Current User) */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] shadow-sm shrink-0 bg-neutral-800"
                  style={{ borderColor: myColor }}
                >
                  <img
                    src={myAvatar || getFallbackSvg(myInitials, "#EAB308")}
                    alt={myName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvg(
                        myInitials,
                        "#EAB308",
                      );
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {myName} (You)
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    Seat {mySeatLabel}
                  </p>
                </div>
              </div>

              {/* Real Friends Connected in Session */}
              {friends.map((friend, idx) => {
                const friendInitials = (friend.name || "F")
                  .slice(0, 2)
                  .toUpperCase();
                const friendColor = friend.color || "#3B82F6";

                // Find seats taken by this friend
                const friendSeats = Object.entries(selectedSeatsMap)
                  .filter(
                    ([_, data]) => String(data?.uid) === String(friend.uid),
                  )
                  .map(([seatId]) => seatId);

                const friendSeatLabel =
                  friendSeats.length > 0
                    ? friendSeats.join(", ")
                    : "Choosing seat...";

                return (
                  <div
                    key={friend.uid || idx}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border-[2.5px] shadow-sm shrink-0 bg-neutral-800"
                      style={{ borderColor: friendColor }}
                    >
                      <img
                        src={
                          friend.avatar ||
                          getFallbackSvg(friendInitials, friendColor)
                        }
                        alt={friend.name || "Friend"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackSvg(
                            friendInitials,
                            friendColor,
                          );
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {friend.name || "Friend"}
                      </p>
                      <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                        Seat {friendSeatLabel}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Empty state if no friends have joined yet */}
              {friends.length === 0 && (
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 text-center space-y-2">
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    No friends joined yet. Share your invite link to pick seats
                    together!
                  </p>
                  <button
                    type="button"
                    onClick={onInviteClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B90101] hover:brightness-110 text-white text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Invite Friends</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group Booking Live Helper Pill */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs text-neutral-700 dark:text-neutral-300 backdrop-blur-md"
        style={glassCardStyle}
      >
        <Info className="w-4 h-4 text-[#B90101] shrink-0" />
        <p className="leading-snug">
          <strong className="text-neutral-900 dark:text-white">
            Group Booking:
          </strong>{" "}
          Pick your seats together in real time. Each member selects and pays
          for their own seat individually.
        </p>
      </div>
    </div>
  );
}
