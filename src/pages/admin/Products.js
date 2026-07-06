import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { postProduct, getProducts, updateProduct, deleteProduct, getCategories } from '../../api/adminApi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortField, setSortField] = useState('pDate');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const subCatRef = useRef(null);

  function emptyForm() {
    return { pName: '', pShortDescription: '', pLongDescription: '', pPrice: '', pCategory: '', pSubCategory: '', pStock: '', pReviews: '', pDiscount: '' };
  }

  // ═══════════════════════════════════════════════════════
  //  ✅ DERIVED MAPS — all keyed by category _id
  // ═══════════════════════════════════════════════════════
  const categories = useMemo(() =>
    categoryList.map(c => ({ _id: c._id || c.id, cname: c._id })),
    [categoryList]
  );

  const subCategoriesMap = useMemo(() => {
    const map = {};
    categoryList.forEach(c => {
      const cid = c._id || c.id;
      map[cid] = c.subcategories?.map(sc => sc.name || sc.pSubCategory || sc) || [];
    });
    return map;
  }, [categoryList]);

  const catNameMap = useMemo(() => {
    const map = {};
    categoryList.forEach(c => { map[c._id || c.id] = c.cname; });
    return map;
  }, [categoryList]);

  const resolveCatName = useCallback((pCategory) => {
    if (!pCategory) return '';
    if (catNameMap[pCategory]) return catNameMap[pCategory];
    const found = categoryList.find(c => c.cname === pCategory);
    return found ? found.cname : pCategory;
  }, [catNameMap, categoryList]);

  const resolveCatId = useCallback((pCategory) => {
    if (!pCategory) return '';
    if (catNameMap[pCategory]) return pCategory;
    const found = categoryList.find(c => c.cname === pCategory);
    return found ? (found._id || found.id) : pCategory;
  }, [catNameMap, categoryList]);

  // ═══════════════════════════════════════════════════════
  //  ✅ ALL STYLE CONSTANTS — defined BEFORE return
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

  // ═══════════════════════════════════════════════════════
  //  ✅ ALL HELPER FUNCTIONS — defined BEFORE return
  // ═══════════════════════════════════════════════════════

  /** setForm — clear pSubCategory when pCategory changes, auto-open subcategory */
  function setForm(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'pCategory') {
      setFormData(prev => ({ ...prev, pSubCategory: '' }));
      if (value && subCategoriesMap[value]?.length > 0) {
        setTimeout(() => {
          if (subCatRef.current) {
            try { subCatRef.current.focus(); } catch (_) {}
          }
        }, 100);
      }
    }
  }

  /** Reusable form field */
  function Field({ lbl, val, set, ph, type = 'text', req = false, disabled = false }) {
    return (
      <div>
        <label style={lblS}>{lbl}</label>
        <input className="fi" type={type} style={inpS} placeholder={ph} value={val} onChange={e => set(e.target.value)} required={req} disabled={disabled} />
      </div>
    );
  }

  /** Sort icon for table headers */
  function sortIcn(field) {
    if (sortField !== field) return <span style={{ color: '#ccc', fontSize: '10px' }}>⇅</span>;
    return <span style={{ color: '#6c5ce7', fontSize: '11px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  /** Status badge style */
  function badge(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('active')) return { background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    if (s.includes('low')) return { background: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    if (s.includes('out')) return { background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
    return { background: '#f4f6fb', color: '#555', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-block' };
  }

  /** Pagination button style */
  function pgBtn(active) {
    return {
      padding: '6px 12px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', outline: 'none',
      background: active ? '#6c5ce7' : '#fff', color: active ? '#fff' : '#555', borderColor: active ? '#6c5ce7' : '#e2e5f1',
    };
  }

  // ═══════════════════════════════════════════════════════
  //  TOAST
  // ═══════════════════════════════════════════════════════
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ═══════════════════════════════════════════════════════
  //  FETCH
  // ═══════════════════════════════════════════════════════
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      const data = Array.isArray(res) ? res : res?.data || res?.categories || [];
      setCategoryList(data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to load categories', 'error');
    }
  }, [showToast]);

  const fetchProducts = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await getProducts();
      const data = Array.isArray(res) ? res : res?.data || res?.products || [];
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
      showToast(err?.response?.data?.message || err.message || 'Failed to load products', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCategories(); fetchProducts(); }, [fetchCategories, fetchProducts]);

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
    uploadedImages.forEach(img => {
      if (img.file instanceof File) fd.append('pImages', img.file);
    });
    if (modal === 'edit') {
      const existingUrls = uploadedImages.filter(img => !img.file && img.preview).map(img => img.preview);
      if (existingUrls.length > 0) fd.append('existingImages', JSON.stringify(existingUrls));
    }
    return fd;
  };

  // ── FILTERING, SORTING, PAGINATION ─────────────────────
  let filtered = products.filter(p => {
    const ms = p.pName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.pShortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const mc = filterCategory === 'All' || p.pCategory === filterCategory;
    return ms && mc;
  });
  filtered = [...filtered].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === 'string') { av = (av || '').toLowerCase(); bv = (bv || '').toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (!validFiles.length) { showToast('Only image files under 5MB are allowed', 'error'); return; }
    const newImgs = validFiles.map((file, i) => ({
      id: Date.now() + i + Math.random(), file, name: file.name, size: file.size,
      preview: URL.createObjectURL(file), progress: 0, uploading: true, done: false,
    }));
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

  const removeImage = (id) => {
    setUploadedImages(prev => {
      const img = prev.find(x => x.id === id);
      if (img?.preview && img.file) URL.revokeObjectURL(img.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };

  // ── CRUD HANDLERS ──────────────────────────────────────
  const resetForm = () => { setFormData(emptyForm()); setUploadedImages([]); };
  const openAdd = () => { resetForm(); setModal('add'); };

  const openEdit = (p) => {
    setSelectedProduct(p);
    const catId = resolveCatId(p.pCategory);
    setFormData({
      pName: p.pName || '', pShortDescription: p.pShortDescription || '',
      pLongDescription: p.pLongDescription || '', pPrice: p.pPrice || '',
      pCategory: catId, pSubCategory: p.pSubCategory || '',
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

  // ═══════════════════════════════════════════════════════
  //  POST / UPDATE
  // ═══════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const fd = buildFormData();
      if (modal === 'add') {
        const res = await postProduct(fd);
        const np = res?.data || res?.product || res;
        const status = Number(formData.pStock) === 0 ? 'Out of Stock' : Number(formData.pStock) < 100 ? 'Low Stock' : 'Active';
        const mapped = {
          id: np.id || np._id || Date.now(),
          pName: np.pName || formData.pName, pShortDescription: np.pShortDescription || formData.pShortDescription,
          pLongDescription: np.pLongDescription || formData.pLongDescription, pPrice: Number(np.pPrice || formData.pPrice),
          pCategory: np.pCategory || formData.pCategory, pSubCategory: np.pSubCategory || formData.pSubCategory,
          pStock: Number(np.pStock || formData.pStock), pReviews: Number(np.pReviews || formData.pReviews),
          pDiscount: Number(np.pDiscount || formData.pDiscount), pImages: np.pImages || uploadedImages,
          pStatus: np.pStatus || status, pDate: np.pDate || np.createdAt || new Date().toISOString().split('T')[0]
        };
        setProducts(prev => [mapped, ...prev]);
        showToast(`"${mapped.pName}" added successfully!`, 'success');
      } else {
        const productId = selectedProduct.id || selectedProduct._id;
        const res = await updateProduct(productId, fd);
        const up = res?.data || res?.product || res;
        const status = Number(formData.pStock) === 0 ? 'Out of Stock' : Number(formData.pStock) < 100 ? 'Low Stock' : 'Active';
        const mapped = {
          ...selectedProduct,
          pName: up.pName || formData.pName, pShortDescription: up.pShortDescription || formData.pShortDescription,
          pLongDescription: up.pLongDescription || formData.pLongDescription, pPrice: Number(up.pPrice || formData.pPrice),
          pCategory: up.pCategory || formData.pCategory, pSubCategory: up.pSubCategory || formData.pSubCategory,
          pStock: Number(up.pStock || formData.pStock), pReviews: Number(up.pReviews || formData.pReviews),
          pDiscount: Number(up.pDiscount || formData.pDiscount), pImages: up.pImages || uploadedImages,
          pStatus: up.pStatus || status
        };
        setProducts(prev => prev.map(p => (p.id || p._id) === productId ? mapped : p));
        showToast(`"${mapped.pName}" updated successfully!`, 'success');
      }
      setModal(null); resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      showToast(err?.response?.data?.message || err?.response?.data?.error || err.message || 'Something went wrong', 'error');
    } finally { setSubmitLoading(false); }
  };

  // ═══════════════════════════════════════════════════════
  //  DELETE
  // ═══════════════════════════════════════════════════════
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const productId = selectedProduct.id || selectedProduct._id;
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => (p.id || p._id) !== productId));
      showToast(`"${selectedProduct.pName}" deleted successfully!`, 'success');
      setModal(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err?.response?.data?.message || err?.response?.data?.error || err.message || 'Delete failed', 'error');
    } finally { setDeleteLoading(false); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(prev => prev.length === paginated.length ? [] : paginated.map(p => p.id || p._id));
  const handleSort = (f) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } };

  // ═══════════════════════════════════════════════════════
  //  ✅ RENDER — now all references (thS, tdS, etc.) exist
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeScale { from { opacity: 0; transform: scale(.8) } to { opacity: 1; transform: scale(1) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(108,92,231,0.3) } 50% { box-shadow: 0 0 0 6px rgba(108,92,231,0) } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
        .fi:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,.1); background: #fff !important }
        .tr:hover { background: #f8f9ff }
        .ab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .pb:hover:not(.act) { border-color: #6c5ce7; color: #6c5ce7 }
        .cb:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca }
        .sb:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,92,231,.45) }
        .db:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,.45) }
        .actbtn:hover { transform: translateY(-1px); filter: brightness(.95) }
        .sort-h { cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 4px }
        .sort-h:hover { color: #6c5ce7 }
        .img-grid-item { animation: fadeScale .3s ease forwards }
        .upload-shimmer { background: linear-gradient(90deg, #f0ecff 25%, #e0d8ff 50%, #f0ecff 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite }
        .subcat-open { animation: pulseGlow 1s ease-in-out; border-color: #6c5ce7 !important; }
        .toast-enter { animation: toastIn .35s cubic-bezier(.16,1,.3,1) forwards }
        .btn-disabled { opacity: 0.6 !important; cursor: not-allowed !important; pointer-events: none !important; transform: none !important; box-shadow: none !important; }
        .skeleton { background: linear-gradient(90deg, #f0f1f5 25%, #e8eaf0 50%, #f0f1f5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999 }}>
          <div className="toast-enter" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderRadius: '12px', background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#a7f3d0'}`, boxShadow: '0 10px 40px rgba(0,0,0,.12)', minWidth: '280px', maxWidth: '420px', fontFamily: 'inherit' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: toast.type === 'error' ? '#fee2e2' : '#d1fae5' }}>
              {toast.type === 'error' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: toast.type === 'error' ? '#dc2626' : '#059669' }}>{toast.type === 'error' ? 'Error' : 'Success'}</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '1px', lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '16px', padding: '4px', lineHeight: 1 }}>✕</button>
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
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: 0 }}>{products.length} total • Showing {perPage} per page</p>
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
          <select style={{ padding: '9px 14px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#555' }} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.cname}</option>)}
          </select>
          <button onClick={() => { fetchCategories(); fetchProducts(); }} style={{ padding: '9px 14px', border: '1px solid #e2e5f1', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#555', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .15s' }} title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform .4s', transform: fetchLoading ? 'rotate(360deg)' : 'none' }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>

        {/* LOADING SKELETON */}
        {fetchLoading ? (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', overflow: 'hidden', padding: '20px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f4f5f8' }}>
                <div className="skeleton" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', gap: '16px' }}><div className="skeleton" style={{ width: '180px', height: '14px' }} /><div className="skeleton" style={{ width: '80px', height: '14px' }} /><div className="skeleton" style={{ width: '100px', height: '14px' }} /><div className="skeleton" style={{ width: '60px', height: '14px' }} /><div className="skeleton" style={{ width: '140px', height: '14px' }} /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', border: '1px solid #eee', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#f0ecff,#e8e0ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c4dc" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><line x1="12" y1="12" x2="12" y2="12.01" /></svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a3e', margin: '0 0 6px' }}>{searchTerm || filterCategory !== 'All' ? 'No products found' : 'No products yet'}</h3>
            <p style={{ fontSize: '13px', color: '#8b8fa3', margin: '0 0 20px' }}>{searchTerm || filterCategory !== 'All' ? 'Try adjusting your search or filter' : 'Start by adding your first product'}</p>
            {!searchTerm && filterCategory === 'All' && (
              <button onClick={openAdd} className="ab" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg,#6c5ce7,#a855f7)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,92,231,.35)', transition: 'all .2s', fontFamily: 'inherit' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Your First Product
              </button>
            )}
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
                              <div style={{ fontSize: '11px', color: '#8b8fa3', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{p.pShortDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdS}>
                          <div style={{ fontWeight: 700, color: '#1a1a3e' }}>₹{Number(p.pPrice).toLocaleString()}</div>
                          {p.pDiscount > 0 && <div style={{ fontSize: '11px', color: '#bbb', textDecoration: 'line-through' }}>₹{Math.round(Number(p.pPrice) / (1 - Number(p.pDiscount) / 100)).toLocaleString()}</div>}
                        </td>
                        <td style={tdS}>
                          <div style={{ fontSize: '12px', color: '#555', fontWeight: 500 }}>{resolveCatName(p.pCategory)}</div>
                          <div style={{ fontSize: '11px', color: '#aaa' }}>{p.pSubCategory}</div>
                        </td>
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ background: '#f0ecff', color: '#6c5ce7', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{p.pImages?.length || 0}</span>
                            <span style={{ fontSize: '11px', color: '#aaa' }}>photos</span>
                          </div>
                        </td>
                        <td style={tdS}><span style={{ fontWeight: 600, color: p.pStock === 0 ? '#dc2626' : p.pStock < 100 ? '#d97706' : '#059669' }}>{p.pStock}</span></td>
                        <td style={tdS}><span style={badge(p.pStatus)}>{p.pStatus}</span></td>
                        <td style={{ ...tdS, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            {['view', 'edit', 'delete'].map(t => (
                              <button key={t} className="actbtn" title={t} onClick={() => ({ view: () => openView(p), edit: () => openEdit(p), delete: () => openDelete(p) }[t]())} style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 500, background: { view: '#eff6ff', edit: '#f0fdf4', delete: '#fef2f2' }[t], color: { view: '#3b82f6', edit: '#22c55e', delete: '#ef4444' }[t], transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                                {t === 'view' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                                {t === 'edit' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                                {t === 'delete' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f0f1f5', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#8b8fa3' }}>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} products</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="pb" style={pgBtn(false)} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{'‹'}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} className={`pb ${pg === currentPage ? 'act' : ''}`} style={pgBtn(pg === currentPage)} onClick={() => setCurrentPage(pg)}>{pg}</button>
                ))}
                <button className="pb" style={pgBtn(false)} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{'›'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════ */}

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

                {/* MULTI-IMAGE UPLOAD */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={lblS}>Product Images (Multiple)</label>
                  <div style={dragActive ? { ...uploadZoneS, border: '2px dashed #6c5ce7', background: '#f5f3ff' } : uploadZoneS} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !submitLoading && fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} disabled={submitLoading} />
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c4dc" strokeWidth="1.5" style={{ marginBottom: '6px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>{dragActive ? 'Drop images here' : 'Drag & drop or click to upload multiple images'}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>PNG, JPG, WEBP up to 5MB each</div>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginTop: '14px' }}>
                      {uploadedImages.map(img => (
                        <div key={img.id} className="img-grid-item" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', background: '#fff', aspectRatio: '1' }}>
                          <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'filter .3s', filter: img.uploading ? 'blur(2px) brightness(0.7)' : 'none' }} />
                          {img.uploading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
                              <div style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div>
                              <div style={{ width: '80%', height: '4px', borderRadius: '2px', background: '#e2e5f1', overflow: 'hidden' }}><div className="upload-shimmer" style={{ width: `${img.progress}%`, height: '100%', background: 'linear-gradient(90deg,#6c5ce7,#a855f7)', borderRadius: '2px', transition: 'width .2s ease' }} /></div>
                              <span style={{ fontSize: '10px', color: '#6c5ce7', fontWeight: 600, marginTop: '4px' }}>{Math.round(img.progress)}%</span>
                            </div>
                          )}
                          {img.done && <div style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(34,197,94,.4)' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (!submitLoading) removeImage(img.id); }} style={{ position: 'absolute', bottom: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', lineHeight: 1, opacity: 0.8 }}>✕</button>
                          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '4px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff', fontSize: '9px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FORM GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field lbl="Product Name *" val={formData.pName} set={v => setForm('pName', v)} ph="Enter product name" req disabled={submitLoading} />
                  <Field lbl="Price (₹) *" type="number" val={formData.pPrice} set={v => setForm('pPrice', v)} ph="0.00" req disabled={submitLoading} />

                  {/* CATEGORY DROPDOWN — value=_id, display=cname */}
                  <div>
                    <label style={lblS}>Category *</label>
                    <select className="fi" style={{ ...inpS, cursor: 'pointer' }} value={formData.pCategory} onChange={e => setForm('pCategory', e.target.value)} required disabled={submitLoading}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c._id}</option>)}
                    </select>
                    {formData.pCategory && (
                      <div style={{ fontSize: '10px', color: '#6c5ce7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
                        {subCategoriesMap[formData.pCategory]?.length || 0} subcategories available ↓
                      </div>
                    )}
                  </div>

                  {/* SUBCATEGORY DROPDOWN — lookup by _id, show name */}
                  <div>
                    <label style={lblS}>
                      Sub Category
                      {formData.pCategory && <span style={{ marginLeft: '6px', fontSize: '9px', color: '#6c5ce7', fontWeight: 700, background: '#f0ecff', padding: '1px 6px', borderRadius: '4px', textTransform: 'none', letterSpacing: '0' }}>AUTO-OPEN</span>}
                    </label>
                    <select ref={subCatRef} className={`fi ${formData.pCategory ? 'subcat-open' : ''}`} style={{ ...inpS, cursor: formData.pCategory ? 'pointer' : 'not-allowed', opacity: formData.pCategory ? 1 : 0.5, borderColor: formData.pCategory ? '#6c5ce7' : '#e2e5f1' }} value={formData.pSubCategory} onChange={e => setForm('pSubCategory', e.target.value)} disabled={!formData.pCategory || submitLoading}>
                      <option value="">{formData.pCategory ? `Choose from ${subCategoriesMap[formData.pCategory]?.length || 0} subcategories...` : 'Select category first'}</option>
                      {formData.pCategory && subCategoriesMap[formData.pCategory]?.map((sc, i) => <option key={`${formData.pCategory}-${i}`} value={sc}>{sc}</option>)}
                    </select>
                  </div>

                  <Field lbl="Stock Quantity *" type="number" val={formData.pStock} set={v => setForm('pStock', v)} ph="0" req disabled={submitLoading} />
                  <Field lbl="Discount (%)" type="number" val={formData.pDiscount} set={v => setForm('pDiscount', v)} ph="0" disabled={submitLoading} />
                  <Field lbl="Reviews (★ out of 5)" type="number" val={formData.pReviews} set={v => setForm('pReviews', v)} ph="0.0" disabled={submitLoading} />
                  <Field lbl="Short Description" val={formData.pShortDescription} set={v => setForm('pShortDescription', v)} ph="Brief description" disabled={submitLoading} />
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lblS}>Long Description</label>
                    <textarea className="fi" style={{ ...inpS, resize: 'vertical', minHeight: '80px' }} placeholder="Detailed product description..." value={formData.pLongDescription} onChange={e => setForm('pLongDescription', e.target.value)} disabled={submitLoading} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px', position: 'sticky', bottom: 0, background: '#fff' }}>
                <button type="button" style={cancelBtnS} onClick={() => !submitLoading && setModal(null)} disabled={submitLoading}>Cancel</button>
                <button type="submit" className={`sb ${submitLoading ? 'btn-disabled' : ''}`} style={submitBtnS} disabled={submitLoading}>
                  {submitLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>{modal === 'add' ? 'Adding...' : 'Saving...'}</span>
                  ) : (modal === 'add' ? 'Add Product' : 'Save Changes')}
                </button>
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
              {selectedProduct.pImages?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '22px' }}>
                  {selectedProduct.pImages.map((img, i) => { const src = img.preview || (typeof img === 'string' ? img : ''); return <img key={img.id || i} src={src} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eee' }} />; })}
                </div>
              ) : (
                <div style={{ width: '100%', height: '140px', borderRadius: '14px', background: 'linear-gradient(135deg,#f0ecff,#e8e0ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c4dc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>
              )}
              {[
                ['Product Name', selectedProduct.pName],
                ['Short Description', selectedProduct.pShortDescription],
                ['Long Description', selectedProduct.pLongDescription],
                ['Price', <>₹{Number(selectedProduct.pPrice).toLocaleString()} {selectedProduct.pDiscount > 0 && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#bbb', textDecoration: 'line-through' }}>₹{Math.round(Number(selectedProduct.pPrice) / (1 - Number(selectedProduct.pDiscount) / 100)).toLocaleString()}</span>}</>],
                ['Category', <>{resolveCatName(selectedProduct.pCategory)} <span style={{ color: '#ccc' }}>→</span> {selectedProduct.pSubCategory}</>],
                ['Stock', <span style={{ fontWeight: 600, color: selectedProduct.pStock === 0 ? '#dc2626' : selectedProduct.pStock < 100 ? '#d97706' : '#059669' }}>{selectedProduct.pStock} units</span>],
                ['Reviews', <><span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.floor(Number(selectedProduct.pReviews) || 0))}{'☆'.repeat(5 - Math.ceil(Number(selectedProduct.pReviews) || 0))}</span> {selectedProduct.pReviews}/5</>],
                ['Discount', selectedProduct.pDiscount > 0 ? `${selectedProduct.pDiscount}% off` : 'No discount'],
                ['Status', <span style={badge(selectedProduct.pStatus)}>{selectedProduct.pStatus}</span>],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', padding: '11px 0', borderBottom: '1px solid #f4f5f8' }}>
                  <div style={{ width: '150px', fontSize: '11px', fontWeight: 600, color: '#8b8fa3', textTransform: 'uppercase', letterSpacing: '.5px', flexShrink: 0 }}>{l}</div>
                  <div style={{ fontSize: '13px', color: '#1a1a3e', fontWeight: 500, flex: 1 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 26px 22px' }}>
              <button style={cancelBtnS} onClick={() => setModal(null)}>Close</button>
              <button className="sb" style={submitBtnS} onClick={() => { setModal(null); setTimeout(() => openEdit(selectedProduct), 100); }}>Edit Product</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === 'delete' && selectedProduct && (
        <div style={overlayS} onClick={e => e.target === e.currentTarget && !deleteLoading && setModal(null)}>
          <div style={modalSize('sm')}>
            <div style={{ padding: '36px 28px 28px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                {deleteLoading ? <div style={{ animation: 'spin 1s linear infinite' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg></div> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a3e', margin: '0 0 8px' }}>Delete Product?</h2>
              <p style={{ fontSize: '13px', color: '#8b8fa3', margin: '0 0 4px' }}>This action cannot be undone.</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#555', margin: '0 0 22px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>"{selectedProduct.pName}"</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button style={cancelBtnS} onClick={() => setModal(null)} disabled={deleteLoading}>Cancel</button>
                <button className={`db ${deleteLoading ? 'btn-disabled' : ''}`} style={{ ...delBtnS, opacity: deleteLoading ? 0.7 : 1 }} onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Deleting...</span> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;