import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import { bannerAPI, productBatchAPI, resolveMediaUrl } from '../Services/api';

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
    item_codes: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [error, setError] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);

  // ================= ITEM SEARCH =================
  useEffect(() => {
    const searchTerm = itemSearch.trim();

    if (searchTerm.length < 2) {
      setSearchResults([]);
      setItemsLoading(false);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setItemsLoading(true);
        const response = await productBatchAPI.searchItems(
          searchTerm,
          abortController.signal
        );
        const payload = response?.data;
        const apiItems = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : [];

        // Keep only code/barcode matches for accurate barcode search.
        const normalizedSearch = searchTerm.toLowerCase();
        const matchedItems = apiItems.filter((item) => {
          const code = String(item?.code || '').toLowerCase();
          const barcode = String(item?.barcode || '').toLowerCase();
          return code.includes(normalizedSearch) || barcode.includes(normalizedSearch);
        });

        setSearchResults(matchedItems.slice(0, 20));

        // Cache returned items for selected-cards rendering.
        setAllItems((prev) => {
          const map = new Map(
            prev.map((item) => [extractItemCode(item), item])
          );
          matchedItems.forEach((item) => {
            map.set(extractItemCode(item), item);
          });
          return Array.from(map.values());
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Error searching items:', err);
        setSearchResults([]);
        showToast?.('Failed to search items', 'error');
      } finally {
        setItemsLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [itemSearch, showToast]);

  // ================= EDIT MODE =================
  useEffect(() => {

    if (bannerToEdit) {

      // Normalize item_codes to ensure they're strings
      let itemCodes = bannerToEdit.item_codes || bannerToEdit.items || [];
      if (!Array.isArray(itemCodes)) {
        itemCodes = Object.values(itemCodes || {});
      }
      
      // Ensure all codes are strings and cleaned
      itemCodes = itemCodes.map(code => {
        // If it's an object, extract the code field or id
        if (typeof code === 'object' && code !== null) {
          code = code.code || code.id || code.item_code || String(code);
        }
        return String(code).split(':')[0].trim();
      });

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
        item_codes: itemCodes,
      });

      // Load banner image preview if editing
      if (bannerToEdit.image || bannerToEdit.image_url || bannerToEdit.banner_image) {
        const imageUrl = resolveMediaUrl(
          bannerToEdit.image || 
          bannerToEdit.image_url || 
          bannerToEdit.banner_image
        );
        setImagePreviews([imageUrl]);
      } else {
        setImagePreviews([]);
      }
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

  // ================= ITEM SELECTION =================
  const extractItemCode = (item) => {
    // Prioritize 'code' field (simpler codes like "08308")
    // Fall back to barcode only if code doesn't exist
    let code = item?.code || item?.barcode || item?.id;
    
    // If it's an object, extract string representation
    if (typeof code === 'object') {
      code = String(Object.values(code)[0] || code);
    }
    
    // Convert to string and trim
    code = String(code || '').trim();
    
    // Remove any trailing info like " : 1"
    code = code.split(':')[0].trim();
    
    return code;
  };

  const handleItemToggle = (item) => {
    const itemCode = extractItemCode(item);
    if (!itemCode) {
      console.warn('Invalid item code extracted:', item);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      item_codes: prev.item_codes.includes(itemCode)
        ? prev.item_codes.filter((code) => code !== itemCode)
        : [...prev.item_codes, itemCode],
    }));
  };

  const searchTerm = itemSearch.trim();

  const filteredItems = searchResults;

  const selectedItemsList = allItems.filter((item) => {
    const itemCode = extractItemCode(item);
    return formData.item_codes.includes(itemCode);
  }).concat(
    // Also include items that are in item_codes but not in allItems (for display purposes)
    formData.item_codes
      .filter(code => !allItems.some(item => extractItemCode(item) === code))
      .map(code => ({
        code,
        name: code,
        id: code,
      }))
  );

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

      // Append item codes if selected - send each code separately
      if (formData.item_codes.length > 0) {
        // Clean each item code
        const cleanedCodes = formData.item_codes.map(code => {
          const cleaned = String(code).split(':')[0].trim();
          return cleaned;
        });
        console.log('Final item codes being sent (one by one):', cleanedCodes);
        // Append each code separately to FormData
        cleanedCodes.forEach(code => {
          data.append('item_codes', code);
        });
      }

      // Append image file if provided
      if (formData.images.length > 0) {
        data.append('image', formData.images[0]);
      }

      // Call the banner API to save
      if (bannerToEdit) {
        // Use edit endpoint for updates
        await bannerAPI.editBanner(bannerToEdit.id, data);
      } else {
        // Use upload endpoint for new banners
        await bannerAPI.uploadBanner(data);
      }

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

          {/* ================= 1. ITEMS SELECTION ================= */}
          <div style={{
            marginTop: '0px',
            marginBottom: '16px',
          }}>
            <label className="field__label">
              Select Items for Offer
            </label>

            <div style={{
              position: 'relative',
              marginTop: '8px',
            }}>
              <input
                type="text"
                placeholder="Type barcode or item code to search..."
                value={itemSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemSearch(value);
                  setShowItemsDropdown(value.trim().length >= 2);
                }}
                onFocus={() => {
                  setShowItemsDropdown(searchTerm.length >= 2);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />

              {showItemsDropdown && searchTerm.length >= 2 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                  {itemsLoading ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Spinner size="md" color="#f59e0b" />
                        <div style={{ color: '#6b7280' }}>Searching items…</div>
                      </div>

                      <div style={{ width: '100%', marginTop: '8px', display: 'grid', gap: '8px' }}>
                        {[1,2,3].map((i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#e5e7eb', borderRadius: '2px', animation: 'pulse 1.6s infinite' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ height: '12px', width: '60%', background: '#e5e7eb', borderRadius: '4px', marginBottom: '6px', animation: 'pulse 1.6s infinite' }} />
                              <div style={{ height: '10px', width: '40%', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 1.6s infinite' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <style>{`@keyframes pulse { 0%,100%{opacity:0.6}50%{opacity:1} }`}</style>
                    </div>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const itemCode = extractItemCode(item);
                      const isSelected = formData.item_codes.includes(itemCode);
                      const itemName = item.name || item.title || 'N/A';
                      const itemPrice = item.fourthprice || item.salesprice || item.price || 0;
                      const itemImage = item.url2 || item.image || '';
                      const itemBrand = item.brand || '';

                      return (
                        <label
                          key={itemCode}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f3f4f6' : '#fff',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s',
                            gap: '12px',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected ? '#f3f4f6' : '#fff';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleItemToggle(item)}
                            style={{
                              minWidth: '16px',
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                            }}
                          />
                          
                          {/* Item Image */}
                          {itemImage && (
                            <img
                              src={itemImage}
                              alt={itemName}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                backgroundColor: '#f3f4f6',
                              }}
                            />
                          )}
                          
                          {/* Item Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                              {itemName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                              Code: {itemCode} {itemBrand && `• ${itemBrand}`}
                            </div>
                            <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500', marginTop: '2px' }}>
                              ₹ {Number(itemPrice || 0).toFixed(2)}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>
                      No matching items found for this code
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Display selected items */}
            {selectedItemsList.length > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                  Selected Items ({selectedItemsList.length})
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px',
                }}>
                  {selectedItemsList.map((item) => {
                    const itemCode = extractItemCode(item);
                    // Use proper item name, with fallback to code
                    const itemName = item.name || item.title || itemCode || 'Item';
                    const itemPrice = item.fourthprice || item.salesprice || item.price || 0;
                    const itemImage = item.url2 || item.image || '';

                    return (
                      <div
                        key={itemCode}
                        style={{
                          position: 'relative',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '2px solid #4f46e5',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Image */}
                        {itemImage && (
                          <img
                            src={itemImage}
                            alt={itemName}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              backgroundColor: '#f3f4f6',
                            }}
                          />
                        )}
                        
                        {/* Content */}
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#1f2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {itemName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                            {itemCode}
                          </div>
                          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
                            ₹ {Number(itemPrice || 0).toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleItemToggle(item)}
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Close dropdown when clicking outside */}
          {showItemsDropdown && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99,
              }}
              onClick={() => setShowItemsDropdown(false)}
            />
          )}

          {/* ================= 2. OFFER TITLE ================= */}
          <Input
            label="Offer Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter offer title"
          />

          {/* ================= 3. CAPTION ================= */}
          <Input
            label="Caption"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            placeholder="Enter caption"
          />

          {/* ================= 4. IMAGE UPLOAD ================= */}
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

          {/* ================= 5. SUBMIT BUTTON ================= */}

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