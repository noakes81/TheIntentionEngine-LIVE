import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Shield, User, Loader2, RefreshCw, X, ChevronDown } from "lucide-react";

interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{ email_address: string; id: string }>;
  public_metadata: { role?: string; title?: string };
  created_at: number;
  last_sign_in_at: number | null;
}

export default function Admin() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  useEffect(() => {
    if (isLoaded && !isAdmin) setLocation("/");
  }, [isLoaded, isAdmin, setLocation]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json() as { users: ClerkUser[] };
      setUsers(data.users);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        alert(d.error ?? "Delete failed");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleRole(userId: string, current: string) {
    const next = current === "admin" ? "user" : "admin";
    setTogglingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) return;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, public_metadata: { ...u.public_metadata, role: next } }
            : u,
        ),
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (!isLoaded || !isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-semibold text-white/85 tracking-wide">
            User Management
          </h1>
          <p className="text-[12px] font-mono text-white/30 mt-0.5">
            {users.length} registered account{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2 rounded transition-colors"
            style={{ border: "1px solid hsla(270,45%,22%,0.4)", color: "hsla(270,65%,60%,0.6)" }}
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded text-[12px] font-mono font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,30%,1))",
              border: "1px solid hsla(270,75%,55%,0.5)",
              color: "white",
              boxShadow: "0 0 14px hsla(270,75%,55%,0.2)",
            }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add User
          </button>
        </div>
      </div>

      {/* Add user form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <AddUserForm
              onCreated={() => { setShowAdd(false); loadUsers(); }}
              onCancel={() => setShowAdd(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div
          className="rounded px-3 py-2.5 text-[12px] font-mono text-red-400/90"
          style={{ background: "hsla(0,70%,20%,0.3)", border: "1px solid hsla(0,70%,45%,0.3)" }}
        >
          {error}
        </div>
      )}

      {/* User table */}
      <div
        className="rounded overflow-hidden"
        style={{ border: "1px solid hsla(270,45%,18%,0.45)" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest"
          style={{
            background: "hsla(228,35%,7%,0.9)",
            borderBottom: "1px solid hsla(270,45%,15%,0.35)",
            color: "hsla(270,55%,55%,0.5)",
          }}
        >
          <span>User</span>
          <span>Role</span>
          <span>Joined</span>
          <span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2"
            style={{ background: "hsla(228,35%,6%,0.8)" }}>
            <Loader2 className="w-4 h-4 animate-spin text-white/20" />
            <span className="text-[12px] font-mono text-white/25">Loading…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12"
            style={{ background: "hsla(228,35%,6%,0.8)" }}>
            <span className="text-[12px] font-mono text-white/20">No users found</span>
          </div>
        ) : (
          <div style={{ background: "hsla(228,35%,6%,0.8)" }}>
            {users.map((u, i) => {
              const email = u.email_addresses[0]?.email_address ?? "—";
              const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || null;
              const role = (u.public_metadata?.role as string) ?? "user";
              const isCurrentUser = u.id === user?.id;
              const joined = u.created_at
                ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—";

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 transition-colors"
                  style={{
                    borderTop: i > 0 ? "1px solid hsla(270,45%,12%,0.3)" : undefined,
                  }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: role === "admin" ? "hsla(270,55%,18%,1)" : "hsla(228,35%,10%,1)",
                        border: `1px solid ${role === "admin" ? "hsla(270,75%,40%,0.4)" : "hsla(228,30%,18%,0.4)"}`,
                      }}
                    >
                      {role === "admin"
                        ? <Shield className="w-3.5 h-3.5" style={{ color: "hsla(270,75%,65%,0.8)" }} />
                        : <User className="w-3.5 h-3.5" style={{ color: "hsla(228,30%,45%,0.7)" }} />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-mono text-white/75 truncate leading-tight">
                        {name ?? email}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] text-white/25">(you)</span>
                        )}
                      </p>
                      {name && (
                        <p className="text-[11px] font-mono text-white/30 truncate leading-tight">{email}</p>
                      )}
                    </div>
                  </div>

                  {/* Role badge */}
                  <button
                    onClick={() => !isCurrentUser && toggleRole(u.id, role)}
                    disabled={togglingId === u.id || isCurrentUser}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide transition-all disabled:cursor-default"
                    style={role === "admin"
                      ? { background: "hsla(270,55%,18%,0.8)", border: "1px solid hsla(270,75%,40%,0.35)", color: "hsla(270,75%,65%,0.8)" }
                      : { background: "hsla(228,35%,9%,0.8)", border: "1px solid hsla(228,30%,22%,0.35)", color: "hsla(228,30%,45%,0.7)" }
                    }
                    title={isCurrentUser ? "Cannot change your own role" : `Click to toggle role`}
                  >
                    {togglingId === u.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    {role}
                  </button>

                  {/* Joined */}
                  <span className="text-[11px] font-mono text-white/25 whitespace-nowrap">{joined}</span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={deletingId === u.id || isCurrentUser}
                    className="p-1.5 rounded transition-colors disabled:opacity-20 disabled:cursor-default"
                    style={{ color: "hsla(0,60%,45%,0.5)" }}
                    title={isCurrentUser ? "Cannot delete your own account" : "Delete user"}
                  >
                    {deletingId === u.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AddUserForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password: password || undefined, role }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to create user"); return; }
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded p-5 space-y-4"
      style={{
        background: "hsla(228,35%,7%,0.9)",
        border: "1px solid hsla(270,75%,40%,0.3)",
        boxShadow: "0 0 20px hsla(270,75%,30%,0.1)",
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-mono font-semibold text-white/75">Add New User</h2>
        <button onClick={onCancel} className="text-white/25 hover:text-white/50 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="rounded px-3 py-2 text-[12px] font-mono text-red-400/90"
          style={{ background: "hsla(0,70%,20%,0.3)", border: "1px solid hsla(0,70%,45%,0.3)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" value={firstName} onChange={setFirstName} />
          <Field label="Last Name" value={lastName} onChange={setLastName} />
        </div>
        <Field label="Email Address" value={email} onChange={setEmail} type="email" required />
        <Field label="Password (optional — user can reset)" value={password} onChange={setPassword} type="password" />

        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">Role</label>
          <div className="flex gap-2">
            {(["user", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wide transition-all"
                style={role === r
                  ? { background: "hsla(270,55%,20%,1)", border: "1px solid hsla(270,75%,45%,0.5)", color: "hsla(270,75%,70%,1)" }
                  : { background: "hsla(228,35%,8%,1)", border: "1px solid hsla(228,30%,18%,0.4)", color: "hsla(228,20%,40%,0.8)" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-[12px] font-mono font-semibold transition-all disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, hsla(270,75%,40%,1), hsla(270,65%,30%,1))",
              border: "1px solid hsla(270,75%,55%,0.5)",
              color: "white",
            }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Creating…" : "Create User"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-[12px] font-mono transition-all"
            style={{ border: "1px solid hsla(228,30%,18%,0.4)", color: "hsla(228,20%,45%,0.7)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono uppercase tracking-widest text-white/40">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded px-3 py-2 text-[13px] font-mono outline-none"
        style={{
          background: "hsla(228,35%,6%,1)",
          border: "1px solid hsla(270,45%,22%,0.35)",
          color: "rgba(255,255,255,0.8)",
        }}
      />
    </div>
  );
}
