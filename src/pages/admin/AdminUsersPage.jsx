import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Shield,
  User,
  Trash2,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  listenAllUsers,
  updateUserRole,
  deleteUserFromFirestore,
} from "../../services/firestoreService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    const unsub = listenAllUsers((list) => {
      setUsers(list || []);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const togglePasswordVisibility = (uid) => {
    setShowPasswords((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (window.confirm(`Are you sure you want to remove user "${email}"?`)) {
      try {
        await deleteUserFromFirestore(uid);
        toast.success(`User ${email} deleted`);
      } catch (e) {
        toast.error("Failed to delete user");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL") {
        const userRole = u.role || "user";
        if (userRole.toLowerCase() !== roleFilter.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesName = (u.name || u.displayName)?.toLowerCase().includes(q);
        if (!matchesEmail && !matchesName) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="relative inline-block pb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#B90101] tracking-tight">
              Registered Users & Customers
            </h1>
            <div className="absolute bottom-0 left-0 w-32 h-0.5 bg-[#B90101] rounded-full" />
          </div>
          <p className="text-xs text-neutral-500 font-semibold mt-1">
            Real-time live synchronization with Firebase Firestore ({users.length} Users Total).
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-white border border-neutral-200 rounded-full shadow-xs">
            {["ALL", "USER", "ADMIN"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                  roleFilter === role
                    ? "bg-[#B90101] text-white shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user by name or email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#B90101] shadow-xs"
          />
        </div>
        <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">
          {filteredUsers.length} users found
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#B90101] text-white text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-6">USER</th>
                <th className="py-4 px-6">EMAIL</th>
                <th className="py-4 px-6">PASSWORD (FIRESTORE)</th>
                <th className="py-4 px-6">REGISTERED DATE</th>
                <th className="py-4 px-6 text-center">ROLE</th>
                <th className="py-4 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm font-semibold text-neutral-800">
              {filteredUsers.map((u) => {
                const isAdmin = u.role?.toLowerCase() === "admin";
                const isPwdVisible = Boolean(showPasswords[u.uid]);

                return (
                  <tr
                    key={u.uid || u.email}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {u.avatar || u.photoURL ? (
                          <img
                            src={u.avatar || u.photoURL}
                            alt={u.name || "User"}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#B90101]/10 text-[#B90101] flex items-center justify-center font-bold">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-neutral-900 leading-tight">
                            {u.name || u.displayName || "User"}
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            UID: {u.uid ? `${u.uid.slice(0, 10)}...` : "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-neutral-700 font-medium">
                      {u.email}
                    </td>

                    {/* Stored Password */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {u.password ? (
                          <>
                            <span className="bg-neutral-100 px-2 py-1 rounded-md text-neutral-800 font-bold border border-neutral-200">
                              {isPwdVisible ? u.password : "••••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.uid)}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-700 transition"
                              title={isPwdVisible ? "Hide password" : "Show password"}
                            >
                              {isPwdVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">
                            {u.authProvider === "google.com"
                              ? "Google OAuth"
                              : "Encrypted"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-neutral-500 font-medium text-xs">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <select
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          isAdmin
                            ? "bg-rose-50 text-[#B90101] border-[#B90101]/30"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.uid, u.email)}
                        className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 transition flex items-center justify-center mx-auto"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-sm font-bold">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
