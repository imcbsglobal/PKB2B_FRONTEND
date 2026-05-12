import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { bannerAPI } from '../Services/api';

export default function Banneradd({
  onBannerAdded,
  onCancel,
  bannerToEdit,
}) {

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    url: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  // ================= EDIT MODE =================
  useEffect(() => {

    if (bannerToEdit) {

      setFormData({
        title: bannerToEdit.title || '',
        subtitle: bannerToEdit.subtitle || '',
        url: bannerToEdit.url || '',
        image: null,
      });

      setImagePreview(bannerToEdit.image);
    }

  }, [bannerToEdit]);

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

    const file = e.target.files?.[0];

    if (file) {

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();

      reader.onloadend = () => {

        setImagePreview(reader.result);
      };

      reader.readAsDataURL(file);
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

    if (!bannerToEdit && !formData.image) {

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

      if (formData.image) {

        data.append('image', formData.image);
      }

      if (bannerToEdit) {

        data.append('id', bannerToEdit.id);
      }

      await bannerAPI.uploadBanner(data);

      onBannerAdded?.();

    } catch (error) {

      console.error('Upload Banner Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to upload banner';

      setError(errorMsg);

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

          {imagePreview && (

            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            />

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