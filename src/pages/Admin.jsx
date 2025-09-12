import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // normalize tanpa trailing /
if (!API_BASE) console.warn("[Admin] VITE_API_URL belum di-set");

export default function Admin() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rebuildId, setRebuildId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const api = useMemo(() => API_BASE, []);

  async function fetchJSON(path, opts = {}) {
    const r = await fetch(`${api}${path}`, {
      headers: { ...(opts.headers || {}) },
      ...opts,
    });
    const text = await r.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    if (!r.ok) {
      const msg = body?.error || body?.message || body?.raw || `HTTP ${r.status}`;
      throw new Error(msg);
    }
    return body;
  }

  async function refresh() {
    try {
      setLoading(true);
      setErrorMsg("");
      const j = await fetchJSON(`/documents`);
      setItems(j.items || []);
    } catch (e) {
      setErrorMsg(String(e.message || e));
      console.error("[Admin] refresh:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function upload() {
    if (!file) return alert("Pilih PDF dulu");
    try {
      setUploading(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || file.name);
      const r = await fetch(`${api}/documents/upload`, { method: "POST", body: fd });
      const text = await r.text();
      let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
      if (!r.ok || !j.ok) throw new Error(j.error || j.raw || "Upload gagal");
      setFile(null); setTitle("");
      await refresh();
    } catch (e) {
      alert(e.message || String(e));
      setErrorMsg(String(e.message || e));
    } finally {
      setUploading(false);
    }
  }

  async function rebuild(id) {
    try {
      setRebuildId(id);
      setErrorMsg("");
      const j = await fetchJSON(`/documents/rebuild/${id}`, { method: "POST" });
      // Indexer bisa mengembalikan {ok:true, pages, chunks} atau payload lain — cukup tampilkan apa adanya
      const pages = j.pages ?? "-";
      const chunksN = j.chunks ?? j.n_chunks ?? "-";
      alert(`Rebuild OK: pages=${pages}, chunks=${chunksN}`);
      await refresh();
    } catch (e) {
      alert(`Rebuild gagal: ${e.message || e}`);
      setErrorMsg(String(e.message || e));
    } finally {
      setRebuildId(null);
    }
  }

  async function viewChunks(id) {
    try {
      setViewDoc(id);
      setChunks([]);
      const j = await fetchJSON(`/documents/${id}/chunks?limit=200`);
      setChunks(j.items || []);
    } catch (e) {
      setErrorMsg(String(e.message || e));
      console.error("[Admin] viewChunks:", e);
    }
  }

  function Pill({ children, color = "#eef" }) {
    return (
      <span style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: color,
        fontSize: 12,
      }}>{children}</span>
    );
  }

  function statusPill(status) {
    const s = (status || "").toLowerCase();
    if (s === "embedded") return <Pill color="#e6ffed">embedded</Pill>;
    if (s === "indexed")  return <Pill color="#fff8e1">indexed</Pill>;
    if (s === "uploaded") return <Pill color="#eaf2ff">uploaded</Pill>;
    if (s === "error")    return <Pill color="#ffecec">error</Pill>;
    return <Pill>{status || "unknown"}</Pill>;
  }

  return (
    <div style={{ display: "grid", gap: 12, padding: 16 }}>
      <h2>Admin — Documents</h2>
      <div style={{ fontSize: 12, color: "#666" }}>
        API: <code>{api || "(VITE_API_URL belum di-set)"}</code>
      </div>

      {errorMsg && (
        <div style={{ background: "#ffecec", border: "1px solid #f5c2c2", color: "#a00",
                      padding: 10, borderRadius: 8 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label htmlFor="title" style={{ fontSize: 12, color: "#555" }}>Judul (opsional)</label>
        <input
          id="title"
          name="title"
          placeholder="Judul (opsional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <label htmlFor="pdf" style={{ fontSize: 12, color: "#555" }}>File PDF</label>
        <input
          id="pdf"
          name="file"
          type="file"
          accept="application/pdf"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={upload}
            disabled={uploading || !file}
            aria-busy={uploading}
            style={{ padding: "8px 12px", opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? "Uploading…" : "Upload PDF"}
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            aria-busy={loading}
            style={{ padding: "8px 12px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <h3>Daftar Dokumen</h3>
      <ul style={{ display: "grid", gap: 8, padding: 0 }}>
        {items.map((x) => (
          <li key={x.id} style={{ listStyle: "none", border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, wordBreak: "break-word" }}>
                  {x.title || x.storage_path || x.file_path}
                </div>
                <div style={{ fontSize: 12, color: "#666", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span>ID: <code>{x.id}</code></span>
                  <span>pages: {x.pages ?? "-"}</span>
                  <span>size: {x.size ? `${x.size} B` : "-"}</span>
                  {statusPill(x.status)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => rebuild(x.id)}
                  disabled={!!rebuildId}
                  aria-busy={rebuildId === x.id}
                  title="Extract → Chunk → Embed"
                >
                  {rebuildId === x.id ? "Rebuilding…" : "Rebuild"}
                </button>
                <button onClick={() => viewChunks(x.id)}>
                  Lihat Chunks
                </button>
              </div>
            </div>

            {/* Panel chunks */}
            {viewDoc === x.id && (
              <div
                style={{
                  marginTop: 8,
                  background: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 360,
                  overflow: "auto",
                }}
              >
                {chunks.length === 0 ? (
                  <div style={{ color: "#888" }}>Belum ada chunks.</div>
                ) : (
                  <ol style={{ paddingLeft: 18 }}>
                    {chunks.map((c) => (
                      <li key={c.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: "#444" }}>
                          #{c.chunk_index}
                        </div>
                        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{c.content}</pre>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
