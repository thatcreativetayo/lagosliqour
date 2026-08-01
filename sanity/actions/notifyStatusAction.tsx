"use client";

import { useCallback, useState } from "react";
import type {
  DocumentActionComponent,
  DocumentActionDescription,
  DocumentActionProps,
} from "sanity";
import { isNotifiableStatus } from "@/lib/email/status-templates";

type OrderDoc = {
  status?: string;
  lastNotifiedStatus?: string;
} | null;

type DialogState =
  | { type: "none" }
  | { type: "confirm" }
  | { type: "result"; message: string; ok: boolean };

const LABEL = "Notify customer of status";

export const notifyStatusAction: DocumentActionComponent = (
  props: DocumentActionProps
): DocumentActionDescription => {
  const { id, published, draft, onComplete } = props;
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [sending, setSending] = useState(false);

  const orderId = id.replace(/^drafts\./, "");
  const doc = published as OrderDoc;
  const status = doc?.status;
  const lastNotified = doc?.lastNotifiedStatus;

  const send = useCallback(async () => {
    setSending(true);
    try {
      const res = await fetch("/api/orders/notify-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        skipped?: boolean;
        status?: string;
        error?: string;
        message?: string;
      };

      if (res.ok && data.success) {
        setDialog({
          type: "result",
          ok: true,
          message: `Customer emailed about the "${data.status}" status.`,
        });
      } else if (res.ok && data.skipped) {
        setDialog({
          type: "result",
          ok: false,
          message: `No email is sent for the "${data.status}" status.`,
        });
      } else {
        setDialog({
          type: "result",
          ok: false,
          message: data.message || data.error || "Failed to send email.",
        });
      }
    } catch (err) {
      setDialog({
        type: "result",
        ok: false,
        message: err instanceof Error ? err.message : "Network error.",
      });
    } finally {
      setSending(false);
    }
  }, [orderId]);

  // Guards: only email the saved (published) status, and only for notifiable ones.
  let disabledTitle: string | undefined;
  if (!published) {
    disabledTitle = "Publish the order before notifying the customer.";
  } else if (draft) {
    disabledTitle = "Publish your changes first so the saved status is emailed.";
  } else if (!status || !isNotifiableStatus(status)) {
    disabledTitle = `No customer email is sent for the "${status ?? "unknown"}" status.`;
  }

  let dialogDescriptor: DocumentActionDescription["dialog"];
  if (dialog.type === "confirm") {
    dialogDescriptor = {
      type: "confirm",
      tone: "caution",
      message: `You already emailed this customer about the "${status}" status. Send it again?`,
      confirmButtonText: "Send again",
      onConfirm: () => {
        setDialog({ type: "none" });
        void send();
      },
      onCancel: () => setDialog({ type: "none" }),
    };
  } else if (dialog.type === "result") {
    dialogDescriptor = {
      type: "dialog",
      header: dialog.ok ? "Email sent" : "Not sent",
      onClose: () => {
        setDialog({ type: "none" });
        onComplete();
      },
      content: dialog.message,
    };
  }

  return {
    label: sending ? "Sending…" : LABEL,
    tone: "primary",
    disabled: sending || Boolean(disabledTitle),
    title: disabledTitle,
    onHandle: () => {
      if (lastNotified && lastNotified === status) {
        setDialog({ type: "confirm" });
      } else {
        void send();
      }
    },
    dialog: dialogDescriptor,
  };
};
