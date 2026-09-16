import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { selectTheme } from "../redux/slices/uiSlice";
import { selectAllTickets, setUserTickets } from "../redux/slices/ticketSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../redux/slices/authSlice";
import { listenUserBookings } from "../services/firestoreService";
import { TICKETS_PER_PAGE } from "../data/ticketData";
import TicketCard from "../components/tickets/TicketCard";
import ScrollReveal from "../components/common/ScrollReveal";

export default function MyTicketsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam === "history" ? "history" : "upcoming",
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect guest to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please log in to view your ticket history.");
      navigate("/login?redirect=/my-tickets");
    }
  }, [isAuthenticated, navigate]);

  // Sync tickets in real-time from Firestore specifically for the logged-in user
  useEffect(() => {
    if (!currentUser?.uid && !currentUser?.id) return;
    const uid = currentUser.uid || currentUser.id;
    const unsub = listenUserBookings(uid, (tickets) => {
      if (tickets && Array.isArray(tickets)) {
        dispatch(setUserTickets(tickets));
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (tabParam === "history" || tabParam === "upcoming") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const allTickets = useSelector(selectAllTickets);

  const filteredTickets = allTickets.filter((t) => {
    const status = (t.status || "upcoming").toLowerCase();
    if (activeTab === "history") {
      return (
        status === "history" ||
        status === "completed" ||
        status === "cancelled" ||
        status === "watched"
      );
    }
    // "Upcoming" tab shows upcoming, confirmed, or active tickets
    return (
      status === "upcoming" ||
      status === "confirmed" ||
      status === "active" ||
      status !== "history"
    );
  });
  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + TICKETS_PER_PAGE,
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when switching tabs
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams, { replace: true });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen font-sans pb-16 pt-6 transition-colors duration-300 ${isDark ? "" : "bg-[#F6F7F9]"}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Tab Switcher ── */}
        <ScrollReveal delay={0} duration={600} distance="translate-y-4">
          <div className="flex items-center justify-center gap-4 mb-10">
            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={`text-2xl sm:text-3xl font-black transition-colors duration-200 ${
                activeTab === "upcoming"
                  ? "text-[#B90101]"
                  : isDark
                    ? "text-neutral-500 hover:text-neutral-300"
                    : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Upcoming
            </button>

            {/* Divider */}
            <span
              className={`text-2xl sm:text-3xl font-light select-none ${isDark ? "text-neutral-600" : "text-neutral-300"}`}
            >
              |
            </span>

            <button
              type="button"
              onClick={() => handleTabChange("history")}
              className={`text-2xl sm:text-3xl font-black transition-colors duration-200 ${
                activeTab === "history"
                  ? "text-[#B90101]"
                  : isDark
                    ? "text-neutral-500 hover:text-neutral-300"
                    : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              History
            </button>
          </div>
        </ScrollReveal>

        {/* ── Ticket List ── */}
        <div className="space-y-4">
          {paginatedTickets.length === 0 ? (
            <ScrollReveal delay={100} duration={600} distance="translate-y-6">
              <div className="text-center py-20">
                <p
                  className={`text-lg font-semibold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                >
                  {activeTab === "upcoming"
                    ? "No upcoming tickets yet."
                    : "No ticket history yet."}
                </p>
                <p
                  className={`text-sm mt-1 ${isDark ? "text-neutral-600" : "text-neutral-400"}`}
                >
                  Book a movie to see your tickets here.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            paginatedTickets.map((ticket, index) => (
              <ScrollReveal
                key={ticket.id}
                delay={index * 80}
                duration={600}
                distance="translate-y-6"
              >
                <TicketCard ticket={ticket} />
              </ScrollReveal>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <ScrollReveal delay={200} duration={600} distance="translate-y-4">
            <div className="flex items-center justify-center gap-2 mt-10 select-none">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-full text-[14px] font-bold border transition hover:scale-105 active:scale-95 ${
                      page === currentPage
                        ? "bg-[#B90101] border-[#B90101] text-white shadow-md"
                        : isDark
                          ? "border-white/20 text-white hover:bg-white/10"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Info */}
            <p
              className={`text-center text-[13px] mt-3 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
            >
              Page {currentPage} of {totalPages} &nbsp;·&nbsp;{" "}
              {filteredTickets.length} tickets
            </p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
