import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { bannerAPI } from '../Services/api';

export default function Banneradd({
  onBannerAdded,
  onCancel,
  bannerToEdit,
  showToast,
}) {

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  // ================= EDIT MODE =================
  useEffect(() => {

    if (bannerToEdit) {

      setFormData({
        title:
          bannerToEdit.title ||
          bannerToEdit.name ||
          bannerToEdit.title_text ||
          bannerToEdit.banner_title ||
          bannerToEdit.bannerTitle ||
          bannerToEdit.meta?.title ||
          bannerToEdit.data?.title ||
          '',
        caption:
          bannerToEdit.body ||
          bannerToEdit.subtitle ||
          bannerToEdit.description ||
          bannerToEdit.sub_text ||
          bannerToEdit.caption ||
          '',
        images: [],
      });
      setImagePreviews([]);
    }

  }, [bannerToEdit]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview?.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {

    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      const file = files[0];
      
      // Check file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setError('Image size must be less than 1MB');
        showToast?.('Image size must be less than 1MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        showToast?.('Please select a valid image file', 'error');
        return;
      }

      setError('');
      setFormData((prev) => ({
        ...prev,
        images: [file],
      }));

      setImagePreviews((prev) => {
        prev.forEach((preview) => {
          if (preview?.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });

        return [URL.createObjectURL(file)];
      });

    } else {
      setFormData((prev) => ({
        ...prev,
        images: [],
      }));
      setImagePreviews([]);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!formData.title.trim()) {

      setError('Offer Title is required');

      return;
    }

    if (!formData.caption.trim()) {

      setError('Caption is required');

      return;
    }

    if (!bannerToEdit && formData.images.length === 0) {

      setError('Image is required');

      return;
    }

    try {

      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('body', formData.caption.trim());

      // Append image file if provided
      if (formData.images.length > 0) {
        data.append('image', formData.images[0]);
      }

      // Call the banner API to save
      if (bannerToEdit) {
        data.append('id', bannerToEdit.id);
      }

      await bannerAPI.uploadBanner(data);

      showToast?.(
        bannerToEdit ? 'Offer Zone updated successfully!' : 'Offer Zone added successfully!',
        'success'
      );

      onBannerAdded?.();

    } catch (error) {

      console.error('Save Offer Zone Error:', error);

      let errorMsg = 'Failed to save offer zone';
      
      if (error.message === 'Failed to fetch' || error.message.includes('Connection failed')) {
        errorMsg = 'Connection error: Unable to reach the server.';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid offer zone data.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error: Please try again later.';
      }

      setError(errorMsg);
      showToast?.(errorMsg, 'error');

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="page">

      <div className="page__header">

        <h1 className="page__title">
          {bannerToEdit
            ? 'Edit Offer Zone'
            : 'Add Offer Zone'}
        </h1>

      </div>

      <div style={{
        maxWidth: '600px',
      }}>

        <form onSubmit={handleSubmit}>

          {error && (

            <div className="alert alert-error">
              {error}
            </div>

          )}

          <Input
            label="Offer Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter offer title"
          />

          <Input
            label="Caption"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            placeholder="Enter caption"
          />

          <div style={{
            marginTop: '16px',
            marginBottom: '16px',
          }}>

            <label className="field__label">
              Image
            </label>

            <div style={{
              position: 'relative',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px',
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '8px',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.backgroundColor = '#fffbf0';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#f9fafb';
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleImageChange({ target: { files } });
              }
            }}
            >
              <input
                ref={(input) => {
                  if (input) {
                    input.style.display = 'none';
                  }
                }}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                  Click to upload or drag and drop
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  PNG, JPG, GIF up to 1MB
                </div>
              </label>
            </div>

          </div>

          {imagePreviews.length > 0 && (

            <div style={{
              marginBottom: '16px',
              marginTop: '16px',
            }}>
              <label className="field__label" style={{ marginBottom: '8px' }}>
                Preview
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
              }}>
                {imagePreviews.map((preview, index) => (
                  <img
                    key={`${preview}-${index}`}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                ))}
              </div>
            </div>

          )}

          <div style={{
            display: 'flex',
            gap: '12px',
          }}>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {bannerToEdit
                ? 'Update Offer Zone'
                : 'Add Offer Zone'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}