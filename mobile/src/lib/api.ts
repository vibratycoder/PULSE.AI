// Point this at your backend server IP.
// Using your machine's local network IP so Expo Go on a physical device works.
// Change this if your IP changes.
export const API_BASE = "http://10.94.22.11:8000";

export interface Citation {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  abstract: string;
}

export interface ChatResponse {
  response: string;
  citations: Citation[];
  is_emergency: boolean;
}

export async function sendChat(
  message: string,
  userId: string,
  fileText?: string
): Promise<ChatResponse> {
  const body: Record<string, string> = { message, user_id: userId };
  if (fileText) body.file_text = fileText;

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function uploadFile(uri: string, filename: string): Promise<{ filename: string; text: string }> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type: filename.endsWith(".pdf") ? "application/pdf" : "text/plain",
  } as any);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
  return res.json();
}

export async function parseBloodwork(uri: string, filename: string) {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type: "application/pdf",
  } as any);

  const res = await fetch(`${API_BASE}/api/bloodwork/parse`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Parse error: ${res.status}`);
  return res.json();
}

export async function fetchProfile(userId: string) {
  const res = await fetch(`${API_BASE}/api/profile/${userId}`);
  if (!res.ok) throw new Error("Profile not found");
  return res.json();
}
