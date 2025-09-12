import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL; // set di Railway service WEB

export default function Admin() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);

  async function refresh() {
    const r = await fetch(`${API}/documents`);
    const j = await r.json();
    setItems(j.items || []);
  }
  useEffect(() => { refresh(); }, []);

  async function upload() {
    if (!file) return alert("Pilih PDF dulu");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title || file.name);
    const r = await fetch(`${API}/documents/upload`, { method: "POST", body: fd });
    const j = await r.json();
    if (!j.ok) return alert(j.error || "Upload gagal");
    setFile(null); setTitle("");
    await refresh();
  }

  async function rebuild(id) {
    const r = await fetch(`${API}/documents/rebuild/${id}`, { method: "POST" });
    const j = await r.json();
    if (!j.ok) return alert(j.error || "Rebuild gagal");
    alert(`Rebuild OK: ${j.pages} pages, ${j.chunks} chunks`);
    await refresh();
  }

  return (
    <div style={{display:'grid', gap:12, padding:16}}>
      <h2>Admin — Documents</h2>

      <div style={{display:'grid', gap:8, maxWidth:480}}>
        <input
          placeholder="Judul (opsional)"
          value={title} onChange={e=>setTitle(e.target.value)}
          style={{padding:8, border:'1px solid #ccc', borderRadius:8}}
        />
        <input type="file" accept="application/pdf"
               onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} style={{padding:'8px 12px'}}>Upload PDF</button>
      </div>

      <div>
        <h3>Daftar Dokumen</h3>
        <ul style={{display:'grid', gap:8, padding:0}}>
          {items.map(x => (
            <li key={x.id} style={{listStyle:'none', border:'1px solid #ddd', borderRadius:8, padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600}}>{x.title || x.storage_path || x.file_path}</div>
                <div style={{fontSize:12, color:'#666'}}>
                  status: {x.status} • pages: {x.pages ?? '-'} • path: {x.storage_path ?? x.file_path}
                </div>
              </div>
              <button onClick={() => rebuild(x.id)} style={{padding:'6px 10px'}}>Rebuild</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
