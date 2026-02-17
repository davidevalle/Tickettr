"use client";

import { useEffect, useState } from "react";

interface GuildConfigPayload {
  supportRoleId: string;
  logChannelId: string;
  panelChannelId: string;
  ticketCategoryId: string;
}

export default function GuildSettingsForm({ guildId }: { guildId: string }) {
  const [form, setForm] = useState<GuildConfigPayload>({
    supportRoleId: "",
    logChannelId: "",
    panelChannelId: "",
    ticketCategoryId: "",
  });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const res = await fetch(`/api/guilds/${guildId}/settings`);
        const data = await res.json();

        if (!res.ok) {
          setStatus(data.error ?? "Failed to load settings.");
          return;
        }

        if (data.config) {
          setForm({
            supportRoleId: data.config.supportRoleId ?? "",
            logChannelId: data.config.logChannelId ?? "",
            panelChannelId: data.config.panelChannelId ?? "",
            ticketCategoryId: data.config.ticketCategoryId ?? "",
          });
        }
      } catch {
        setStatus("Unexpected error while loading settings.");
      } finally {
        setLoading(false);
      }
    }

    void loadConfig();
  }, [guildId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("Saving...");

    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(res.ok ? "Saved." : data.error ?? "Failed to save.");
    } catch {
      setStatus("Unexpected error while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading settings...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4" aria-label="Guild settings form">
      <label className="block text-sm">
        Support role ID
        <input
          required
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.supportRoleId}
          onChange={(event) => setForm((prev) => ({ ...prev, supportRoleId: event.target.value.trim() }))}
        />
      </label>

      <label className="block text-sm">
        Log channel ID
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.logChannelId}
          onChange={(event) => setForm((prev) => ({ ...prev, logChannelId: event.target.value.trim() }))}
        />
      </label>

      <label className="block text-sm">
        Panel channel ID
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.panelChannelId}
          onChange={(event) => setForm((prev) => ({ ...prev, panelChannelId: event.target.value.trim() }))}
        />
      </label>

      <label className="block text-sm">
        Ticket category ID
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.ticketCategoryId}
          onChange={(event) => setForm((prev) => ({ ...prev, ticketCategoryId: event.target.value.trim() }))}
        />
      </label>

      <button type="submit" disabled={saving} className="rounded bg-indigo-500 px-4 py-2 text-white disabled:opacity-70">
        {saving ? "Saving..." : "Save settings"}
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </form>
  );
}
