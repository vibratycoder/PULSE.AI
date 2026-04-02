"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BloodWorkTab, LabValue } from "./BloodWork";
import { FileUpload, AttachedFileChip } from "./FileUpload";
import { MedTrackerTab } from "./MedTracker";
import { VaccinesTab } from "./VaccinesTab";
import { useAuth } from "./auth-context";
import type { HealthProfile, Message } from "./types";
import { CitationCard } from "./components/CitationCard";
import { InfoModal, InfoPopup } from "./components/InfoModal";
import { HealthProfileSidebar } from "./components/HealthProfileSidebar";
import { TypingIndicator } from "./components/TypingIndicator";
import { EditProfileView } from "./components/EditProfileView";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [activeTab, setActiveTab] = useState("research");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [infoPopup, setInfoPopup] = useState<InfoPopup | null>(null);
  const userId = user?.id || "demo-marcus-chen";
  const [fileText, setFileText] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [bloodworkLabs, setBloodworkLabs] = useState<LabValue[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("pulseai_bloodwork");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // BloodWork.tsx stores { filename, results, raw_text }
      return Array.isArray(parsed) ? parsed : parsed?.results ?? [];
    } catch { return []; }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBloodworkResults = useCallback((results: LabValue[]) => {
    setBloodworkLabs(results);
  }, []);

  const handleFileText = useCallback((text: string, filename: string) => {
    setFileText(text);
    setAttachedFile(filename);
    setShowUploadZone(false);
  }, []);

  const clearFile = useCallback(() => {
    setFileText("");
    setAttachedFile(null);
  }, []);

  const [inputDragOver, setInputDragOver] = useState(false);
  const dragLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputDragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }
      setInputDragOver(true);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      // Delay so moving between child elements doesn't flicker
      dragLeaveTimer.current = setTimeout(() => setInputDragOver(false), 50);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }
      // Don't hide immediately — FileUpload's onDrop will call handleFileText
      // which sets attachedFile, hiding the drop zone naturally
      setTimeout(() => setInputDragOver(false), 100);
    },
  };

  useEffect(() => {
    // Load saved profile from localStorage — if it exists, trust it as source of truth
    try {
      const saved = localStorage.getItem("pulseai_profile");
      if (saved) {
        setProfile(JSON.parse(saved));
        return; // User has a saved profile — don't overwrite with backend data
      }
    } catch { /* ignore */ }

    // No local profile — fetch from backend
    fetch(`/api/profile/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
          localStorage.setItem("pulseai_profile", JSON.stringify(data));
        }
      })
      .catch(() => {
        // Backend unreachable — load demo as fallback
        fetch("/api/profile/demo-marcus-chen")
          .then((r) => r.json())
          .then((data) => {
            if (data && data.name) {
              setProfile(data);
              localStorage.setItem("pulseai_profile", JSON.stringify(data));
            }
          })
          .catch(() => {});
      });
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => setMessages([]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, fileName: attachedFile || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, string> = { message: text, user_id: userId };
      if (fileText) body.file_text = fileText;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      clearFile();
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || data.detail || "Something went wrong.",
          citations: data.citations || [],
          is_emergency: data.is_emergency || false,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to the server. Make sure the backend is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1929]">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b1929]">
      {/* Health profile sidebar — LEFT side */}
      <HealthProfileSidebar profile={profile} bloodworkLabs={bloodworkLabs} onInfoClick={setInfoPopup} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative" {...inputDragHandlers}>
        {/* Top nav bar */}
        <header className="border-b border-slate-800/50 px-6 py-3 flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {["Research", "Blood Work", "Med Tracker", "Vaccines"].map((tab) => {
              const tabKey = tab.toLowerCase().replace(/ /g, "-");
              const isActive = activeTab === tabKey || (tab === "Research" && activeTab === "research");
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Action links */}
          <div className="flex items-center gap-4">
            <button
              onClick={clearChat}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Clear chat
            </button>
            <button
              onClick={() => setShowEditProfile((v) => !v)}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Edit profile
            </button>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Edit Profile view */}
        {showEditProfile && (
          <EditProfileView
            profile={profile}
            onSave={(updated) => { setProfile(updated); setShowEditProfile(false); localStorage.setItem("pulseai_profile", JSON.stringify(updated)); }}
            onCancel={() => setShowEditProfile(false)}
          />
        )}

        {/* Blood Work tab */}
        {!showEditProfile && activeTab === "blood-work" && <BloodWorkTab onResults={handleBloodworkResults} />}

        {/* Med Tracker tab */}
        {!showEditProfile && activeTab === "med-tracker" && (
          <MedTrackerTab
            medications={profile?.medications || []}
            onUpdateMedications={(meds) => {
              if (profile) {
                const updated = { ...profile, medications: meds };
                setProfile(updated);
                localStorage.setItem("pulseai_profile", JSON.stringify(updated));
              }
            }}
          />
        )}

        {/* Vaccines tab */}
        {!showEditProfile && activeTab === "vaccines" && (
          <VaccinesTab
            vaccines={profile?.vaccines || []}
            onUpdate={(vaccines) => {
              if (profile) {
                const updated = { ...profile, vaccines };
                setProfile(updated);
                localStorage.setItem("pulseai_profile", JSON.stringify(updated));
              }
            }}
          />
        )}

        {/* Chat tab */}
        {!showEditProfile && activeTab === "research" && (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Ask anything about your health
                  </h2>
                  <p className="text-slate-400 max-w-md mb-8 text-sm">
                    Try: &ldquo;What does my LDL of 158 mean?&rdquo; or attach a photo of your lab results
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-teal-600/80 text-white"
                          : msg.is_emergency
                          ? "bg-red-900/50 border border-red-700 text-red-100"
                          : "bg-slate-800/50 text-slate-200"
                      }`}
                    >
                      {msg.fileName && (
                        <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 bg-white/10 rounded-lg w-fit">
                          {msg.fileName.toLowerCase().endsWith(".pdf") ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          )}
                          <div>
                            <p className="text-xs font-medium truncate max-w-[180px]">{msg.fileName}</p>
                            <p className="text-[10px] opacity-70">{msg.fileName.split(".").pop()?.toUpperCase()} attached</p>
                          </div>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 ml-0 space-y-2 max-w-2xl">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Sources
                      </p>
                      {msg.citations.map((cite, j) => (
                        <CitationCard key={cite.pmid} citation={cite} index={j} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4">
              <div className="max-w-3xl mx-auto space-y-3">

                {/* Drop zone — shows on drag-over or button toggle, only when no file attached */}
                {(showUploadZone || inputDragOver) && !attachedFile && (
                  <FileUpload onFileText={handleFileText} onClear={clearFile} attachedFile={attachedFile} initialDragging={inputDragOver} />
                )}

                {/* Attached file chip — shown above text input when a file is ready */}
                {attachedFile && (
                  <AttachedFileChip filename={attachedFile} onClear={clearFile} />
                )}

                {/* Text input bar */}
                <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3">
                  {/* Attachment button */}
                  <button
                    onClick={() => setShowUploadZone((v) => !v)}
                    className={`transition-colors p-1 ${attachedFile ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}`}
                    title="Attach file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={attachedFile ? "Ask a question about your document..." : "Ask about your labs, symptoms, medications..."}
                    className="flex-1 bg-transparent py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                    disabled={loading}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-600">
                  Enter to send &middot; Pulse.ai is not a substitute for professional medical advice
                </p>
              </div>
            </div>
          </>
        )}


      </div>

      {/* Info popup modal */}
      {infoPopup && (
        <InfoModal popup={infoPopup} onClose={() => setInfoPopup(null)} />
      )}

    </div>
  );
}
