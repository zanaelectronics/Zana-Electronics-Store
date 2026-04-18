import { useState } from "react";
import { useStore, type UserProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminUsersTab() {
  const { allProfiles, setUserRole, currentUser } = useStore();
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeRole = async (u: UserProfile, role: "admin" | "moderator" | "user") => {
    if (u.user_id === currentUser?.id && role !== "admin") {
      toast.error("You can't remove your own admin role");
      return;
    }
    setBusyId(u.user_id);
    const { error } = await setUserRole(u.user_id, role);
    setBusyId(null);
    if (error) toast.error(error);
    else toast.success(`Role updated to ${role}`);
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3">Name</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allProfiles.map((u) => (
            <tr key={u.id} className="border-b hover:bg-muted/50">
              <td className="p-3 font-medium">{u.display_name || "—"}</td>
              <td className="p-3">{u.phone || "—"}</td>
              <td className="p-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "admin" ? "bg-primary/10 text-primary" :
                  u.role === "moderator" ? "bg-warning/10 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {u.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                  {u.role}
                </span>
              </td>
              <td className="p-3">
                {busyId === u.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex gap-1">
                    {u.role !== "admin" && (
                      <Button size="sm" variant="outline" onClick={() => changeRole(u, "admin")}>
                        <Shield className="mr-1 h-3 w-3" /> Make admin
                      </Button>
                    )}
                    {u.role === "admin" && (
                      <Button size="sm" variant="ghost" onClick={() => changeRole(u, "user")}>
                        <ShieldOff className="mr-1 h-3 w-3" /> Demote
                      </Button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
