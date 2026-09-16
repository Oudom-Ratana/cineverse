import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { listenGroupSession } from "../../services/firestoreService";
import SpidermanLoader from "../../components/common/SpidermanLoader";

export default function GroupBookingRedirect() {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!groupId) {
      navigate("/booking/seats?type=group", { replace: true });
      return;
    }

    let isRedirected = false;

    // Safety timeout in case session is empty or network is slow
    const fallbackTimer = setTimeout(() => {
      if (!isRedirected) {
        isRedirected = true;
        navigate(`/booking/seats?type=group&groupId=${groupId}`, {
          replace: true,
        });
      }
    }, 1200);

    const unsubscribe = listenGroupSession(groupId, (session) => {
      if (!isRedirected && session) {
        isRedirected = true;
        clearTimeout(fallbackTimer);
        const params = new URLSearchParams();
        params.set("movieId", session.movieId || session.movie?.id || "969681");
        params.set(
          "date",
          session.date || session.showtime?.date || "Aug 26 Tue",
        );
        params.set(
          "time",
          session.time || session.showtime?.time || "03:00 PM",
        );
        params.set("hall", session.hall || "standard");
        params.set("screenType", session.screenType || "2D");
        params.set("type", "group");
        params.set("groupId", groupId);
        navigate(`/booking/seats?${params.toString()}`, { replace: true });
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [groupId, navigate]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 select-none font-sans">
      <SpidermanLoader size="md" text="Entering Multiplayer Seat Room..." />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 font-semibold">
        Room Code: <span className="font-mono text-[#b90101]">{groupId}</span>
      </p>
    </div>
  );
}
