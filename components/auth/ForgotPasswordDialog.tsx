"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ForgotPasswordDialog({
  adminEmail = "admin@admin.com",
  adminNote,
  triggerClassName = "text-sm underline text-muted-foreground",
  triggerAlign = "center",
}: {
  adminEmail?: string;
  adminNote?: string;
  triggerClassName?: string;
  triggerAlign?: "left" | "center" | "right";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        triggerAlign === "center"
          ? "text-center"
          : triggerAlign === "right"
            ? "text-right"
            : ""
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button type="button" className={triggerClassName}>
            Forgot your password?
          </button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset</DialogTitle>
            <DialogDescription>
              For security reasons, password resets are handled by an
              administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p>Please contact your administrator to reset your password.</p>
            <p className="text-sm">
              Email:&nbsp;
              <a href={`mailto:${adminEmail}`} className="underline">
                {adminEmail}
              </a>
            </p>
            {adminNote && (
              <p className="text-xs text-muted-foreground">{adminNote}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" asChild>
              <a href={`mailto:${adminEmail}`}>Email administrator</a>
            </Button>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
