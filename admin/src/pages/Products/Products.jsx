import React, { useEffect, useState } from 'react';
import './Products.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { Plus, Edit3, Trash2, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleProducts } from '../../config/api';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isTrashView, setIsTrashView] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [imageFile, setImageFile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: 0,
    availability: true,
    status: 'Active'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [isTrashView]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/category/list`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const activeCats = res.data.data.filter(c => !c.isDeleted && c.status !== 'Inactive');
        setCategoriesList(activeCats);
      }
    } catch (err) {
      console.log("Using fallback category list");
      setCategoriesList([
        { name: 'Salad' },
        { name: 'Rolls' },
        { name: 'Deserts' },
        { name: 'Sandwich' },
        { name: 'Cake' },
        { name: 'Pure Veg' },
        { name: 'Pasta' },
        { name: 'Noodles' }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const url = isTrashView 
        ? `${API_URL}/api/food/list?deletedOnly=true`
        : `${API_URL}/api/food/list`;

      const res = await axios.get(url);
      if (res.data.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback products list");
    }
  };

  const handleOpenAdd = () => {
    setImageFile(false);
    const defaultCat = categoriesList.length > 0 ? categoriesList[0].name : 'Salad';
    setFormData({
      name: '',
      description: '',
      category: defaultCat,
      price: '',
      discount: 0,
      availability: true,
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setSelectedProduct(prod);
    setImageFile(false);
    const defaultCat = prod.category || (categoriesList.length > 0 ? categoriesList[0].name : 'Salad');
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      category: defaultCat,
      price: prod.price || '',
      discount: prod.discount || 0,
      availability: prod.availability !== undefined ? prod.availability : true,
      status: prod.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCategoryName = formData.category || (categoriesList.length > 0 ? categoriesList[0].name : 'Salad');
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", Number(formData.price));
      form.append("category", selectedCategoryName);
      form.append("discount", Number(formData.discount));
      form.append("availability", formData.availability);
      form.append("status", formData.status);
      if (imageFile) {
        form.append("image", imageFile);
      }

      const res = await axios.post(`${API_URL}/api/food/add`, form);
      if (res.data.success) {
        toast.success("Food product added successfully!");
        fetchProducts();
      } else {
        setProducts([...products, { ...formData, _id: Date.now().toString(), image: imageFile ? URL.createObjectURL(imageFile) : 'food_1.png' }]);
      }
    } catch (err) {
      setProducts([...products, { ...formData, _id: Date.now().toString(), image: imageFile ? URL.createObjectURL(imageFile) : 'food_1.png' }]);
    }
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("id", selectedProduct._id);
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", Number(formData.price));
      form.append("category", formData.category);
      form.append("discount", Number(formData.discount));
      form.append("availability", formData.availability);
      form.append("status", formData.status);
      if (imageFile) {
        form.append("image", imageFile);
      }

      await axios.post(`${API_URL}/api/food/update`, form);
      toast.success("Food product updated!");
      fetchProducts();
    } catch (err) {
      setProducts(products.map(p => p._id === selectedProduct._id ? { ...p, ...formData } : p));
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await axios.post(`${API_URL}/api/food/remove`, { id: selectedProduct._id });
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.info(`"${selectedProduct.name}" moved to trash (soft deleted)`);
    } catch (err) {
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.info("Product removed");
    }
    setIsDeleteOpen(false);
  };

  const handleRestoreProduct = async (prod) => {
    try {
      await axios.post(`${API_URL}/api/food/restore`, { id: prod._id });
      setProducts(products.filter(p => p._id !== prod._id));
      toast.success(`"${prod.name}" restored successfully!`);
    } catch (err) {
      toast.error("Failed to restore product");
    }
  };

  const handlePurgeProduct = async () => {
    if (!selectedProduct) return;
    try {
      await axios.post(`${API_URL}/api/food/purge`, { id: selectedProduct._id });
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.error(`"${selectedProduct.name}" permanently deleted from database`);
    } catch (err) {
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      toast.error("Product permanently deleted");
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

  // Dynamic filter options from live database categories
  const dynamicCategoryOptions = categoriesList.length > 0 
    ? categoriesList.map(c => c.name)
    : ['Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'];

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => (
        <div className="product-cell">
          <img 
            src={getImageSrc(row.image)} 
            alt={row.name} 
            className="product-img-thumb"
            onError={(e) => { e.target.src = assets.upload_area; }}
          />
          <div>
            <p className="product-title-text">{row.name}</p>
            <p className="product-desc-sub">{row.description}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessor: 'category',
      render: (row) => <span className="category-pill">{row.category}</span>
    },
    { 
      header: 'Price', 
      accessor: 'price',
      render: (row) => (
        <div>
          <span className="price-tag">₹{row.price}</span>
          {row.discount > 0 && <span className="discount-badge">-{row.discount}%</span>}
        </div>
      )
    },
    {
      header: 'Stock',
      accessor: 'availability',
      render: (row) => (
        <span className={`stock-pill ${row.availability ? 'in-stock' : 'out-of-stock'}`}>
          {row.availability ? 'In Stock' : 'Out of Stock'}
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
                title="Restore Product to Active List" 
                onClick={() => handleRestoreProduct(row)}
                style={{ color: '#10b981', background: '#ecfdf5' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="action-btn delete" 
                title="Permanently Delete (Hard Delete)" 
                onClick={() => { setSelectedProduct(row); setIsPurgeOpen(true); }}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn edit" title="Edit Product" onClick={() => handleOpenEdit(row)}>
                <Edit3 size={16} />
              </button>
              <button className="action-btn delete" title="Move to Trash (Soft Delete)" onClick={() => { setSelectedProduct(row); setIsDeleteOpen(true); }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="products-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">
            {isTrashView ? "Trash / Soft-Deleted Food Products" : "Food Products Catalog"}
          </h2>
          <p className="page-sub-title">
            {isTrashView ? "Restore soft-deleted items or permanently delete (hard delete) from database" : "Manage menu items, prices, category tags, and availability"}
          </p>
        </div>
        {!isTrashView && (
          <button className="btn-primary flex-btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Food Product
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search product name, category..."
        filterOptions={dynamicCategoryOptions}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        showTrashToggle={true}
        isTrashView={isTrashView}
        onToggleTrash={() => setIsTrashView(!isTrashView)}
      />

      {/* Add / Edit Product Modal */}
      <Modal 
        isOpen={isAddModalOpen || isEditModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
        title={isAddModalOpen ? "Add New Food Product" : "Edit Food Product"}
        maxWidth="580px"
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="admin-form">
          <div className="modal-body">
            <div className="image-upload-wrapper">
              <label htmlFor="food-image-input" className="image-upload-box">
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : (selectedProduct?.image ? getImageSrc(selectedProduct.image) : assets.upload_area)} 
                  alt="Upload Food" 
                  className="upload-preview" 
                />
                <div className="upload-overlay">
                  <Upload size={22} color="#ffffff" />
                  <span>Upload Food Image</span>
                </div>
              </label>
              <input 
                type="file" 
                id="food-image-input" 
                hidden 
                onChange={(e) => setImageFile(e.target.files[0])} 
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Greek Salad" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Category (Live from Database)</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categoriesList && categoriesList.length > 0 ? (
                    categoriesList.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Salad">Salad</option>
                      <option value="Rolls">Rolls</option>
                      <option value="Deserts">Deserts</option>
                      <option value="Sandwich">Sandwich</option>
                      <option value="Cake">Cake</option>
                      <option value="Pure Veg">Pure Veg</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Noodles">Noodles</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Product Description</label>
              <textarea 
                rows="3" 
                placeholder="Write a tasty description..." 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="25" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Discount (%)</label>
                <input 
                  type="number" 
                  placeholder="10" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-checkbox-row">
              <input 
                type="checkbox" 
                id="avail-check" 
                checked={formData.availability} 
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })} 
              />
              <label htmlFor="avail-check">Available in stock for delivery</label>
            </div>
          </div>

          <div className="modal-footer form-actions">
            <button type="button" className="btn-secondary" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</button>
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteProduct}
        title="Move Product to Trash"
        message={`Are you sure you want to move "${selectedProduct?.name}" to trash? You can restore it anytime from the Trash view.`}
      />

      {/* Permanent Hard Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isPurgeOpen} 
        onClose={() => setIsPurgeOpen(false)} 
        onConfirm={handlePurgeProduct}
        title="Permanently Delete Product (Hard Delete)"
        message={`⚠️ CAUTION: Are you sure you want to PERMANENTLY delete "${selectedProduct?.name}" from the database and disk? This action CANNOT be undone.`}
      />
    </div>
  );
};

export default Products;
