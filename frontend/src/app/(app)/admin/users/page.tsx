"use client";

import { useCallback, useMemo, useState } from "react";
import { Filter, Loader2, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminUserMutations, useAdminUsers } from "@/lib/api/hooks/admin";
import { useAuth } from "@/lib/auth/hooks";
import { formatRelativeTime } from "@/lib/utils/date";
import type { AdminUser } from "@/lib/api/admin/users";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";

const USERS_PER_PAGE = 12;
const statusOptions = ["all", "active", "suspended", "banned"] as const;
const roleOptions = ["all", "admin", "moderator", "member"] as const;

export default function UsersAdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin") ?? false;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [roleFilter, setRoleFilter] = useState<(typeof roleOptions)[number]>("all");

  const query = useMemo(
    () => ({
      page,
      limit: USERS_PER_PAGE,
      query: debouncedSearch || undefined,
      status: statusFilter !== "all" ? (statusFilter as "active" | "suspended" | "banned") : undefined,
      roles: roleFilter !== "all" ? roleFilter : undefined,
    }),
    [debouncedSearch, page, roleFilter, statusFilter],
  );

  const { data, isLoading, error } = useAdminUsers(query, {
    revalidateOnFocus: false,
    isPaused: () => !isAdmin,
  });
  const { updateRoles, updateStatus, forceLogout } = useAdminUserMutations();

  const members = (data?.data ?? []) as AdminUser[];
  const pagination = data?.pagination;

  const toggleModeratorRole = async (member: AdminUser) => {
    const currentRoles = member.roles ?? [];
    const hasModerator = currentRoles.includes("moderator");
    const nextRoles = hasModerator ? currentRoles.filter((role) => role !== "moderator") : [...currentRoles, "moderator"];
    try {
      await updateRoles(member.id, { roles: nextRoles });
      toast.success(hasModerator ? "Moderator role removed." : "Moderator role granted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update roles.");
    }
  };

  const updateMemberStatus = async (memberId: string, status: "active" | "suspended") => {
    try {
      await updateStatus(memberId, { status });
      toast.success(status === "active" ? "Member reactivated." : "Member suspended.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update status.");
    }
  };

  const handleForceLogout = async (memberId: string) => {
    try {
      await forceLogout(memberId);
      toast.success("Member logged out.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to force logout.");
    }
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setPage(1);
  }, []);

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 px-6 py-10 text-center text-sm text-amber-200">
        Admin access is required to manage members.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-400">Member roster</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Match roles to warmth, instantly.</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Assign moderators, pause access, and keep your care team in sync.
          </p>
        </div>
        <Button
          variant="ghost"
          className="rounded-xl border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700"
          onClick={resetFilters}
        >
          <Filter className="mr-2 size-4" />
          Reset filters
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70">
        <div className="border-b border-slate-800/70 px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-slate-900/80">
                <Input
                  placeholder="Search by name, email, or handle…"
                  className="border-none bg-transparent p-0 text-sm focus-visible:ring-0"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="text-xs text-slate-500">
                {pagination ? `${pagination.total} members` : members.length ? `${members.length} members` : undefined}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-slate-400">
                <span className="tracking-[0.2em] text-slate-500">Status</span>
                {statusOptions.map((option) => {
                  const isActive = option === statusFilter;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setPage(1);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs uppercase tracking-wider transition-colors",
                        isActive
                          ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase text-slate-400">
                <span className="tracking-[0.2em] text-slate-500">Role</span>
                {roleOptions.map((option) => {
                  const isActive = option === roleFilter;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setRoleFilter(option);
                        setPage(1);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs uppercase tracking-wider transition-colors",
                        isActive
                          ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 px-6 py-4 text-sm text-slate-300">
            <Loader2 className="size-4 animate-spin text-sky-300" />
            Loading roster…
          </div>
        )}

        {error && (
          <div className="px-6 py-4 text-sm text-rose-200">
            {error instanceof Error ? error.message : "Unable to load roster."}
          </div>
        )}

        <div className="divide-y divide-slate-800/60">
          {members.map((member) => {
            const isModerator = member.roles?.includes("moderator");
            const memberRoles = member.roles?.length ? member.roles : ["member"];

            const statusBadgeClass = cn(
              "rounded-full border px-3 py-1 uppercase tracking-[0.2em]",
              member.status === "active"
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                : member.status === "suspended"
                  ? "border-amber-400/60 bg-amber-500/10 text-amber-200"
                  : "border-rose-400/60 bg-rose-500/10 text-rose-200",
            );

            return (
              <div key={member.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-900/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="text-sm font-semibold text-white">{member.displayName ?? member.email}</span>
                      <span>•</span>
                      <span>@{member.handle}</span>
                      <span>•</span>
                      <span>{member.email}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className={statusBadgeClass}>{member.status}</span>
                      {memberRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full border border-slate-800/70 bg-slate-900/60 px-3 py-1 uppercase tracking-[0.2em] text-slate-300"
                        >
                          {role}
                        </span>
                      ))}
                      <span className="text-slate-600">•</span>
                      <span>Threads: {member.threadsCount ?? 0}</span>
                      <span className="text-slate-600">•</span>
                      <span>Posts: {member.postsCount ?? 0}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Last active {member.lastActiveAt ? formatRelativeTime(member.lastActiveAt) : "unknown"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs text-emerald-300 hover:border-slate-700"
                      onClick={() => toggleModeratorRole(member)}
                    >
                      <ShieldCheck className="mr-2 size-3" />
                      {isModerator ? "Remove moderator" : "Grant moderator"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-xs text-amber-300 hover:text-amber-200"
                      onClick={() =>
                        updateMemberStatus(member.id, member.status === "active" ? "suspended" : "active")
                      }
                    >
                      {member.status === "active" ? (
                        <>
                          <UserMinus className="mr-2 size-3" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 size-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-xs text-rose-300 hover:text-rose-200"
                      onClick={() => handleForceLogout(member.id)}
                    >
                      Force logout
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!members.length && !isLoading && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">No members found for that filter.</div>
        )}

        {pagination && members.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 px-6 py-4 text-xs text-slate-400">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}
              &ndash;
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Previous
              </Button>
              <span className="uppercase tracking-[0.18em]">Page {page}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="rounded-lg border border-slate-800/70 bg-slate-900/70 text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


