import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [chunks, setChunks] = useState([]);

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

  async function viewChunks(id) {
    setViewDoc(id);
    const r = await fetch(`${API}/documents/${id}/chunks?limit=200`);
    const j = await r.json();
    setChunks(j.items || []);
  }

  return (
    <div style={{display:'grid', gap:12, padding:16}}>
      <h2>Admin — Documents</h2>

      <div style={{display:'grid', gap:8, maxWidth:480}}>
        <input placeholder="Judul (opsional)" value={title}
               onChange={e=>setTitle(e.target.value)}
               style={{padding:8, border:'1px solid #ccc', borderRadius:8}} />
        <input type="file" accept="application/pdf"
               onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} style={{padding:'8px 12px'}}>Upload PDF</button>
      </div>

      <h3>Daftar Dokumen</h3>
      <ul style={{display:'grid', gap:8, padding:0}}>
        {items.map(x => (
          <li key={x.id} style={{listStyle:'none', border:'1px solid #ddd', borderRadius:8, padding:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600}}>{x.title || x.storage_path || x.file_path}</div>
                <div style={{fontSize:12, color:'#666'}}>
                  status: {x.status} • pages: {x.pages ?? '-'}
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>rebuild(x.id)}>Rebuild</button>
                <button onClick={()=>viewChunks(x.id)}>Lihat Chunks</button>
              </div>
            </div>

            {/* Panel chunks */}
            {viewDoc === x.id && (
              <div style={{marginTop:8, background:'#fafafa', border:'1px solid #eee', borderRadius:8, padding:12, maxHeight:300, overflow:'auto'}}>
                {chunks.length === 0 ? (
                  <div style={{color:'#888'}}>Belum ada chunks.</div>
                ) : (
                  <ol>
                    {chunks.map(c => (
                      <li key={c.id} style={{marginBottom:12}}>
                        <div style={{fontSize:12, color:'#444'}}>#{c.chunk_index}</div>
                        <pre style={{whiteSpace:'pre-wrap', margin:0}}>{c.content}</pre>
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
