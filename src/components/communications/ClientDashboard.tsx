"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import type { ClientWire } from "@/lib/demo-db";

const noopSubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

type ToastState = { kind: "success" | "error"; text: string } | null;

type ClientDashboardProps = {
  /** Shown in the UI; comes from server (`TWILIO_WHATSAPP_TO`). */
  whatsappDeliveryE164: string;
};

export function ClientDashboard({ whatsappDeliveryE164 }: ClientDashboardProps) {
  const isClient = useIsClient();
  const [clientList, setClientList] = useState<ClientWire[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addingClient, setAddingClient] = useState(false);

  const [summary, setSummary] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);

  const [loading, setLoading] = useState<"update" | "warning" | "voice" | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewDemo, setPreviewDemo] = useState(false);
  const [previewSid, setPreviewSid] = useState<string | undefined>();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return;
    fetchClients();
  }, [isClient]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      const list: ClientWire[] = data.clients ?? [];
      setClientList(list);
      if (list.length === 0) {
        setSelectedId("");
        setPreview(null);
        return;
      }
      setSelectedId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0].id));
    } catch {
      // network not ready yet — silently ignore
    }
  }

  if (!isClient) return null;

  const selectedClient = clientList.find((c) => c.id === selectedId);

  function showToast(kind: "success" | "error", text: string) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 5000);
  }

  function addTask() {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, trimmed]);
    setTaskInput("");
  }

  function removeTask(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddClient() {
    if (!newName.trim() || !newPhone.trim()) {
      showToast("error", "Enter a name and a mobile number (with country code).");
      return;
    }
    setAddingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClientList((prev) => [...prev, data.client]);
        setSelectedId(data.client.id);
        setNewName("");
        setNewPhone("");
        showToast("success", `${data.client.name} added.`);
      } else {
        showToast("error", data.error ?? "Failed to add client.");
      }
    } catch {
      showToast("error", "Network error.");
    } finally {
      setAddingClient(false);
    }
  }

  async function handleDeleteClient(id: string) {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      const next = clientList.filter((c) => c.id !== id);
      setClientList(next);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? "");
        setPreview(null);
        setAudioUrl(null);
      }
      showToast("success", "Client removed.");
    } else {
      showToast("error", data.error ?? "Failed to remove client.");
    }
  }

  async function sendUpdate() {
    if (!selectedId) { showToast("error", "Add a client first."); return; }
    if (!summary.trim() || tasks.length === 0) {
      showToast("error", "Fill in the summary and add at least one task.");
      return;
    }
    setLoading("update");
    setPreview(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/communications/send-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedId,
          updateSummary: summary,
          checklist: tasks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.preview);
        setPreviewDemo(!!data.demo);
        setPreviewSid(data.twilioSid);
        setSummary("");
        setTasks([]);
        setClientList((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, status: "Pending Review", last_update_sent_at: new Date().toISOString(), pending_checklist: tasks }
              : c
          )
        );
        showToast(
          "success",
          data.demo
            ? "Logged (demo — configure Twilio for WhatsApp)."
            : `WhatsApp sent. SID: ${data.twilioSid ?? "n/a"}`
        );
      } else {
        const msg = data.error ?? "Failed to send update.";
        showToast("error", msg);
        if (String(msg).toLowerCase().includes("client not found")) {
          await fetchClients();
        }
      }
    } catch {
      showToast("error", "Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function sendWarning() {
    if (!selectedId) { showToast("error", "Add a client first."); return; }
    setLoading("warning");
    setPreview(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/communications/send-warning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedId }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.preview);
        setPreviewDemo(!!data.demo);
        setPreviewSid(data.twilioSid);
        setClientList((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, status: "Paused", warning_level: data.warningLevel } : c
          )
        );
        showToast(
          "success",
          data.demo
            ? `Warning logged (demo). Level: ${data.warningLevel}.`
            : `Warning on WhatsApp. Level ${data.warningLevel}. SID: ${data.twilioSid ?? "n/a"}`
        );
      } else {
        const msg = data.error ?? "Failed to send warning.";
        showToast("error", msg);
        if (String(msg).toLowerCase().includes("client not found")) {
          await fetchClients();
        }
      }
    } catch {
      showToast("error", "Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function generateVoice() {
    if (!preview) return;
    setLoading("voice");
    setAudioUrl(null);
    try {
      const res = await fetch("/api/communications/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: preview }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast("error", err.error ?? "Voice generation failed.");
        return;
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      showToast("success", "Voice note ready — press play.");
    } catch {
      showToast("error", "Network error during voice generation.");
    } finally {
      setLoading(null);
    }
  }

  const statusColor: Record<string, string> = {
    "In Progress": "bg-emerald-100 text-emerald-700",
    "Pending Review": "bg-amber-100 text-amber-700",
    "Paused": "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl px-5 py-4 text-sm font-medium shadow-xl ${toast.kind === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {toast.text}
        </div>
      )}

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Add Client</h2>
        <p className="mt-1 text-sm text-slate-500">
          WhatsApp deliveries always go to <span className="font-semibold text-slate-700">{whatsappDeliveryE164}</span>. Add a name and a reference mobile for this workspace (message content still uses the selected client name).
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
              placeholder="e.g. Aryan Yadav"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Reference mobile</label>
            <div className="flex">
              <span className="flex items-center rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 select-none">+</span>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
                placeholder="919876543210"
                className="flex-1 rounded-r-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <button
            onClick={handleAddClient}
            disabled={addingClient}
            className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingClient ? "Adding…" : "Add Client"}
          </button>
        </div>
      </div>

      {clientList.length > 0 && (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Select Client</h2>
          <p className="mt-1 text-sm text-slate-500">Choose who you are reporting to.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {clientList.map((c) => (
              <div key={c.id} className="flex items-center gap-1">
                <button
                  onClick={() => { setSelectedId(c.id); setPreview(null); setAudioUrl(null); }}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    c.id === selectedId
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {c.name}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.id === selectedId ? "bg-white/20 text-white" : (statusColor[c.status] ?? "bg-slate-100 text-slate-600")}`}>
                    {c.status}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteClient(c.id)}
                  title="Remove client"
                  className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Status">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColor[selectedClient.status] ?? "bg-slate-100 text-slate-600"}`}>
              {selectedClient.status}
            </span>
          </Stat>
          <Stat label="WhatsApp to">
            <span className="text-sm font-medium text-slate-800">{whatsappDeliveryE164}</span>
            <p className="mt-1 text-xs text-slate-400">Ref. {selectedClient.phone}</p>
          </Stat>
          <Stat label="Last Update">
            <span className="text-sm font-medium text-slate-800">
              {selectedClient.last_update_sent_at ? new Date(selectedClient.last_update_sent_at).toLocaleString() : "Never"}
            </span>
          </Stat>
          <Stat label="Warning Level">
            <span className={`text-2xl font-semibold ${selectedClient.warning_level > 0 ? "text-rose-600" : "text-slate-950"}`}>
              {selectedClient.warning_level}
            </span>
          </Stat>
        </div>
      )}

      {selectedClient && (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Send Progress Update</h2>
          <p className="mt-1 text-sm text-slate-500">Write a summary and list completed tasks.</p>
          <div className="mt-5 flex flex-col gap-4">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Homepage is live, CMS connected. Awaiting your content sign-off."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <div className="flex gap-2">
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a completed task — press Enter or +"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <button onClick={addTask} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition">+</button>
            </div>
            {tasks.length > 0 && (
              <ul className="flex flex-col gap-2">
                {tasks.map((task, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                    <span>✅ {task}</span>
                    <button onClick={() => removeTask(i)} className="ml-4 text-emerald-400 hover:text-rose-500 transition">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="flex flex-wrap gap-4">
          <button
            onClick={sendUpdate}
            disabled={loading !== null}
            className="flex-1 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "update" ? "Sending Update…" : "Send Update"}
          </button>
          <button
            onClick={sendWarning}
            disabled={loading !== null}
            className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-700 shadow-md hover:bg-rose-100 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "warning" ? "Sending Warning…" : "Send Warning"}
          </button>
        </div>
      )}

      {preview && (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Message Preview</h2>
              <p className="mt-1 text-xs text-slate-400">
                {previewDemo
                  ? "Demo mode — set Twilio env vars (including TWILIO_WHATSAPP_TO) to send real WhatsApp."
                  : `Delivered via Twilio WhatsApp → ${whatsappDeliveryE164}. SID: ${previewSid ?? "n/a"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {previewDemo
                ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Demo</span>
                : <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Sent via WhatsApp</span>
              }
              <button
                onClick={generateVoice}
                disabled={loading !== null}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "voice" ? "Generating…" : "🎙 Voice Note"}
              </button>
            </div>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-sm leading-7 text-slate-700">
            {preview}
          </pre>
          {audioUrl && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Voice Note</p>
              <audio controls src={audioUrl} className="w-full rounded-xl" />
            </div>
          )}
        </div>
      )}

      {clientList.length === 0 && (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/50 p-10 text-center text-slate-400">
          <p className="text-lg font-medium">No clients yet</p>
          <p className="mt-1 text-sm">Add a contact to start sending WhatsApp updates to {whatsappDeliveryE164}.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
