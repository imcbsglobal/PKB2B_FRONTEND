import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { bannerAPI, resolveMediaUrl } from '../Services/api';

export default function Banneradd({
  onBannerAdded,
  onCancel,
  bannerToEdit,
  showToast,
}) {

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    url: '',
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
        subtitle:
          bannerToEdit.subtitle ||
          bannerToEdit.description ||
          bannerToEdit.sub_text ||
          '',
        url: bannerToEdit.url || bannerToEdit.link || '',
        images: [],
      });

      const imageUrl = resolveMediaUrl(
        bannerToEdit.image ||
        bannerToEdit.image_url ||
        bannerToEdit.banner_image ||
        bannerToEdit.banner_image_url
      );
      
      setImagePreviews(imageUrl ? [imageUrl] : []);
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

      setError('Banner title is required');

      return;
    }

    if (!bannerToEdit && formData.images.length === 0) {

      setError('Banner image is required');

      return;
    }

    try {

      setLoading(true);

      const data = new FormData();

      data.append('title', formData.title.trim());
      
      if (formData.subtitle.trim()) {
        data.append('subtitle', formData.subtitle.trim());
      }
      
      if (formData.url.trim()) {
        data.append('url', formData.url.trim());
      }

      // Append image file (single file, not array)
      if (formData.images.length > 0) {
        data.append('image', formData.images[0]);
      }

      if (bannerToEdit) {
        data.append('id', bannerToEdit.id);
      }

      await bannerAPI.uploadBanner(data);

      showToast?.(
        bannerToEdit ? 'Banner updated successfully!' : 'Banner added successfully!',
        'success'
      );

      onBannerAdded?.();

    } catch (error) {

      console.error('Upload Banner Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        error: error,
      });

      let errorMsg = 'Failed to upload banner';
      
      if (error.message === 'Failed to fetch' || error.message.includes('Connection failed')) {
        errorMsg = 'Connection error: Unable to reach the server. Please check your internet connection and ensure the backend is running.';
      } else if (error.message?.includes('CORS')) {
        errorMsg = 'CORS Error: Backend not configured for cross-origin requests.';
      } else if (error.response?.status === 413) {
        errorMsg = 'File too large: Please select an image smaller than 1MB.';
      } else if (error.response?.status === 415) {
        errorMsg = 'Unsupported file type: Please upload a valid image file (JPG, PNG, GIF).';
      } else if (error.response?.status === 403) {
        errorMsg = 'Access Denied: Please login again.';
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid banner data. Please check all fields.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error: Please try again later or contact support.';
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
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
            ? 'Edit Banner'
            : 'Add Banner'}
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
            label="Banner Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter title"
          />

          <Input
            label="Subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            placeholder="Enter subtitle"
          />

          <Input
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://example.com"
          />

          <div style={{
            marginTop: '16px',
            marginBottom: '16px',
          }}>

            <label className="field__label">
              Banner Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

          </div>

          {imagePreviews.length > 0 && (

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}>
              {imagePreviews.map((preview, index) => (
                <img
                  key={`${preview}-${index}`}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              ))}
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
                ? 'Update Banner'
                : 'Add Banner'}
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