import { useState, useEffect } from "react";
import { TMDB_15_REAL_MOVIES } from "./tmdbCatalog";
import { createDefaultBranchSchedules } from "./hallConfigs";
import { fetchReal15TmdbCatalog } from "../services/tmdbService";

const STORAGE_KEY = "admin_movies_catalog";
const VERSION_KEY = "admin_movies_catalog_v_4";
const CATALOG_EVENT = "flixzone_catalog_updated";

/**
 * Ensures each movie has real branches, schedules, and complete metadata
 */
function enrichMovie(movie) {
  if (!movie) return movie;
  const branches =
    movie.branches && Array.isArray(movie.branches) && movie.branches.length > 0
      ? movie.branches
      : createDefaultBranchSchedules();

  return {
    ...movie,
    startDate: movie.startDate || "2026-08-25",
    endDate: movie.endDate || "2026-09-01",
    totalDays: movie.totalDays || 7,
    hall: movie.hall || "Ciniverse SenSok",
    date: movie.date || "20-25/09/2026",
    status: movie.status || "Live",
    branches,
  };
}

/**
 * Get all active movies set by Admin (defaults to 15 Real TMDB titles with real branches)
 */
export function getStoredMovies() {
  try {
    const isUpToDate =
      localStorage.getItem(VERSION_KEY) === "v4_unique_posters_sync";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null && isUpToDate) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(enrichMovie);
      }
    }
  } catch (e) {
    console.error("Error parsing stored movies:", e);
  }

  // Initialize or auto-upgrade with the 15 Real TMDB movies with 100% unique posters
  const initial15 = TMDB_15_REAL_MOVIES.map(enrichMovie);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial15));
    localStorage.setItem(VERSION_KEY, "v4_unique_posters_sync");
  } catch (e) {}
  return initial15;
}

/**
 * Save movies and notify all pages/components in real-time
 */
export function saveStoredMovies(movies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (e) {
    console.error("Error saving stored movies:", e);
  }
  // Dispatch event so any open React component re-renders instantly
  window.dispatchEvent(new Event(CATALOG_EVENT));
}

/**
 * Add a new movie to the catalog
 */
export function addCatalogMovie(movie) {
  const current = getStoredMovies();
  const updated = [movie, ...current];
  saveStoredMovies(updated);
  return updated;
}

/**
 * Update an existing movie in the catalog
 */
export function updateCatalogMovie(updatedMovie) {
  const current = getStoredMovies();
  const updated = current.map((m) =>
    m.id === updatedMovie.id ? { ...m, ...updatedMovie } : m,
  );
  saveStoredMovies(updated);
  return updated;
}

/**
 * Delete a movie from the catalog
 */
export function deleteCatalogMovie(movieId) {
  const current = getStoredMovies();
  const updated = current.filter((m) => m.id !== movieId);
  saveStoredMovies(updated);
  return updated;
}

/**
 * Reset to the 15 Real TMDB movies
 */
export function resetTo15RealMovies() {
  const enriched = TMDB_15_REAL_MOVIES.map(enrichMovie);
  saveStoredMovies(enriched);
  return enriched;
}

// Backward compatibility alias
export const resetTo100CatalogMovies = resetTo15RealMovies;

/**
 * Dynamically fetch and sync real 15 titles directly from live TMDB Cloud API
 */
export async function syncFromLiveTmdb() {
  try {
    const real15 = await fetchReal15TmdbCatalog();
    if (real15 && Array.isArray(real15) && real15.length > 0) {
      const enriched = real15.map(enrichMovie);
      saveStoredMovies(enriched);
      return enriched;
    }
  } catch (e) {
    console.error("Live TMDB sync failed:", e);
  }
  // Fallback to static 15 real TMDB catalog if offline/error
  const fallback15 = TMDB_15_REAL_MOVIES.map(enrichMovie);
  saveStoredMovies(fallback15);
  return fallback15;
}

/**
 * Helper to find a movie in catalog by ID or TMDB ID
 */
export function findCatalogMovie(id) {
  if (!id) return null;
  const current = getStoredMovies();
  return current.find(
    (m) => String(m.id) === String(id) || String(m.tmdbId) === String(id),
  );
}

/**
 * Clear all movies and reset to empty
 */
export function clearAllCatalogMovies() {
  saveStoredMovies([]);
  return [];
}

/**
 * Custom React Hook that keeps user & admin views 100% in sync in real-time
 */
export function useActiveMovies() {
  const [movies, setMovies] = useState(getStoredMovies);

  useEffect(() => {
    const handleUpdate = () => {
      setMovies(getStoredMovies());
    };

    window.addEventListener(CATALOG_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(CATALOG_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return movies;
}
