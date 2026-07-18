import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAllCategory, postCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const perPage = 10;

  // ── Category form ─────────────────────────────────────
  const [catForm, setCatForm] = useState({ cname: '', cdescription: '', cstatus: 'Active' });
  const [catImage, setCatImage] = useState(null);
  const [catUploading, setCatUploading] = useState(false);
  const [catProgress, setCatProgress] = useState(0);
  const [catDrag, setCatDrag] = useState(false);
  const catFileRef = useRef(null);

  // ── Subcategory form ──────────────────────────────────
  const [subForm, setSubForm] = useState({ name: '', description: '' });
  const [subImage, setSubImage] = useState(null);
  const [subUploading, setSubUploading] = useState(false);
  const [subProgress, setSubProgress] = useState(0);
  const [subDrag, setSubDrag] = useState(false);
  const subFileRef = useRef(null);

  // ═══════════════════════════════════════════════════════
  //  STYLE CONSTANTS — before return
  // ═══════════════════════════════════════════════════════
  const thS = { padding: '12px 18px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '1px', background: '#fafbfe', borderBottom: '1px solid #eee' };
  const tdS = { padding: '14px 18px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f4f5f8', verticalAlign: 'middle' };
  const lblS = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.5px' };
  const inpS = { width: '100%', padding: '9px 13px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafbfe', transition: 'all .2s' };
  const overlayS = { position: 'fixed', inset: 0, background: 'rgba(15,15,35,.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn .2s ease' };
  const modalSz = (s) => ({ background: '#fff', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,.2)', width: s === 'sm' ? '500px' : '600px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)' });
  const closeBtnS = { width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #eee', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#999', transition: 'all .15s' };
  const cancelBtnS = { padding: '10px 28px', background: '#f4f5f8', color: '#555', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' };
  const submitBtnS = { padding: '10px 28px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' };
  const delBtnS = { padding: '10px 28px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,.35)', transition: 'all .2s', fontFamily: 'inherit' };
  const uploadZoneS = { border: '2px dashed #d1d5f0', borderRadius: '14px', padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: '#fafbfe' };
  const pgBtn = (a) => ({ width: '34px', height: '34px', borderRadius: '9px', border: a ? 'none' : '1px solid #e2e5f1', background: a ? 'linear-gradient(135deg,#6c5ce7,#a855f7)' : '#fff', color: a ? '#fff' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: a ? 600 : 400, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });

  // ═══════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════
  const getImg = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img?.preview) return img.preview;
    if (img?.url) return img.url;
    return null;
  };

  const statusBadge = (status) => {
    if ( status === true) return { background: '#ecfdf5', color: '#059669', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    if ( status === false) return { background: '#fef2f2', color: '#dc2626', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    return { background: '#f4f6fb', color: '#555', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
  };

  // ═══════════════════════════════════════════════════════
  //  FETCH
  // ═══════════════════════════════════════════════════════
const fetchCategories = useCallback(async () => {
  try {
    setLoading(true);
    const response = await getAllCategory();

    // ✅ Safely extract array from ANY response shape
    let data;
    if (Array.isArray(response)) {
      data = response;
    }  else {
      // Fallback: search all values for first array
      data = Object.values(response || {}).find(v => Array.isArray(v)) || [];
    }

    const formatted = data.map(cat => ({
      id: cat._id || cat.id,
      cname: cat.cname || cat.name || '',
      cdescription: cat.cdescription || cat.description || '',
      cstatus: cat.cstatus || cat.status || 'Active',
      cimage: cat.cimage || cat.image || null,
      subCategories: cat.subCategories || cat.subcategories || [],
    }));

    setCategories(formatted);
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    setLoading(false);
  }
}, []);

  const fetchedRef = useRef(false);
  useEffect(() => { if (fetchedRef.current) return; fetchedRef.current = true; fetchCategories(); }, [fetchCategories]);

  // ── FILTERING & PAGINATION ─────────────────────────────
  const filtered = categories.filter(c => c.cname.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ═══════════════════════════════════════════════════════
  //  IMAGE UPLOAD HELPERS
  // ═══════════════════════════════════════════════════════
  const simulateUpload = (file, setImg, setUploading, setProgress) => {
    if (!file || !file.type.startsWith('image/')) return;
    const newImg = { file, name: file.name, size: file.size, preview: URL.createObjectURL(file) };
    setImg(newImg);
    setUploading(true);
    setProgress(0);
    let prog = 0;
    const iv = setInterval(() => {
      prog += Math.random() * 25 + 10;
      if (prog >= 100) { prog = 100; clearInterval(iv); setTimeout(() => setUploading(false), 400); }
      setProgress(Math.min(prog, 100));
    }, 200);
  };

  const dragHandlers = (setDrag) => ({
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDrag(true); },
    onDragLeave: (e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); },
    onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); },
    onDrop: (e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); },
  });

  // ═══════════════════════════════════════════════════════
  //  CATEGORY CRUD
  // ═══════════════════════════════════════════════════════
  const resetCatForm = () => {
    setCatForm({ cname: '', cdescription: '', cstatus: 'Active' });
    setCatImage(null); setCatUploading(false); setCatProgress(0);
  };

  const openAddCat = () => { resetCatForm(); setModal('addCat'); };

  const openEditCat = (cat) => {
    setSelectedCategory(cat);
    setCatForm({ cname: cat.cname, cdescription: cat.cdescription, cstatus: cat.cstatus });
    if (cat.cimage) {
      setCatImage(typeof cat.cimage === 'string' ? { preview: cat.cimage, name: 'Existing' } : cat.cimage);
    } else { setCatImage(null); }
    setCatUploading(false); setCatProgress(0);
    setModal('editCat');
  };

  const openDeleteCat = (cat) => { setSelectedCategory(cat); setDeleteLoading(false); setModal('deleteCat'); };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.cname.trim()) { alert('Please enter category name'); return; }
    try {
      setSubmitLoading(true);
      const fd = new FormData();
      fd.append("cname", catForm.cname);
      fd.append("cdescription", catForm.cdescription);
      fd.append("cstatus", catForm.cstatus);
      if (catImage?.file) fd.append('cimage', catImage.file);

      if (modal === 'addCat') {
        await postCategory(fd);
      } else {
        await updateCategory(selectedCategory.id, fd);
      }
      await fetchCategories();
      setModal(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to save category');
    } finally { setSubmitLoading(false); }
  };

  const handleDeleteCat = async () => {
    setDeleteLoading(true);
    try {
      await deleteCategory(selectedCategory.id);
      if (expandedId === selectedCategory.id) setExpandedId(null);
      await fetchCategories();
      setModal(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    } finally { setDeleteLoading(false); }
  };

  // ═══════════════════════════════════════════════════════
  //  SUBCATEGORY CRUD
  // ═══════════════════════════════════════════════════════
  const resetSubForm = () => {
    setSubForm({ name: '', description: '' });
    setSubImage(null); setSubUploading(false); setSubProgress(0);
  };

  const openAddSub = (cat) => {
    setSelectedCategory(cat);
    resetSubForm();
    setModal('addSub');
  };

  const openEditSub = (cat, sub) => {
    setSelectedCategory(cat);
    setSelectedSub(sub);
    setSubForm({ name: sub.name || '', description: sub.description || '' });
    if (sub.image) {
      setSubImage(typeof sub.image === 'string' ? { preview: sub.image, name: 'Existing' } : sub.image);
    } else { setSubImage(null); }
    setSubUploading(false); setSubProgress(0);
    setModal('editSub');
  };

  const openDeleteSub = (cat, sub) => {
    setSelectedCategory(cat);
    setSelectedSub(sub);
    setDeleteLoading(false);
    setModal('deleteSub');
  };

  /** Save subcategory by updating parent category */
  const saveSubToCategory = async (catId, newSubcategories) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const fd = new FormData();
    fd.append("cname", catForm.cname);
    fd.append("cdescription", catForm.cdescription);
    fd.append("cstatus", catForm.cstatus);
    fd.append('subCategories', JSON.stringify(newSubcategories));
    if (cat.cimage && typeof cat.cimage === 'string') fd.append('cimage', catForm.cimage);
    await updateCategory(catId, fd);
    await fetchCategories();
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) { alert('Please enter subcategory name'); return; }
    try {
      setSubmitLoading(true);
      const catId = selectedCategory.id;
      const existingSubs = selectedCategory.subCategories || [];

      const newSub = {
        name: subForm.name,
        description: subForm.description,
        image: subImage?.preview || null,
      };

      if (modal === 'addSub') {
        await saveSubToCategory(catId, [...existingSubs, newSub]);
      } else {
        const updated = existingSubs.map(s =>
          (s._id || s.id) === (selectedSub._id || selectedSub.id) ? { ...s, ...newSub } : s
        );
        await saveSubToCategory(catId, updated);
      }
      setModal(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Failed to save subcategory');
    } finally { setSubmitLoading(false); }
  };

  const handleDeleteSub = async () => {
    setDeleteLoading(true);
    try {
      const catId = selectedCategory.id;
      const subId = selectedSub._id || selectedSub.id;
      const filtered = (selectedCategory.subCategories || []).filter(s => (s._id || s.id) !== subId);
      await saveSubToCategory(catId, filtered);
      setModal(null);
    } catch (error) {
      console.error('Delete sub error:', error);
      alert(error.response?.data?.message || 'Failed to delete subcategory');
    } finally { setDeleteLoading(false); }
  };

  const toggleExpand = (id) => { setExpandedId(prev => prev === id ? null : id); };

  // ═══════════════════════════════════════════════════════
  //  UPLOAD ZONE RENDERER
  // ═══════════════════════════════════════════════════════
  const renderUploadZone = (image, uploading, progress, dragActive, fileRef, onFile, dragSet, disabled) => (
    <div
      style={dragActive ? { ...uploadZoneS, border: '2px dashed #6c5ce7', background: '#f5f3ff' } : uploadZoneS}
      {...dragHandlers(dragSet)}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); dragSet(false); if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]); }}
      onClick={() => !disabled && fileRef.current?.click()}
    >
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} disabled={disabled} />
      {uploading ? (
        <>
          <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '10px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          </div>
          <div style={{ fontSize: '13px', color: '#6c5ce7', fontWeight: 600 }}>Uploading... {Math.round(progress)}%</div>
          <div className="upload-shimmer" style={{ width: '80%', height: '5px', borderRadius: '3px', background: '#e2e5f1', overflow: 'hidden', margin: '10px auto 0' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg,#6c5ce7,#a855f7)', transition: 'width .2s ease' }} />
          </div>
        </>
      ) : getImg(image) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={getImg(image)} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eee', marginBottom: '8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>{image.name || 'Current Image'}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#8b8fa3', marginTop: '2px' }}>Click to change</div>
        </div>
      ) : (
        <>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c4dc" strokeWidth="1.5" style={{ marginBottom: '6px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>{dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>PNG, JPG, WEBP</div>
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes expandRow { from { opacity: 0; max-height: 0 } to { opacity: 1; max-height: 600px } }
        .fi:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,.1); background: #fff !important }
        .tr-cat:hover { background: #f8f9ff }
        .tr-cat { cursor: pointer }
        .ab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .pb:hover:not(.act) { border-color: #6c5ce7; color: #6c5ce7 }
        .cb:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca }
        .sb:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .db:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,.45) }
        .actbtn:hover { transform: translateY(-1px); filter: brightness(.95) }
        .upload-shimmer { background: linear-gradient(90deg, #f0ecff 25%, #e0d8ff 50%, #f0ecff 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        .btn-disabled { opacity: 0.6; cursor: not-allowed; pointer-events: none; }
        .sub-card { transition: all .2s; border: 1px solid #eee; border-radius: 14px; padding: 16px; background: #fff; }
        .sub-card:hover { border-color: #c5bfff; box-shadow: 0 4px 16px rgba(108,92,231,.08); transform: translateY(-2px) }
        .add-sub-card { transition: all .2s; border: 2px dashed #d1d5f0; border-radius: 14px; padding: 16px; background: #fafbfe; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px; }
        .add-sub-card:hover { border-color: #6c5ce7; background: #f5f3ff; }
        .expand-zone { animation: expandRow .3s ease forwards; overflow: hidden; }
      `}</style>

      <div style={{ padding: '28px 32px', fontFamily: "'Inter',-apple-system,sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>Categories</h1>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: 0 }}>{categories.length} total categories</p>
            </div>
          </div>
          <button className="ab" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' }} onClick={openAddCat}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Category
          </button>
        </div>

        {/* TOOLBAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '340px' }}>
            <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="fi" style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Search categories..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', overflow: 'hidden' }}>

          {loading ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}></th>
                  <th style={thS}>Image</th>
                  <th style={thS}>Category Name</th>
                  <th style={thS}>Description</th>
                  <th style={thS}>subCategories</th>
                  <th style={thS}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f4f5f8' }}>
                    <td style={tdS}><div className="skeleton" style={{ width: '20px', height: '20px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '10px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '60%', height: '14px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '90%', height: '14px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '10px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '10px' }} /></td>
                    <td style={tdS}><div className="skeleton" style={{ width: '120px', height: '30px', margin: '0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : paginated.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thS, width: '40px' }}></th>
                  <th style={thS}>Image</th>
                  <th style={thS}>Category Name</th>
                  <th style={thS}>Description</th>
                  <th style={thS}>subCategories</th>
                  <th style={thS}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(cat => {
                 
                  const isExpanded = expandedId === cat.id;
                  const subs = cat.subCategories || [];
                  return (
                    <React.Fragment key={cat._id}>
                      {/* CATEGORY ROW — clickable to expand */}
                      <tr className="tr-cat" onClick={() => toggleExpand(cat.id)} style={{ transition: 'background .15s', background: isExpanded ? '#f8f7ff' : undefined }}>
                        <td style={tdS}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isExpanded ? '#6c5ce7' : '#bbb'} strokeWidth="2.5" style={{ transition: 'transform .25s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}><polyline points="9 18 15 12 9 6"/></svg>
                        </td>
                        <td style={tdS}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee' }}>
                            {getImg(cat.cimage) ?
                              <img src={getImg(cat.cimage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            }
                          </div>
                        </td>
                        <td style={{ ...tdS, fontWeight: 600, color: '#1a1a3e' }}>{cat.cname}</td>
                        <td style={{ ...tdS, color: '#666', fontSize: '12.5px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.cdescription || '—'}</td>
                        <td style={tdS}>
                          <span style={{ background: '#f0ecff', color: '#6c5ce7', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{subs.length}</span>
                          <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '4px' }}>sub{subs.length !== 1 ? 's' : ''}</span>
                        </td>
                        <td style={tdS}><span style={statusBadge(cat.cstatus)}>{cat.cstatus ? 'Active' : 'Incative'}</span></td>
                        <td style={{ ...tdS, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button className="actbtn" onClick={() => openEditCat(cat)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#f0fdf4', color: '#22c55e', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            <button className="actbtn" onClick={() => openDeleteCat(cat)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#fef2f2', color: '#ef4444', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED SUBCATEGORIES ROW */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: 0, borderBottom: '1px solid #eee' }}>
                            <div className="expand-zone" style={{ padding: '24px 28px', background: 'linear-gradient(135deg,#fafaff,#f8f7ff)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6c5ce7' }} />
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a3e' }}>Subcategories of "{cat.cname}"</span>
                                  <span style={{ background: '#f0ecff', color: '#6c5ce7', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{subs.length}</span>
                                </div>
                              </div>

                              {subs.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                                  {subs.map((sub, idx) => {
                                    const subId = sub._id || sub.id || idx;
                                    const subImg = getImg(sub.image);
                                    return (
                                      <div key={subId} className="sub-card">
                                        {/* Subcategory image */}
                                        <div style={{ width: '100%', height: '110px', borderRadius: '10px', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '12px', border: '1px solid #eee' }}>
                                          {subImg ?
                                            <img src={subImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                          }
                                        </div>
                                        {/* Subcategory info */}
                                        <div style={{ fontWeight: 600, color: '#1a1a3e', fontSize: '13px', marginBottom: '4px' }}>{sub.name}</div>
                                        <div style={{ fontSize: '12px', color: '#8b8fa3', lineHeight: 1.4, marginBottom: '12px', minHeight: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{sub.description || 'No description'}</div>
                                        {/* Subcategory actions */}
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                          <button className="actbtn" onClick={() => openEditSub(cat, sub)} style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: '#f0fdf4', color: '#22c55e', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'inherit' }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            Edit
                                          </button>
                                          <button className="actbtn" onClick={() => openDeleteSub(cat, sub)} style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: '#fef2f2', color: '#ef4444', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'inherit' }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* ADD SUBCATEGORY CARD */}
                                  <div className="add-sub-card" onClick={() => openAddSub(cat)}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6c5ce7' }}>Add Subcategory</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="add-sub-card" onClick={() => openAddSub(cat)} style={{ maxWidth: '260px' }}>
                                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#6c5ce7' }}>Add First Subcategory</span>
                                  <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>No subCategories yet</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5" style={{ marginBottom: '12px' }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#aaa', margin: '0 0 16px' }}>{searchTerm ? 'No categories found' : 'No categories yet'}</p>
              {!searchTerm && (
                <button onClick={openAddCat} className="ab" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add First Category
                </button>
              )}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && paginated.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f0f1f5' }}>
              <span style={{ fontSize: '12px', color: '#8b8fa3' }}>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} categories</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="pb" style={pgBtn(false)} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{'‹'}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} className={`pb ${pg === currentPage ? 'act' : ''}`} style={pgBtn(pg === currentPage)} onClick={() => setCurrentPage(pg)}>{pg}</button>
                ))}
                <button className="pb" style={pgBtn(false)} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{'›'}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════ */}

      {/* ── ADD / EDIT CATEGORY MODAL ───────────────────── */}
      {(modal === 'addCat' || modal === 'editCat') && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !submitLoading && setModal(null)}>
          <div style={modalSz('sm')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>{modal === 'addCat' ? '➕ Add Category' : '✏️ Edit Category'}</h2>
              <button className="cb" style={closeBtnS} onClick={() => setModal(null)} disabled={submitLoading}>✕</button>
            </div>
            <form onSubmit={handleCatSubmit}>
              <div style={{ padding: '22px 26px 26px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={lblS}>Category Image</label>
                  {renderUploadZone(catImage, catUploading, catProgress, catDrag, catFileRef, (f) => simulateUpload(f, setCatImage, setCatUploading, setCatProgress), setCatDrag, submitLoading)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={lblS}>Category Name *</label>                      

                    <input className="fi" style={inpS} placeholder="e.g. Electronics, Clothing" value={catForm.cname} onChange={e => setCatForm(p => ({ ...p, cname: e.target.value }))} required disabled={submitLoading} />
                  </div>
                  <div>
                    <label style={lblS}>Description</label>
                    <textarea className="fi" style={{ ...inpS, resize: 'vertical', minHeight: '80px' }} placeholder="Brief description..." value={catForm.cdescription} onChange={e => setCatForm(p => ({ ...p, cdescription: e.target.value }))} disabled={submitLoading} />
                  </div>
                  <div>
                    <label style={lblS}>Status</label>
                    <select className="fi" style={{ ...inpS, cursor: 'pointer' }} value={catForm.cstatus} onChange={e => setCatForm(p => ({ ...p, cstatus: e.target.value }))} disabled={submitLoading}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px' }}>
                <button type="button" style={cancelBtnS} onClick={() => setModal(null)} disabled={submitLoading}>Cancel</button>
                <button type="submit" className={`sb ${submitLoading ? 'btn-disabled' : ''}`} style={submitBtnS} disabled={submitLoading}>
                  {submitLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></span>{modal === 'addCat' ? 'Adding...' : 'Saving...'}</span>
                  ) : (modal === 'addCat' ? 'Add Category' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT SUBCATEGORY MODAL ────────────────── */}
      {(modal === 'addSub' || modal === 'editSub') && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !submitLoading && setModal(null)}>
          <div style={modalSz('sm')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>{modal === 'addSub' ? '➕ Add Subcategory' : '✏️ Edit Subcategory'}</h2>
              <button className="cb" style={closeBtnS} onClick={() => setModal(null)} disabled={submitLoading}>✕</button>
            </div>
            <div style={{ padding: '10px 26px 0' }}>
              <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: 600, background: '#f0ecff', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>Parent: {selectedCategory?.cname}</span>
            </div>
            <form onSubmit={handleSubSubmit}>
              <div style={{ padding: '16px 26px 26px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={lblS}>Subcategory Image</label>
                  {renderUploadZone(subImage, subUploading, subProgress, subDrag, subFileRef, (f) => simulateUpload(f, setSubImage, setSubUploading, setSubProgress), setSubDrag, submitLoading)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={lblS}>Subcategory Name *</label>
                    <input className="fi" style={inpS} placeholder="e.g. Mobile Phones, Laptops" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} required disabled={submitLoading} />
                  </div>
                  <div>
                    <label style={lblS}>Description</label>
                    <textarea className="fi" style={{ ...inpS, resize: 'vertical', minHeight: '80px' }} placeholder="Brief description..." value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} disabled={submitLoading} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px' }}>
                <button type="button" style={cancelBtnS} onClick={() => setModal(null)} disabled={submitLoading}>Cancel</button>
                <button type="submit" className={`sb ${submitLoading ? 'btn-disabled' : ''}`} style={submitBtnS} disabled={submitLoading}>
                  {submitLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></span>{modal === 'addSub' ? 'Adding...' : 'Saving...'}</span>
                  ) : (modal === 'addSub' ? 'Add Subcategory' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CATEGORY MODAL ──────────────────────── */}
      {modal === 'deleteCat' && selectedCategory && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !deleteLoading && setModal(null)}>
          <div style={modalSz('sm')}>
            <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                {deleteLoading ? <div style={{ animation: 'spin 1s linear infinite' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: '0 0 8px' }}>Delete Category?</h2>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: '0 0 4px' }}>This will also delete all its subCategories.</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#555', margin: '0 0 22px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>"{selectedCategory.cname}"</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button style={cancelBtnS} onClick={() => setModal(null)} disabled={deleteLoading}>Cancel</button>
                <button className={`db ${deleteLoading ? 'btn-disabled' : ''}`} style={{ ...delBtnS, opacity: deleteLoading ? 0.7 : 1 }} onClick={handleDeleteCat} disabled={deleteLoading}>
                  {deleteLoading ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></span>Deleting...</span> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE SUBCATEGORY MODAL ───────────────────── */}
      {modal === 'deleteSub' && selectedSub && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !deleteLoading && setModal(null)}>
          <div style={modalSz('sm')}>
            <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                {deleteLoading ? <div style={{ animation: 'spin 1s linear infinite' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: '0 0 8px' }}>Delete Subcategory?</h2>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: '0 0 4px' }}>From: <strong>{selectedCategory?.cname}</strong></p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#555', margin: '0 0 22px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>"{selectedSub.name}"</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button style={cancelBtnS} onClick={() => setModal(null)} disabled={deleteLoading}>Cancel</button>
                <button className={`db ${deleteLoading ? 'btn-disabled' : ''}`} style={{ ...delBtnS, opacity: deleteLoading ? 0.7 : 1 }} onClick={handleDeleteSub} disabled={deleteLoading}>
                  {deleteLoading ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></span>Deleting...</span> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;