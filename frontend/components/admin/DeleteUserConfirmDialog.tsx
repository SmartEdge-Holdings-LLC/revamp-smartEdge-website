"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminApiError, deleteAdminUser } from "@/lib/api/adminApi";
import type { AdminUserListItem } from "@/types/admin";

interface DeleteUserConfirmDialogProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteUserConfirmDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: DeleteUserConfirmDialogProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteAdminUser(user._id);
      toast.success("User deleted");
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.message : "Failed to delete user"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 border-white/10 bg-[#0c0c0c] sm:max-w-md">
        <DialogTitle className="text-[15px] font-semibold text-white">
          Are you sure you want to delete this user?
        </DialogTitle>
        <DialogDescription className="mt-2 space-y-2 typo-body-sm text-subtle">
          {user ? (
            <>
              <span className="block text-slate-200">
                <span className="font-medium text-white">{user.name}</span>
                {" · "}
                {user.email}
              </span>
              <span className="block">
                This permanently removes their account, subscription records, and Stripe
                customer data. This action cannot be undone.
              </span>
            </>
          ) : null}
        </DialogDescription>
        <DialogFooter className="mt-6 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
            className="text-subtle hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleting || !user}
            onClick={() => void handleDelete()}
            className="bg-rose-600 text-white hover:bg-rose-500"
          >
            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
