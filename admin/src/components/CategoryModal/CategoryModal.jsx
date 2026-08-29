import React from 'react';
import Modal from '../Modal/Modal';
import { Upload } from 'lucide-react';
import { assets } from '../../assets/assets';

const CategoryModal = ({
  isOpen,
  mode = 'add',
  formData,
  setFormData,
  imageFile,
  setImageFile,
  selectedCategory,
  onClose,
  onSubmit,
  getImageSrc
}) => {
  if (!isOpen) return null;

  const isAdd = mode === 'add';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isAdd ? "Add New Category" : "Edit Category"}
      maxWidth="480px"
    >
      <form onSubmit={onSubmit} className="admin-form">
        <div className="modal-body">
          <div className="image-upload-wrapper">
            <label htmlFor="cat-image-input" className="image-upload-box">
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : (selectedCategory?.image ? getImageSrc(selectedCategory.image) : assets.upload_area)} 
                alt="Upload Category Icon" 
                className="upload-preview" 
              />
              <div className="upload-overlay">
                <Upload size={22} color="#ffffff" />
                <span>Upload Icon</span>
              </div>
            </label>
            <input 
              type="file" 
              id="cat-image-input" 
              hidden 
              onChange={(e) => setImageFile(e.target.files[0])} 
            />
          </div>

          <div className="form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              placeholder="e.g. Italian Pizza" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
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

        <div className="modal-footer form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Category
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
