import React, { useEffect, useState } from 'react';
import './Categories.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import CategoryModal from '../../components/CategoryModal/CategoryModal';
import { Plus, Edit3, Trash2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleCategories } from '../../config/api';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState(sampleCategories);
  const [isTrashView, setIsTrashView] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [imageFile, setImageFile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchCategories();
  }, [isTrashView]);

  const fetchCategories = async () => {
    try {
      const url = isTrashView 
        ? `${API_URL}/api/category/list?deletedOnly=true`
        : `${API_URL}/api/category/list`;

      const res = await axios.get(url);
      if (res.data.success && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback categories list");
    }
  };

  const handleOpenAdd = () => {
    setImageFile(false);
    setFormData({ name: '', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setImageFile(false);
    setFormData({
      name: cat.name || '',
      status: cat.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("status", formData.status);
      if (imageFile) form.append("image", imageFile);

      const res = await axios.post(`${API_URL}/api/category/add`, form);
      if (res.data.success) {
        toast.success("Category Added Successfully!");
        fetchCategories();
      } else {
        setCategories([...categories, { ...formData, _id: Date.now().toString(), productCount: 0, image: imageFile ? URL.createObjectURL(imageFile) : 'menu_1.png' }]);
      }
    } catch (err) {
      setCategories([...categories, { ...formData, _id: Date.now().toString(), productCount: 0, image: imageFile ? URL.createObjectURL(imageFile) : 'menu_1.png' }]);
    }
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("id", selectedCategory._id);
      form.append("name", formData.name);
      form.append("status", formData.status);
      if (imageFile) form.append("image", imageFile);

      await axios.post(`${API_URL}/api/category/update`, form);
      toast.success("Category Updated!");
      fetchCategories();
    } catch (err) {
      setCategories(categories.map(c => c._id === selectedCategory._id ? { ...c, ...formData } : c));
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await axios.post(`${API_URL}/api/category/remove`, { id: selectedCategory._id });
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
      toast.info(`"${selectedCategory.name}" moved to trash (soft deleted)`);
    } catch (err) {
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
    }
    setIsDeleteOpen(false);
  };

  const handleRestoreCategory = async (cat) => {
    try {
      await axios.post(`${API_URL}/api/category/restore`, { id: cat._id });
      setCategories(categories.filter(c => c._id !== cat._id));
      toast.success(`"${cat.name}" restored successfully!`);
    } catch (err) {
      toast.error("Failed to restore category");
    }
  };

  const handlePurgeCategory = async () => {
    if (!selectedCategory) return;
    try {
      await axios.post(`${API_URL}/api/category/purge`, { id: selectedCategory._id });
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
      toast.error(`Category "${selectedCategory.name}" permanently deleted from database`);
    } catch (err) {
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
    }
    setIsPurgeOpen(false);
  };

  const getImageSrc = (img) => {
    if (!img) return assets.upload_area;
    if (typeof img === 'object') return URL.createObjectURL(img);
    if (img.startsWith('blob:') || img.startsWith('data:')) return img;
    if (assets[img]) return assets[img];
    return `${API_URL}/images/${img}`;
  };

  const columns = [
    {
      header: 'Category',
      accessor: 'name',
      render: (row) => (
        <div className="cat-cell">
          <img 
            src={getImageSrc(row.image)} 
            alt={row.name} 
            className="cat-img-thumb"
            onError={(e) => { e.target.src = assets.upload_area; }}
          />
          <span className="cat-title-text">{row.name}</span>
        </div>
      )
    },
    { 
      header: 'Product Count', 
      accessor: 'productCount',
      render: (row) => (
        <span className="count-badge-pill">
          {row.productCount || 0} Foods
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          {isTrashView ? (
            <>
              <button 
                className="action-btn edit" 
                title="Restore Category" 
                onClick={() => handleRestoreCategory(row)}
                style={{ color: '#10b981', background: '#ecfdf5' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="action-btn delete" 
                title="Permanently Delete (Hard Delete)" 
                onClick={() => { setSelectedCategory(row); setIsPurgeOpen(true); }}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn edit" title="Edit Category" onClick={() => handleOpenEdit(row)}>
                <Edit3 size={16} />
              </button>
              <button className="action-btn delete" title="Move to Trash (Soft Delete)" onClick={() => { setSelectedCategory(row); setIsDeleteOpen(true); }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="categories-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">
            {isTrashView ? "Trash / Soft-Deleted Categories" : "Category Management"}
          </h2>
          <p className="page-sub-title">
            {isTrashView ? "Restore soft-deleted categories or permanently delete (hard delete) from database" : "Organize food products into menu categories"}
          </p>
        </div>
        {!isTrashView && (
          <button className="btn-primary flex-btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search category name..."
        filterOptions={['Active', 'Inactive']}
        showTrashToggle={true}
        isTrashView={isTrashView}
        onToggleTrash={() => setIsTrashView(!isTrashView)}
      />

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isAddModalOpen || isEditModalOpen}
        mode={isAddModalOpen ? 'add' : 'edit'}
        formData={formData}
        setFormData={setFormData}
        imageFile={imageFile}
        setImageFile={setImageFile}
        selectedCategory={selectedCategory}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}
        getImageSrc={getImageSrc}
      />

      {/* Soft Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteCategory}
        title="Move Category to Trash"
        message={`Are you sure you want to move category "${selectedCategory?.name}" to trash?`}
      />

      {/* Permanent Hard Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isPurgeOpen} 
        onClose={() => setIsPurgeOpen(false)} 
        onConfirm={handlePurgeCategory}
        title="Permanently Delete Category (Hard Delete)"
        message={`⚠️ CAUTION: Are you sure you want to PERMANENTLY delete category "${selectedCategory?.name}" from database? This cannot be undone.`}
      />
    </div>
  );
};

export default Categories;
