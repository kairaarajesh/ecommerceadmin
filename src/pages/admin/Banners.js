import React, { useState, useRef, useEffect } from 'react';
import { getBanners } from "../../api/adminApi";

// ═══════════════════════════════════════════════════════════════
//  HELPER: Handles both API URLs (string) and local uploads (object)
// ═══════════════════════════════════════════════════════════════
const getImageSrc = (logo) => {
  if (!logo) return null;
  if (typeof logo === 'string') return logo; // API URL
  if (logo?.preview) return logo.preview;   // Locally uploaded File
  return null;
};

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [modal, setModal] = useState(null); 
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const perPage = 10;

  const [formData, setFormData] = useState({ bName: '', bDescription: '' });
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ── API FETCH ON MOUNT ─────────────────────────────────
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getBanners();
        
        // Handle API response (adjust mapping based on your actual API response structure)
        const data = response.data || response;
        const formattedData = data.map(item => ({
          id: item.id || item._id,
          bName: item.title || item.name || item.bName || 'Untitled',
          bDescription: item.description || item.bDescription || '',
          bLogo: item.image || item.logo || item.bLogo || null, // Can be string URL or null
          bStatus: item.status || item.bStatus || 'Active',
          bDate: item.createdAt || item.bDate || new Date().toISOString().split('T')[0]
        }));
        
        setBanners(formattedData);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // ── FILTERING & PAGINATION ─────────────────────────────
  const filtered = banners.filter(b => b.bName.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ── LOGO UPLOAD HANDLER ────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (uploadedLogo?.preview && typeof uploadedLogo !== 'string') URL.revokeObjectURL(uploadedLogo.preview);
    
    const newLogo = { file, name: file.name, size: file.size, preview: URL.createObjectURL(file) };
    setUploadedLogo(newLogo);
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const iv = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(iv);
        setTimeout(() => setIsUploading(false), 400);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 200);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };

  // ── CRUD HANDLERS ──────────────────────────────────────
  const resetForm = () => { setFormData({ bName: '', bDescription: '' }); setUploadedLogo(null); setUploadProgress(0); setIsUploading(false); };

  const openAdd = () => { resetForm(); setModal('add'); };
  
  const openEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({ bName: banner.bName, bDescription: banner.bDescription });
    
    // If API returned a string URL, convert it to object structure for the upload zone to display it
    if (banner.bLogo && typeof banner.bLogo === 'string') {
      setUploadedLogo({ preview: banner.bLogo, name: 'Existing Banner' });
    } else {
      setUploadedLogo(banner.bLogo); 
    }
    setUploadProgress(100); setIsUploading(false);
    setModal('edit');
  };

  const openDelete = (banner) => { setSelectedBanner(banner); setDeleteLoading(false); setModal('delete'); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal === 'add') {
      setBanners([{ ...formData, id: Date.now(), bLogo: uploadedLogo, bStatus: 'Active', bDate: new Date().toISOString().split('T')[0] }, ...banners]);
    } else {
      setBanners(banners.map(b => b.id === selectedBanner.id ? { ...b, ...formData, bLogo: uploadedLogo || b.bLogo } : b));
    }
    setModal(null);
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    setTimeout(() => { setBanners(banners.filter(b => b.id !== selectedBanner.id)); setModal(null); }, 600);
  };

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        .fi:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,.1); background: #fff !important }
        .tr:hover { background: #f8f9ff }
        .ab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .pb:hover:not(.act) { border-color: #6c5ce7; color: #6c5ce7 }
        .cb:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca }
        .sb:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .db:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,.45) }
        .actbtn:hover { transform: translateY(-1px); filter: brightness(.95) }
        .upload-shimmer { background: linear-gradient(90deg, #f0ecff 25%, #e0d8ff 50%, #f0ecff 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      <div style={{ padding: '28px 32px', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>Banners</h1>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: 0 }}>{banners.length} total banners</p>
            </div>
          </div>
          <button className="ab" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' }} onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Banner
          </button>
        </div>

        {/* TOOLBAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '340px' }}>
            <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="fi" style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Search banners..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', overflow: 'hidden' }}>
          
          {/* LOADING SKELETON STATE */}
          {loading ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Image</th>
                  <th style={thS}>Banner Title</th>
                  <th style={thS}>Description</th>
                  <th style={thS}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f4f5f8' }}>
                    <td style={tdS}><div className="skeleton" style={{ width: '80px', height: '45px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '60%', height: '14px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '90%', height: '14px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '50px', height: '22px', borderRadius: '20px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '100px', height: '30px', margin: '0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : paginated.length > 0 ? (<>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Image</th>
                  <th style={thS}>Banner Title</th>
                  <th style={thS}>Description</th>
                  <th style={thS}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(b => (
                  <tr key={b.id} className="tr" style={{ transition: 'background .15s' }}>
                    <td style={tdS}>
                      <div style={{ width: '80px', height: '45px', borderRadius: '8px', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee' }}>
                        {getImageSrc(b.bLogo) ? 
                          <img src={getImageSrc(b.bLogo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        }
                      </div>
                    </td>
                    <td style={{ ...tdS, fontWeight: 600, color: '#1a1a3e' }}>{b.bName}</td>
                    <td style={{ ...tdS, color: '#666', fontSize: '12.5px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.bDescription}</td>
                    <td style={tdS}><span style={badge(b.bStatus)}>{b.bStatus}</span></td>
                    <td style={{ ...tdS, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="actbtn" onClick={() => openEdit(b)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#f0fdf4', color: '#22c55e', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button className="actbtn" onClick={() => openDelete(b)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#fef2f2', color: '#ef4444', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f0f1f5' }}>
              <span style={{ fontSize: '12px', color: '#8b8fa3' }}>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} banners</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="pb" style={pgBtn(false)} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{'‹'}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} className={`pb ${pg === currentPage ? 'act' : ''}`} style={pgBtn(pg === currentPage)} onClick={() => setCurrentPage(pg)}>{pg}</button>
                ))}
                <button className="pb" style={pgBtn(false)} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{'›'}</button>
              </div>
            </div>
          </>) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5" style={{ marginBottom: '12px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#aaa', margin: 0 }}>No banners found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ─────────────────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={modalS('sm')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>{modal === 'add' ? '➕ Add New Banner' : '✏️ Edit Banner'}</h2>
              <button className="cb" style={closeBtnS} onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '22px 26px 26px' }}>
                
                {/* IMAGE UPLOAD */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={lblS}>Banner Image</label>
                  <div style={dragActive ? { ...uploadZoneS, border: '2px dashed #6c5ce7', background: '#f5f3ff' } : uploadZoneS} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    
                    {isUploading ? (
                      <>
                        <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '10px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        </div>
                        <div style={{ fontSize: '13px', color: '#6c5ce7', fontWeight: 600 }}>Uploading... {Math.round(uploadProgress)}%</div>
                        <div className="upload-shimmer" style={{ width: '80%', height: '5px', borderRadius: '3px', background: '#e2e5f1', overflow: 'hidden', margin: '10px auto 0' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg,#6c5ce7,#a855f7)', transition: 'width .2s ease' }} />
                        </div>
                      </>
                    ) : getImageSrc(uploadedLogo) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={getImageSrc(uploadedLogo)} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eee', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>{uploadedLogo.name || 'Current Image'}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#8b8fa3', marginTop: '2px' }}>Click to change image</div>
                      </div>
                    ) : (
                      <>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c4dc" strokeWidth="1.5" style={{ marginBottom: '6px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>{dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>PNG, JPG, WEBP (Recommended: 1200x400px)</div>
                      </>
                    )}
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={lblS}>Banner Title *</label>
                    <input className="fi" style={inpS} placeholder="e.g. Summer Sale, New Arrivals" value={formData.bName} onChange={e => setFormData(p => ({ ...p, bName: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={lblS}>Description</label>
                    <textarea className="fi" style={{ ...inpS, resize: 'vertical', minHeight: '90px' }} placeholder="Brief description about the banner..." value={formData.bDescription} onChange={e => setFormData(p => ({ ...p, bDescription: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px' }}>
                <button type="button" style={cancelBtnS} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="sb" style={submitBtnS}>{modal === 'add' ? 'Add Banner' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────── */}
      {modal === 'delete' && selectedBanner && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !deleteLoading && setModal(null)}>
          <div style={modalS('sm')}>
            <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                {deleteLoading ? <div style={{ animation: 'spin 1s linear infinite' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: '0 0 8px' }}>Delete Banner?</h2>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: '0 0 4px' }}>This will remove the banner and cannot be undone.</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#555', margin: '0 0 22px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>"{selectedBanner.bName}"</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {/* FIXED SYNTAX ERROR HERE */}
                <button style={cancelBtnS} onClick={() => setModal(null)} disabled={deleteLoading}>Cancel</button>
                <button className="db" style={{ ...delBtnS, opacity: deleteLoading ? 0.7 : 1 }} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SHARED STYLE OBJECTS
// ═══════════════════════════════════════════════════════════════
const thS = { padding: '12px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '1px', background: '#fafbfe', borderBottom: '1px solid #eee' };
const tdS = { padding: '16px 20px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f4f5f8', verticalAlign: 'middle' };
const lblS = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.5px' };
const inpS = { width: '100%', padding: '9px 13px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafbfe', transition: 'all .2s' };
const overlayS = { position: 'fixed', inset: 0, background: 'rgba(15,15,35,.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn .2s ease' };
const modalS = (s) => ({ background: '#fff', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,.2)', width: s === 'sm' ? '480px' : '740px', maxWidth: '100%', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)' });
const closeBtnS = { width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #eee', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#999', transition: 'all .15s' };
const cancelBtnS = { padding: '10px 28px', background: '#f4f5f8', color: '#555', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' };
const submitBtnS = { padding: '10px 28px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' };
const delBtnS = { padding: '10px 28px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,.35)', transition: 'all .2s', fontFamily: 'inherit' };
const uploadZoneS = { border: '2px dashed #d1d5f0', borderRadius: '14px', padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: '#fafbfe' };
const pgBtn = (a) => ({ width: '34px', height: '34px', borderRadius: '9px', border: a ? 'none' : '1px solid #e2e5f1', background: a ? 'linear-gradient(135deg,#6c5ce7,#a855f7)' : '#fff', color: a ? '#fff' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: a ? 600 : 400, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });
const badge = (t) => { const m = { 'Active': { bg: '#ecfdf5', c: '#059669', b: '#a7f3d0' }, 'Inactive': { bg: '#f4f5f8', c: '#6b7280', b: '#e2e5f1' } }; const s = m[t] || m['Active']; return { display: 'inline-block', padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: s.bg, color: s.c, border: `1px solid ${s.b}` }; };

export default Banners;