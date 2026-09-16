import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  isMockFirebase,
} from "./firebase";

// In-memory / localStorage fallback store for seamless dev & review
const LOCAL_STORAGE_PREFIX = "Ciniverse_mock_";

function getLocalData(key, defaultVal) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData(key, value) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
    // Trigger storage event for cross-tab or same-window listeners
    window.dispatchEvent(
      new CustomEvent("Ciniverse_storage_event", { detail: { key, value } }),
    );
  } catch (err) {
    console.error("LocalStorage write error:", err);
  }
}

/* -------------------------------------------------------------
   USER PROFILES
------------------------------------------------------------- */
export async function getUserProfile(uid) {
  if (!uid) return null;
  if (!isMockFirebase) {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) return { uid, ...snap.data() };
    } catch (e) {
      console.warn("Firestore getUserProfile failed, falling back:", e.message);
    }
  }

  const users = getLocalData("users", {});
  return users[uid] || null;
}

export async function updateUserProfile(uid, profileData) {
  if (!uid) return;
  const sanitized = {
    ...profileData,
    updatedAt: new Date().toISOString(),
  };

  if (!isMockFirebase) {
    try {
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (e) {
      console.warn("Firestore updateUserProfile error:", e.message);
    }
  }

  const users = getLocalData("users", {});
  users[uid] = { ...(users[uid] || {}), uid, ...sanitized };
  setLocalData("users", users);
  return users[uid];
}

/* -------------------------------------------------------------
   SEAT LOCKING (3-Minute Expiry Timer)
------------------------------------------------------------- */
export async function lockSeat({ showtimeId, seatId, userId, userName }) {
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes
  const lockData = {
    seatId,
    userId,
    userName,
    showtimeId,
    expiresAt,
    lockedAt: Date.now(),
  };

  if (!isMockFirebase) {
    try {
      const lockDocRef = doc(db, `seatLocks/${showtimeId}/seats`, seatId);
      await setDoc(lockDocRef, lockData);
    } catch (e) {
      console.warn("Firestore lockSeat error:", e.message);
    }
  }

  const allLocks = getLocalData(`locks_${showtimeId}`, {});
  allLocks[seatId] = lockData;
  setLocalData(`locks_${showtimeId}`, allLocks);
  return lockData;
}

export async function unlockSeat({ showtimeId, seatId, userId }) {
  if (!isMockFirebase) {
    try {
      const lockDocRef = doc(db, `seatLocks/${showtimeId}/seats`, seatId);
      await deleteDoc(lockDocRef);
    } catch (e) {
      console.warn("Firestore unlockSeat error:", e.message);
    }
  }

  const allLocks = getLocalData(`locks_${showtimeId}`, {});
  if (allLocks[seatId] && (!userId || allLocks[seatId].userId === userId)) {
    delete allLocks[seatId];
    setLocalData(`locks_${showtimeId}`, allLocks);
  }
}

export function listenSeatLocks(showtimeId, onUpdate) {
  if (!showtimeId) return () => {};

  if (!isMockFirebase) {
    try {
      const locksColRef = collection(db, `seatLocks/${showtimeId}/seats`);
      const unsubscribe = onSnapshot(locksColRef, (snapshot) => {
        const now = Date.now();
        const activeLocks = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.expiresAt > now) {
            activeLocks[docSnap.id] = data;
          }
        });
        onUpdate(activeLocks);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Firestore listenSeatLocks error:", e.message);
    }
  }

  // Fallback listener via storage events + interval clean-up
  const checkLocks = () => {
    const allLocks = getLocalData(`locks_${showtimeId}`, {});
    const now = Date.now();
    const active = {};
    let changed = false;

    Object.entries(allLocks).forEach(([id, data]) => {
      if (data.expiresAt > now) {
        active[id] = data;
      } else {
        changed = true;
      }
    });

    if (changed) setLocalData(`locks_${showtimeId}`, active);
    onUpdate(active);
  };

  checkLocks();
  const interval = setInterval(checkLocks, 3000);
  const handleStorageEvent = (e) => {
    if (e.detail?.key === `locks_${showtimeId}`) {
      checkLocks();
    }
  };
  window.addEventListener("Ciniverse_storage_event", handleStorageEvent);

  return () => {
    clearInterval(interval);
    window.removeEventListener("Ciniverse_storage_event", handleStorageEvent);
  };
}

/* -------------------------------------------------------------
   BOOKINGS & TICKETS
------------------------------------------------------------- */
export async function createBooking(bookingData) {
  const bookingId =
    bookingData.id ||
    bookingData.bookingId ||
    `FZ_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const completeBooking = {
    bookingId,
    id: bookingId,
    status: bookingData.status || "upcoming", // upcoming, history, completed
    createdAt: new Date().toISOString(),
    createdTimestamp: Date.now(),
    ...bookingData,
  };

  if (!isMockFirebase) {
    try {
      // 1. Root level bookings collection (for Admin dashboard & analytics)
      await setDoc(doc(db, "bookings", bookingId), completeBooking);

      if (bookingData.userId) {
        // 2. User specific tickets subcollection
        await setDoc(
          doc(db, "users", bookingData.userId, "tickets", bookingId),
          completeBooking,
        );
        // 3. User specific bookings history subcollection
        await setDoc(
          doc(db, "users", bookingData.userId, "bookings", bookingId),
          completeBooking,
        );
        // 4. Update user document with recent booking activity
        await setDoc(
          doc(db, "users", bookingData.userId),
          {
            lastBookingAt: new Date().toISOString(),
            lastBookingId: bookingId,
            lastMovieBooked: bookingData.movie?.title || "Movie Ticket",
          },
          { merge: true },
        );
      }
    } catch (e) {
      console.warn("Firestore createBooking error:", e.message);
    }
  }

  // Local sync
  const bookings = getLocalData("all_bookings", []);
  bookings.unshift(completeBooking);
  setLocalData("all_bookings", bookings);

  if (bookingData.userId) {
    const userTickets = getLocalData(`tickets_${bookingData.userId}`, []);
    const exists = userTickets.some(
      (t) => t.id === bookingId || t.bookingId === bookingId,
    );
    if (!exists) {
      userTickets.unshift(completeBooking);
      setLocalData(`tickets_${bookingData.userId}`, userTickets);
      setLocalData(`bookings_${bookingData.userId}`, userTickets);
    }
  }

  // Release temporary seat locks after confirmed booking
  if (bookingData.showtimeId && bookingData.seats) {
    bookingData.seats.forEach((s) => {
      unlockSeat({
        showtimeId: bookingData.showtimeId,
        seatId: s.id,
        userId: bookingData.userId,
      });
    });
  }

  return completeBooking;
}

export async function getUserBookings(uid) {
  if (!uid) return [];
  if (!isMockFirebase) {
    try {
      const ticketsRef = collection(db, "users", uid, "tickets");
      const snap = await getDocs(ticketsRef);
      const list = [];
      snap.forEach((d) => list.push(d.data()));
      if (list.length > 0)
        return list.sort(
          (a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0),
        );
    } catch (e) {
      console.warn("Firestore getUserBookings error:", e.message);
    }
  }

  return getLocalData(`tickets_${uid}`, []);
}

export function listenUserBookings(uid, callback) {
  if (!uid) {
    const local = getLocalData("all_bookings", []);
    callback(local);
    return () => {};
  }

  // Load initial local cached tickets immediately
  const localTickets = getLocalData(`tickets_${uid}`, []);
  if (localTickets.length > 0) {
    callback(localTickets);
  }

  if (!isMockFirebase) {
    try {
      const ticketsRef = collection(db, "users", uid, "tickets");
      const unsub = onSnapshot(
        ticketsRef,
        (snapshot) => {
          const list = [];
          snapshot.forEach((d) => list.push(d.data()));
          if (list.length > 0) {
            list.sort(
              (a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0),
            );
            setLocalData(`tickets_${uid}`, list);
            callback(list);
          } else if (localTickets.length > 0) {
            callback(localTickets);
          }
        },
        (err) => {
          console.warn("listenUserBookings onSnapshot error:", err);
        },
      );
      return unsub;
    } catch (e) {
      console.warn("listenUserBookings error:", e);
    }
  }

  return () => {};
}

export async function cancelBooking(bookingId, userId) {
  if (!bookingId) return false;

  if (!isMockFirebase) {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
      });
      if (userId) {
        await updateDoc(doc(db, `users/${userId}/tickets`, bookingId), {
          status: "CANCELLED",
          cancelledAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Firestore cancelBooking error:", e.message);
    }
  }

  const allBookings = getLocalData("all_bookings", []);
  const updatedAll = allBookings.map((b) =>
    b.bookingId === bookingId ? { ...b, status: "CANCELLED" } : b,
  );
  setLocalData("all_bookings", updatedAll);

  if (userId) {
    const userTickets = getLocalData(`tickets_${userId}`, []);
    const updatedUser = userTickets.map((b) =>
      b.bookingId === bookingId ? { ...b, status: "CANCELLED" } : b,
    );
    setLocalData(`tickets_${userId}`, updatedUser);
  }

  return true;
}

/* -------------------------------------------------------------
   MULTIPLAYER GROUP SESSIONS & CHAT
------------------------------------------------------------- */
export async function createGroupSession(sessionData) {
  const groupId = `grp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const group = {
    groupId,
    createdAt: Date.now(),
    status: "ACTIVE",
    ...sessionData,
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "groupSessions", groupId), group);
    } catch (e) {
      console.warn("Firestore createGroupSession error:", e.message);
    }
  }

  const groups = getLocalData("group_sessions", {});
  groups[groupId] = group;
  setLocalData("group_sessions", groups);
  return group;
}

export function listenGroupSession(groupId, onUpdate) {
  if (!groupId) return () => {};

  if (!isMockFirebase) {
    try {
      const docRef = doc(db, "groupSessions", groupId);
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) onUpdate(snap.data());
      });
    } catch (e) {
      console.warn("Firestore listenGroupSession error:", e.message);
    }
  }

  const check = () => {
    const groups = getLocalData("group_sessions", {});
    if (groups[groupId]) onUpdate(groups[groupId]);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "group_sessions") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function updateGroupSessionSeats(groupId, selectedSeats, user) {
  if (!groupId) return;
  const updateData = {
    selectedSeats,
    lastUpdatedBy: user?.displayName || user?.name || "Friend",
    lastUpdatedAt: Date.now(),
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "groupSessions", groupId), updateData, { merge: true });
    } catch (e) {
      console.warn("Firestore updateGroupSessionSeats error:", e.message);
    }
  }

  const groups = getLocalData("group_sessions", {});
  if (groups[groupId]) {
    groups[groupId] = { ...groups[groupId], ...updateData };
    setLocalData("group_sessions", groups);
  }
}

export async function joinGroupSession(groupId, user) {
  if (!groupId || !user) return;
  const member = {
    uid: user.uid || user.id || `usr_${Math.random().toString(36).substring(2, 6)}`,
    displayName: user.displayName || user.name || "Cinephile Friend",
    avatar: user.avatar || user.photoURL || null,
    joinedAt: Date.now(),
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, `groupSessions/${groupId}/members`, member.uid), member);
    } catch (e) {
      console.warn("Firestore joinGroupSession error:", e.message);
    }
  }
}

export async function sendGroupChatMessage(groupId, messageData) {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  const message = {
    id: msgId,
    timestamp: Date.now(),
    ...messageData,
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, `groupSessions/${groupId}/chats`, msgId), message);
    } catch (e) {
      console.warn("Firestore sendGroupChatMessage error:", e.message);
    }
  }

  const chats = getLocalData(`chats_${groupId}`, []);
  chats.push(message);
  setLocalData(`chats_${groupId}`, chats);
  return message;
}

export function listenGroupChat(groupId, onUpdate) {
  if (!groupId) return () => {};

  if (!isMockFirebase) {
    try {
      const chatCol = collection(db, `groupSessions/${groupId}/chats`);
      const q = query(chatCol, orderBy("timestamp", "asc"), limit(50));
      return onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach((d) => msgs.push(d.data()));
        onUpdate(msgs);
      });
    } catch (e) {
      console.warn("Firestore listenGroupChat error:", e.message);
    }
  }

  const check = () => {
    const chats = getLocalData(`chats_${groupId}`, []);
    onUpdate(chats);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === `chats_${groupId}`) check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

/* -------------------------------------------------------------
   REVIEWS & RATINGS
------------------------------------------------------------- */
export async function addMovieReview(movieId, reviewData) {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const review = {
    id: reviewId,
    movieId: String(movieId),
    createdAt: new Date().toISOString(),
    createdTimestamp: Date.now(),
    ...reviewData,
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, `reviews/${movieId}/items`, reviewId), review);
    } catch (e) {
      console.warn("Firestore addMovieReview error:", e.message);
    }
  }

  const reviews = getLocalData(`reviews_${movieId}`, []);
  reviews.unshift(review);
  setLocalData(`reviews_${movieId}`, reviews);
  return review;
}

export function listenMovieReviews(movieId, onUpdate) {
  if (!movieId) return () => {};

  if (!isMockFirebase) {
    try {
      const reviewsCol = collection(db, `reviews/${movieId}/items`);
      return onSnapshot(reviewsCol, (snap) => {
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        onUpdate(list.sort((a, b) => b.createdTimestamp - a.createdTimestamp));
      });
    } catch (e) {
      console.warn("Firestore listenMovieReviews error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData(`reviews_${movieId}`, [
      {
        id: "rev_sample_1",
        userName: "Elena Rostova",
        userAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        rating: 5,
        comment:
          "Mind-blowing visuals and superb sound design! Watched it in Hall 1 IMAX.",
        createdAt: "2 days ago",
        createdTimestamp: Date.now() - 172800000,
      },
      {
        id: "rev_sample_2",
        userName: "Marcus Vance",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        rating: 4.5,
        comment:
          "Intense pacing, incredible performances from the entire cast.",
        createdAt: "Yesterday",
        createdTimestamp: Date.now() - 86400000,
      },
    ]);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === `reviews_${movieId}`) check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

/* -------------------------------------------------------------
   WATCH HISTORY, FAVORITES & WATCHLIST
------------------------------------------------------------- */
export async function addToWatchHistory(uid, mediaItem) {
  if (!uid || !mediaItem) return;
  const historyItem = {
    ...mediaItem,
    watchedAt: new Date().toISOString(),
    watchedTimestamp: Date.now(),
  };

  if (!isMockFirebase) {
    try {
      await setDoc(
        doc(db, `users/${uid}/watchHistory`, String(mediaItem.id)),
        historyItem,
      );
    } catch (e) {
      console.warn("Firestore addToWatchHistory error:", e.message);
    }
  }

  const history = getLocalData(`history_${uid}`, []);
  const filtered = history.filter((h) => h.id !== mediaItem.id);
  filtered.unshift(historyItem);
  setLocalData(`history_${uid}`, filtered.slice(0, 50));
}

export function getWatchHistory(uid) {
  return getLocalData(`history_${uid}`, []);
}

export async function toggleFavorite(uid, mediaItem) {
  if (!uid || !mediaItem) return false;
  const favs = getLocalData(`favorites_${uid}`, []);
  const exists = favs.some((f) => f.id === mediaItem.id);
  let updated;

  if (exists) {
    updated = favs.filter((f) => f.id !== mediaItem.id);
    if (!isMockFirebase) {
      try {
        await deleteDoc(
          doc(db, `users/${uid}/favorites`, String(mediaItem.id)),
        );
      } catch (e) {
        /* ignore */
      }
    }
  } else {
    updated = [mediaItem, ...favs];
    if (!isMockFirebase) {
      try {
        await setDoc(
          doc(db, `users/${uid}/favorites`, String(mediaItem.id)),
          mediaItem,
        );
      } catch (e) {
        /* ignore */
      }
    }
  }

  setLocalData(`favorites_${uid}`, updated);
  return !exists;
}

export async function toggleWatchlist(uid, mediaItem) {
  if (!uid || !mediaItem) return false;
  const list = getLocalData(`watchlist_${uid}`, []);
  const exists = list.some((f) => f.id === mediaItem.id);
  let updated;

  if (exists) {
    updated = list.filter((f) => f.id !== mediaItem.id);
    if (!isMockFirebase) {
      try {
        await deleteDoc(
          doc(db, `users/${uid}/watchlist`, String(mediaItem.id)),
        );
      } catch (e) {
        /* ignore */
      }
    }
  } else {
    updated = [mediaItem, ...list];
    if (!isMockFirebase) {
      try {
        await setDoc(
          doc(db, `users/${uid}/watchlist`, String(mediaItem.id)),
          mediaItem,
        );
      } catch (e) {
        /* ignore */
      }
    }
  }

  setLocalData(`watchlist_${uid}`, updated);
  return !exists;
}

export function getUserMediaList(uid, listType = "favorites") {
  return getLocalData(`${listType}_${uid}`, []);
}

/* -------------------------------------------------------------
   NOTIFICATIONS
------------------------------------------------------------- */
export function getUserNotifications(uid) {
  const notifs = getLocalData(`notifs_${uid}`, [
    {
      id: "notif_welcome",
      title: "Welcome to Ciniverse!",
      body: "Get $5 off your first combo with promo code Ciniverse5.",
      read: false,
      timestamp: Date.now() - 3600000,
    },
    {
      id: "notif_booking_tip",
      title: "Group Booking Live!",
      body: "You can now invite friends to pick cinema seats together with real-time sync.",
      read: false,
      timestamp: Date.now() - 86400000,
    },
  ]);
  return notifs;
}

export function markNotificationRead(uid, notifId) {
  const notifs = getLocalData(`notifs_${uid}`, []);
  const updated = notifs.map((n) =>
    n.id === notifId ? { ...n, read: true } : n,
  );
  setLocalData(`notifs_${uid}`, updated);
  return updated;
}

/* -------------------------------------------------------------
   DYNAMIC ADMIN MANAGEMENT (Movies, Showtimes, Halls, Concessions)
------------------------------------------------------------- */

// 1. Managed Movies (which TMDB titles are authorized for cinema booking)
const DEFAULT_MANAGED_MOVIE_IDS = [693134, 1011985, 823464, 653346, 533535];

export function listenManagedMovies(onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_managed_movies");
      return onSnapshot(colRef, (snap) => {
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        if (list.length > 0) {
          onUpdate(list);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenManagedMovies error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData(
      "admin_managed_movies",
      DEFAULT_MANAGED_MOVIE_IDS.map((id) => ({ id: Number(id), active: true })),
    );
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_managed_movies") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function toggleAdminManagedMovie(movie) {
  const movieId = Number(movie.id);
  const current = getLocalData(
    "admin_managed_movies",
    DEFAULT_MANAGED_MOVIE_IDS.map((id) => ({ id: Number(id), active: true })),
  );
  const exists = current.find((m) => m.id === movieId);
  let updated;

  if (exists) {
    updated = current.filter((m) => m.id !== movieId);
    if (!isMockFirebase) {
      try {
        await deleteDoc(doc(db, "admin_managed_movies", String(movieId)));
      } catch (e) {
        /* ignore */
      }
    }
  } else {
    const record = {
      id: movieId,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      active: true,
      addedAt: new Date().toISOString(),
    };
    updated = [record, ...current];
    if (!isMockFirebase) {
      try {
        await setDoc(doc(db, "admin_managed_movies", String(movieId)), record);
      } catch (e) {
        /* ignore */
      }
    }
  }

  setLocalData("admin_managed_movies", updated);
  return updated;
}

// 2. Admin Showtimes (dynamically scheduled by Admin in calendar)
export function listenAdminShowtimes(onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_showtimes");
      return onSnapshot(colRef, (snap) => {
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        if (list.length > 0) {
          onUpdate(list);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenAdminShowtimes error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData("admin_showtimes", []);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_showtimes") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function addAdminShowtime(slotData) {
  const slotId =
    slotData.id ||
    `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const record = { ...slotData, id: slotId, createdAt: Date.now() };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "admin_showtimes", slotId), record);
    } catch (e) {
      console.warn("Firestore addAdminShowtime error:", e.message);
    }
  }

  const current = getLocalData("admin_showtimes", []);
  const updated = [record, ...current];
  setLocalData("admin_showtimes", updated);
  return record;
}

export async function deleteAdminShowtime(slotId) {
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, "admin_showtimes", slotId));
    } catch (e) {
      console.warn("Firestore deleteAdminShowtime error:", e.message);
    }
  }

  const current = getLocalData("admin_showtimes", []);
  const updated = current.filter((s) => s.id !== slotId);
  setLocalData("admin_showtimes", updated);
  return updated;
}

// 3. Admin Cinema Halls & Rates
export function listenAdminHalls(defaultHalls, onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_halls");
      return onSnapshot(colRef, (snap) => {
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        if (list.length > 0) {
          onUpdate(list);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenAdminHalls error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData("admin_halls", defaultHalls);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_halls") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function updateAdminHall(hallId, updates) {
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "admin_halls", hallId), updates, { merge: true });
    } catch (e) {
      console.warn("Firestore updateAdminHall error:", e.message);
    }
  }

  const current = getLocalData("admin_halls", []);
  const updated = current.map((h) =>
    h.id === hallId ? { ...h, ...updates } : h,
  );
  setLocalData("admin_halls", updated);
  return updated;
}

// 4. Admin Concessions Menu
export function listenAdminConcessions(defaultCatalog, onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_concessions");
      return onSnapshot(colRef, (snap) => {
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        if (list.length > 0) {
          onUpdate(list);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenAdminConcessions error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData("admin_concessions", defaultCatalog);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_concessions") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function addAdminConcession(item) {
  const itemId = item.id || `conc_${Date.now()}`;
  const record = { ...item, id: itemId };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "admin_concessions", itemId), record);
    } catch (e) {
      console.warn("Firestore addAdminConcession error:", e.message);
    }
  }

  const current = getLocalData("admin_concessions", []);
  const updated = [record, ...current];
  setLocalData("admin_concessions", updated);
  return record;
}

export async function deleteAdminConcession(itemId) {
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, "admin_concessions", itemId));
    } catch (e) {
      console.warn("Firestore deleteAdminConcession error:", e.message);
    }
  }

  const current = getLocalData("admin_concessions", []);
  const updated = current.filter((i) => i.id !== itemId);
  setLocalData("admin_concessions", updated);
  return updated;
}

/* -------------------------------------------------------------
   5. ALL USERS MANAGEMENT (Admin View)
------------------------------------------------------------- */
export function listenAllUsers(onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "users");
      return onSnapshot(colRef, (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
        onUpdate(list);
      });
    } catch (e) {
      console.warn("Firestore listenAllUsers error:", e.message);
    }
  }

  const check = () => {
    const usersObj = getLocalData("users", {});
    const list = Object.values(usersObj);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "users") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function updateUserRole(uid, role) {
  if (!uid) return;
  if (!isMockFirebase) {
    try {
      await updateDoc(doc(db, "users", uid), {
        role,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore updateUserRole error:", e.message);
    }
  }
  const users = getLocalData("users", {});
  if (users[uid]) {
    users[uid].role = role;
    setLocalData("users", users);
  }
}

export async function deleteUserFromFirestore(uid) {
  if (!uid) return;
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (e) {
      console.warn("Firestore deleteUserFromFirestore error:", e.message);
    }
  }
  const users = getLocalData("users", {});
  delete users[uid];
  setLocalData("users", users);
}

/* -------------------------------------------------------------
   6. CINEMA BRANCHES & LOCATIONS MANAGEMENT
------------------------------------------------------------- */
export function listenAdminBranches(defaultBranches, onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_branches");
      return onSnapshot(colRef, (snap) => {
        if (!snap.empty) {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          onUpdate(list);
          return;
        } else if (defaultBranches && defaultBranches.length > 0) {
          // Seed default branches to Firestore if empty
          defaultBranches.forEach(async (b) => {
            try {
              await setDoc(doc(db, "admin_branches", b.id), b);
            } catch (err) {
              /* ignore */
            }
          });
          onUpdate(defaultBranches);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenAdminBranches error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData("admin_branches", defaultBranches || []);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_branches") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function saveAdminBranch(branchData) {
  const branchId = branchData.id || `branch_${Date.now()}`;
  const record = {
    ...branchData,
    id: branchId,
    updatedAt: new Date().toISOString(),
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "admin_branches", branchId), record, {
        merge: true,
      });
    } catch (e) {
      console.warn("Firestore saveAdminBranch error:", e.message);
    }
  }

  const current = getLocalData("admin_branches", []);
  const index = current.findIndex((b) => b.id === branchId);
  const updated =
    index >= 0
      ? current.map((b) => (b.id === branchId ? record : b))
      : [record, ...current];
  setLocalData("admin_branches", updated);
  return record;
}

export async function deleteAdminBranch(branchId) {
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, "admin_branches", branchId));
    } catch (e) {
      console.warn("Firestore deleteAdminBranch error:", e.message);
    }
  }

  const current = getLocalData("admin_branches", []);
  const updated = current.filter((b) => b.id !== branchId);
  setLocalData("admin_branches", updated);
  return updated;
}

/* -------------------------------------------------------------
   7. ADMIN MANAGED MOVIES & CLIENT DISPLAY CATALOG
------------------------------------------------------------- */
export function listenAdminMovies(defaultMovies, onUpdate) {
  if (!isMockFirebase) {
    try {
      const colRef = collection(db, "admin_movies");
      return onSnapshot(colRef, (snap) => {
        if (!snap.empty) {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          onUpdate(list);
          return;
        } else if (defaultMovies && defaultMovies.length > 0) {
          // Seed default movies to Firestore if empty
          defaultMovies.forEach(async (m) => {
            try {
              await setDoc(doc(db, "admin_movies", String(m.id)), m);
            } catch (err) {
              /* ignore */
            }
          });
          onUpdate(defaultMovies);
          return;
        }
      });
    } catch (e) {
      console.warn("Firestore listenAdminMovies error:", e.message);
    }
  }

  const check = () => {
    const list = getLocalData("admin_movies", defaultMovies || []);
    onUpdate(list);
  };
  check();

  const handleEvt = (e) => {
    if (e.detail?.key === "admin_movies") check();
  };
  window.addEventListener("Ciniverse_storage_event", handleEvt);
  return () => window.removeEventListener("Ciniverse_storage_event", handleEvt);
}

export async function saveAdminMovie(movieData) {
  const movieId = String(movieData.id || `mov_${Date.now()}`);
  const record = {
    ...movieData,
    id: movieId,
    updatedAt: new Date().toISOString(),
  };

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, "admin_movies", movieId), record, {
        merge: true,
      });
    } catch (e) {
      console.warn("Firestore saveAdminMovie error:", e.message);
    }
  }

  const current = getLocalData("admin_movies", []);
  const index = current.findIndex((m) => String(m.id) === movieId);
  const updated =
    index >= 0
      ? current.map((m) => (String(m.id) === movieId ? record : m))
      : [record, ...current];
  setLocalData("admin_movies", updated);
  return record;
}

export async function saveAllAdminMovies(moviesList) {
  if (!Array.isArray(moviesList)) return;

  if (!isMockFirebase) {
    try {
      for (const m of moviesList) {
        const docId = String(m.id);
        await setDoc(doc(db, "admin_movies", docId), m, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore saveAllAdminMovies error:", e.message);
    }
  }

  setLocalData("admin_movies", moviesList);
}

export async function deleteAdminMovie(movieId) {
  const docId = String(movieId);
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, "admin_movies", docId));
    } catch (e) {
      console.warn("Firestore deleteAdminMovie error:", e.message);
    }
  }

  const current = getLocalData("admin_movies", []);
  const updated = current.filter((m) => String(m.id) !== docId);
  setLocalData("admin_movies", updated);
  return updated;
}

