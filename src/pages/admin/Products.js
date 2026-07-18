import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { postProduct, getProducts, updateProduct, deleteProduct } from '../../api/productApi';
import { getAllCategory } from '../../api/categoryApi'; // ✅ Adjust path if needed

const Products = () => {
  const [products, setProducts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true); // ✅ Fixed state name
  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('pDate');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const perPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  // ✅ Category & Subcategory States
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  function emptyForm() {
    return { pName: '', pShortDescription: '', pLongDescription: '', pPrice: '', pCategory: '', pSubCategory: '', pStock: '', pReviews: '', pDiscount: '' };
  }

  // ═══════════════════════════════════════════════════════
  //  STYLES
  // ═══════════════════════════════════════════════════════
  const thS = { padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '.5px', textAlign: 'left', borderBottom: '1px solid #eee', background: '#fafbff', whiteSpace: 'nowrap' };
  const tdS = { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f4f5f8', verticalAlign: 'middle' };
  const lblS = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.3px' };
  const inpS = { width: '100%', padding: '9px 14px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s' };
  const uploadZoneS = { border: '2px dashed #d4d8e8', borderRadius: '14px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: '#fafbff' };
  const overlayS = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn .2s ease' };
  const closeBtnS = { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e5f1', background: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', color: '#999' };
  const cancelBtnS = { padding: '10px 22px', borderRadius: '10px', border: '1px solid #e2e5f1', background: '#fff', color: '#555', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' };
  const submitBtnS = { padding: '10px 26px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', boxShadow: '0 4px 15px rgba(108,92,231,.35)' };
  const delBtnS = { padding: '10px 26px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', boxShadow: '0 4px 15px rgba(239,68,68,.35)' };

  function modalSize(size) {
    const w = size === 'sm' ? '420px' : '720px';
    return { width: w, maxWidth: '95vw', background: '#fff', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,.2)', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1) forwards' };
  }

  function sortIcn(field) {
    if (sortField !== field) return <span style={{ color: '#ccc', fontSize: '10px' }}>⇅</span>;
    return <span style={{ color: '#6c5ce7', fontSize: '11px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  function badge(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('active')) return { background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    if (s.includes('low')) return { background: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    if (s.includes('out')) return { background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    return { background: '#f4f6fb', color: '#555', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
  }

  function pgBtn(active) {
    return { padding: '6px 12px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', outline: 'none', background: active ? '#6c5ce7' : '#fff', color: active ? '#fff' : '#555', borderColor: active ? '#6c5ce7' : '#e2e5f1' };
  }

  // ═══════════════════════════════════════════════════════
  //  API FETCHING
  // ═══════════════════════════════════════════════════════
  const fetchProducts = async () => {
    try {
      setFetchLoading(true);
      const response = await getProducts();
      let data = Array.isArray(response) ? response : (response.data || response.products || []);
      if (!Array.isArray(data)) data = [];

      const formattedData = data.map(item => ({
        id: item._id || item.id,
        pName: item.pName || item.name || '',
        pShortDescription: item.pShortDescription || item.shortDescription || '',
        pLongDescription: item.pLongDescription || item.longDescription || '',
        pPrice: item.pPrice || item.price || 0,
        pCategory: item.pCategory || item.category || '',
        pSubCategory: item.pSubCategory || item.subCategory || '',
        pStock: item.pStock || item.stock || 0,
        pReviews: item.pReviews || item.reviews || 0,
        pDiscount: item.pDiscount || item.discount || 0,
        pImages: item.pImages || item.images || [],
        pStatus: item.pStatus || item.status || 'Active',
        pDate: item.pDate || item.createdAt || ''
      }));
      setProducts(formattedData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategory();
      let data = Array.isArray(res) ? res : (res.data || res.categories || []);
      if (!Array.isArray(data)) data = [];
      setCategories(data);
    } catch (err) { console.error("Failed to fetch categories:", err); }
  };

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Auto-update subcategories when category changes
  useEffect(() => {
    const selectedCat = categories.find(c => (c._id || c.id) === formData.pCategory);
    setSubCategories(selectedCat?.subCategories || selectedCat?.subcategories || []);
    setFormData(prev => ({ ...prev, pSubCategory: '' }));
  }, [formData.pCategory, categories]);

  // ═══════════════════════════════════════════════════════
  //  TOAST & FORM BUILDERS
  // ═══════════════════════════════════════════════════════
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('pName', formData.pName);
    fd.append('pShortDescription', formData.pShortDescription);
    fd.append('pLongDescription', formData.pLongDescription);
    fd.append('pPrice', formData.pPrice);
    fd.append('pCategory', formData.pCategory);
    fd.append('pSubCategory', formData.pSubCategory);
    fd.append('pStock', formData.pStock);
    fd.append('pReviews', formData.pReviews);
    fd.append('pDiscount', formData.pDiscount);
    uploadedImages.forEach(img => { if (img.file instanceof File) fd.append('pImages', img.file); });
    if (modal === 'edit') {
      const existingUrls = uploadedImages.filter(img => !img.file && img.preview).map(img => img.preview);
      if (existingUrls.length > 0) fd.append('existingImages', JSON.stringify(existingUrls));
    }
    return fd;
  };

  // ═══════════════════════════════════════════════════════
  //  SAFE FILTERING, SORTING, PAGINATION
  // ═══════════════════════════════════════════════════════
  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const ms = (p.pName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.pShortDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
      return ms;
    });
    return [...result].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') { av = (av || '').toLowerCase(); bv = (bv || '').toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safeCurrentPage - 1) * perPage, safeCurrentPage * perPage);

  const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    const left = Math.max(current - 1, 1);
    const right = Math.min(current + 1, total);
    if (left > 2) pages.push(1, '...'); else for (let i = 1; i < left; i++) pages.push(i);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...', total); else for (let i = right + 1; i <= total; i++) pages.push(i);
    return pages;
  };

  // ═══════════════════════════════════════════════════════
  //  IMAGE UPLOADS
  // ═══════════════════════════════════════════════════════
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (!validFiles.length) { showToast('Only image files under 5MB are allowed', 'error'); return; }
    const newImgs = validFiles.map((file, i) => ({ id: Date.now() + i + Math.random(), file, name: file.name, size: file.size, preview: URL.createObjectURL(file), progress: 0, uploading: true, done: false }));
    setUploadedImages(prev => [...prev, ...newImgs]);
    newImgs.forEach(img => {
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 25 + 10;
        if (prog >= 100) { prog = 100; clearInterval(iv); setTimeout(() => setUploadedImages(prev => prev.map(x => x.id === img.id ? { ...x, uploading: false, done: true, progress: 100 } : x)), 300); }
        setUploadedImages(prev => prev.map(x => x.id === img.id ? { ...x, progress: Math.min(prog, 100) } : x));
      }, 200 + Math.random() * 200);
    });
  };
  const removeImage = (id) => { setUploadedImages(prev => { const img = prev.find(x => x.id === id); if (img?.preview && img.file) URL.revokeObjectURL(img.preview); return prev.filter(x => x.id !== id); }); };
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };

  // ═══════════════════════════════════════════════════════
  //  CRUD HANDLERS
  // ═══════════════════════════════════════════════════════
  const resetForm = () => { setFormData(emptyForm()); setUploadedImages([]); setSubCategories([]); };
  const openAdd = () => { resetForm(); setModal('add'); };

  const openEdit = (p) => {
    setSelectedProduct(p);
    setFormData({
      pName: p.pName || '', pShortDescription: p.pShortDescription || '', pLongDescription: p.pLongDescription || '',
      pPrice: p.pPrice || '', pCategory: p.pCategory || '', pSubCategory: p.pSubCategory || '',
      pStock: p.pStock || '', pReviews: p.pReviews || '', pDiscount: p.pDiscount || ''
    });
    if (p.pImages?.length > 0) {
      const loaded = p.pImages.map((img, i) => {
        if (typeof img === 'string') return { id: Date.now() + i, preview: img, name: img.split('/').pop(), size: 0, file: null, uploading: false, done: true, progress: 100 };
        return { ...img, uploading: false, done: true, progress: 100 };
      });
      setUploadedImages(loaded);
    } else { setUploadedImages([]); }
    setModal('edit');
  };

  const openView = (p) => { setSelectedProduct(p); setModal('view'); };
  const openDelete = (p) => { setSelectedProduct(p); setDeleteLoading(false); setModal('delete'); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitLoading(true);
    try {
      const fd = buildFormData();
      if (modal === 'add') await postProduct(fd); 
      else await updateProduct(selectedProduct.id || selectedProduct._id, fd); 
      showToast(modal === 'add' ? "Product added!" : "Product updated!", 'success');
      setModal(null); resetForm(); await fetchProducts();
    } catch (err) { showToast(err?.response?.data?.message || 'Something went wrong', 'error'); } finally { setSubmitLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await deleteProduct(selectedProduct.id || selectedProduct._id); showToast("Deleted successfully!", 'success'); setModal(null); await fetchProducts(); } 
    catch (err) { showToast('Delete failed', 'error'); } finally { setDeleteLoading(false); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(prev => prev.length === paginated.length ? [] : paginated.map(p => p.id || p._id));
  const handleSort = (f) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } };

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
        @keyframes toastIn { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
        .fi:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,.1); background: #fff !important }
        .tr:hover { background: '#f8f9ff }
        .ab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .pb:hover:not(.act) { border-color: #6c5ce7; color: #6c5ce7 }
        .cb:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca }
        .sb:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .db:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,.45) }
        .actbtn:hover { transform: translateY(-1px); filter: brightness(.95) }
        .sort-h { cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 4px }
        .sort-h:hover { color: #6c5ce7 }
        .upload-shimmer { background: linear-gradient(90deg, #f0ecff 25%, #e0d8ff 50%, #f0ecff 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
        .toast-enter { animation: toastIn .35s cubic-bezier(.16,1,.3,1) forwards }
        .btn-disabled { opacity: 0.6 !important; cursor: not-allowed !important; pointer-events: none !important; transform: none !important; box-shadow: none !important; }
        .skeleton { background: linear-gradient(90deg, #f0f1f5 25%, #e8eaf0 50%, #f0f1f5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999 }}>
          <div className="toast-enter" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderRadius: '12px', background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`, boxShadow: '0 10px 40px rgba(0,0,0,.12)', minWidth: '280px' }}>
            <div style={{ fontSize: '12px', color: toast.type === 'error' ? '#dc2626' : '#059669', fontWeight: 600 }}>{toast.message}</div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '16px' }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ padding: '28px 32px', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>Products</h1>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: 0 }}>{products.length} total products</p>
            </div>
          </div>
          <button className="ab" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' }} onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>

        {/* TOOLBAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '340px' }}>
            <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="fi" style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Search products..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        {/* LOADING SKELETON */}
        {fetchLoading ? (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', overflow: 'hidden', padding: '20px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f4f5f8' }}>
                <div className="skeleton" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', gap: '16px' }}><div className="skeleton" style={{ width: '180px', height: '14px' }} /><div className="skeleton" style={{ width: '80px', height: '14px' }} /><div className="skeleton" style={{ width: '100px', height: '14px' }} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#aaa', margin: 0 }}>No products found</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                <thead>
                  <tr>
                    <th style={thS}><input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: '#6c5ce7' }} /></th>
                    <th style={thS}><span className="sort-h" onClick={() => handleSort('pName')}>Product {sortIcn('pName')}</span></th>
                    <th style={thS}><span className="sort-h" onClick={() => handleSort('pPrice')}>Price {sortIcn('pPrice')}</span></th>
                    <th style={thS}>Category</th>
                    <th style={thS}>Images</th>
                    <th style={thS}><span className="sort-h" onClick={() => handleSort('pStock')}>Stock {sortIcn('pStock')}</span></th>
                    <th style={thS}>Status</th>
                    <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => {
                    const pid = p.id || p._id;
                    const imgSrc = p.pImages?.[0]?.preview || (typeof p.pImages?.[0] === 'string' ? p.pImages[0] : null);
                    return (
                      <tr key={pid} className="tr" style={{ transition: 'background .15s' }}>
                        <td style={tdS}><input type="checkbox" checked={selectedIds.includes(pid)} onChange={() => toggleSelect(pid)} style={{ cursor: 'pointer', accentColor: '#6c5ce7' }} /></td>
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                              {imgSrc ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5f0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: '#1a1a3e', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{p.pName}</div>
                              <div style={{ fontSize: '11px', color: '#8b8fa3', marginTop: '1px' }}>{p.pShortDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdS}><div style={{ fontWeight: 700, color: '#1a1a3e' }}>₹{Number(p.pPrice).toLocaleString()}</div></td>
                        <td style={tdS}><span style={{ background: '#f4f6fb', color: '#555', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{p.pCategory || '—'}</span></td>
                        <td style={tdS}><span style={{ background: '#f0ecff', color: '#6c5ce7', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{p.pImages?.length || 0}</span></td>
                        <td style={tdS}><span style={{ fontWeight: 600, color: p.pStock === 0 ? '#dc2626' : p.pStock < 100 ? '#d97706' : '#059669' }}>{p.pStock}</span></td>
                        <td style={tdS}><span style={badge(p.pStatus)}>{p.pStatus}</span></td>
                        <td style={{ ...tdS, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button className="actbtn" onClick={() => openView(p)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#eff6ff', color: '#2563eb' }}>View</button>
                            <button className="actbtn" onClick={() => openEdit(p)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#f0fdf4', color: '#22c55e' }}>Edit</button>
                            <button className="actbtn" onClick={() => openDelete(p)} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f0f1f5', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#8b8fa3' }}>Showing {filtered.length === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1}–{Math.min(safeCurrentPage * perPage, filtered.length)} of {filtered.length} products</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="pb" style={pgBtn(false)} disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{'‹'}</button>
                {getPageNumbers(safeCurrentPage, totalPages).map((pg, idx) => pg === '...' ? (<span key={`dots-${idx}`} style={{ width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8fa3', fontSize: '14px', userSelect: 'none' }}>…</span>) : (<button key={pg} className={`pb ${pg === safeCurrentPage ? 'act' : ''}`} style={pgBtn(pg === safeCurrentPage)} onClick={() => setCurrentPage(pg)}>{pg}</button>))}
                <button className="pb" style={pgBtn(false)} disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{'›'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {(modal === 'add' || modal === 'edit') && (
          <div style={overlayS} onClick={e => e.target === e.currentTarget && !submitLoading && setModal(null)}>
            <div style={{ ...modalSize('lg'), maxHeight: '92vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 0', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '18px 18px 0 0' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>{modal === 'add' ? '➕ Add New Product' : '✏️ Edit Product'}</h2>
                <button className="cb" style={closeBtnS} onClick={() => !submitLoading && setModal(null)} disabled={submitLoading}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ padding: '22px 26px 26px' }}>
                  {/* IMAGE UPLOAD */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lblS}>Product Images (Multiple)</label>
                    <div style={dragActive ? { ...uploadZoneS, border: '2px dashed #6c5ce7', background: '#f5f3ff' } : uploadZoneS} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !submitLoading && fileInputRef.current?.click()}>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} disabled={submitLoading} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>{dragActive ? 'Drop here' : 'Click to upload images'}</div>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                        {uploadedImages.map(img => (
                          <div key={img.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee', height: '100px' }}>
                            <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => !submitLoading && removeImage(img.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FORM FIELDS GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><label style={lblS}>Product Name *</label><input className="fi" style={inpS} placeholder="e.g. iPhone 15" value={formData.pName} onChange={e => setFormData(p => ({ ...p, pName: e.target.value }))} required disabled={submitLoading} /></div>
                    <div><label style={lblS}>Price (₹) *</label><input className="fi" type="number" style={inpS} placeholder="0" value={formData.pPrice} onChange={e => setFormData(p => ({ ...p, pPrice: e.target.value }))} required disabled={submitLoading} /></div>
                    
                    {/* ✅ CATEGORY DROPDOWN */}
                    <div>
                      <label style={lblS}>Category *</label>
                      <select className="fi" style={{ ...inpS, cursor: 'pointer' }} value={formData.pCategory} onChange={e => setFormData(p => ({ ...p, pCategory: e.target.value }))} required disabled={submitLoading}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.cname || c.name}</option>)}
                      </select>
                    </div>

                    {/* ✅ SUBCATEGORY DROPDOWN */}
                    <div>
                      <label style={lblS}>Subcategory</label>
                      <select className="fi" style={{ ...inpS, cursor: 'pointer' }} value={formData.pSubCategory} onChange={e => setFormData(p => ({ ...p, pSubCategory: e.target.value }))} disabled={submitLoading || subCategories.length === 0}>
                        <option value="">{subCategories.length === 0 ? 'Select category first' : 'Select Subcategory'}</option>
                        {subCategories.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div><label style={lblS}>Stock *</label><input className="fi" type="number" style={inpS} placeholder="0" value={formData.pStock} onChange={e => setFormData(p => ({ ...p, pStock: e.target.value }))} required disabled={submitLoading} /></div>
                    <div><label style={lblS}>Discount (%)</label><input className="fi" type="number" style={inpS} placeholder="0" value={formData.pDiscount} onChange={e => setFormData(p => ({ ...p, pDiscount: e.target.value }))} disabled={submitLoading} /></div>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}><label style={lblS}>Short Description</label><input className="fi" style={inpS} placeholder="Brief description..." value={formData.pShortDescription} onChange={e => setFormData(p => ({ ...p, pShortDescription: e.target.value }))} disabled={submitLoading} /></div>
                  <div style={{ marginTop: '16px' }}><label style={lblS}>Long Description</label><textarea className="fi" style={{ ...inpS, minHeight: '80px', resize: 'vertical' }} placeholder="Detailed description..." value={formData.pLongDescription} onChange={e => setFormData(p => ({ ...p, pLongDescription: e.target.value }))} disabled={submitLoading} /></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px', position: 'sticky', bottom: 0, background: '#fff' }}>
                  <button type="button" style={cancelBtnS} onClick={() => !submitLoading && setModal(null)} disabled={submitLoading}>Cancel</button>
                  <button type="submit" className={`sb ${submitLoading ? 'btn-disabled' : ''}`} style={submitBtnS} disabled={submitLoading}>{submitLoading ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {modal === 'view' && selectedProduct && (
          <div style={overlayS} onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div style={{ ...modalSize('lg'), maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px 0' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: 0 }}>👁️ Product Details</h2>
                <button className="cb" style={closeBtnS} onClick={() => setModal(null)}>✕</button>
              </div>
              <div style={{ padding: '22px 26px 26px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a3e', marginBottom: '16px' }}>{selectedProduct.pName}</div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{selectedProduct.pLongDescription || selectedProduct.pShortDescription || 'No description'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px' }}><button style={cancelBtnS} onClick={() => setModal(null)}>Close</button></div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {modal === 'delete' && selectedProduct && (
          <div style={overlayS} onClick={e => e.target === e.currentTarget && !deleteLoading && setModal(null)}>
            <div style={modalSize('sm')}>
              <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: '0 0 8px' }}>Delete Product?</h2>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#555', margin: '0 0 22px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>"{selectedProduct.pName}"</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button style={cancelBtnS} onClick={() => setModal(null)} disabled={deleteLoading}>Cancel</button>
                  <button className={`db ${deleteLoading ? 'btn-disabled' : ''}`} style={delBtnS} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;