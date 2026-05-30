import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import BarcodeInput from '../components/BarcodeInput';
import { bannerAPI, productBatchAPI, resolveMediaUrl } from '../Services/api';
import { useBarcodeCache } from '../hooks/useBarcodeCache';

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
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const barcodeInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Use barcode cache to avoid duplicate API calls
  const { getFromCache, setInCache, isCached } = useBarcodeCache();

  // ================= EXTRACT ITEM CODE =================
  const extractItemCode = useCallback((item) => {
    let code = item?.code || item?.barcode || item?.id;
    if (typeof code === 'object') {
      code = String(Object.values(code)[0] || code);
    }
    code = String(code || '').trim();
    code = code.split(':')[0].trim();
    return code;
  }, []);

  // ================= BARCODE SEARCH HANDLER =================
  const handleBarcodeSearch = useCallback(async (barcode) => {
    const trimmedBarcode = String(barcode || '').trim();
    
    if (!trimmedBarcode) {
      barcodeInputRef.current?.showError('Please enter a barcode');
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setBarcodeLoading(true);

      // Check cache first to avoid API call
      if (isCached(trimmedBarcode)) {
        const cachedProduct = getFromCache(trimmedBarcode);
        if (cachedProduct) {
          // Check if already added
          if (selectedProducts.some(p => extractItemCode(p) === extractItemCode(cachedProduct))) {
            barcodeInputRef.current?.clearInput();
            return;
          }
          // Add product and show success
          setSelectedProducts(prev => [...prev, cachedProduct]);
          setFormData(prev => ({
            ...prev,
            item_codes: [...prev.item_codes, extractItemCode(cachedProduct)],
          }));
          barcodeInputRef.current?.showSuccess();
          return;
        }
      }

      // API Call: Search by exact barcode with AbortController
      const response = await productBatchAPI.searchItemByBarcode(
        trimmedBarcode,
        abortControllerRef.current.signal
      );

      const payload = response?.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      console.log('🔍 Barcode Search Debug:', {
        searchedBarcode: trimmedBarcode,
        apiResponse: payload,
        itemsFound: items.length,
        items: items.map(i => ({
          id: i?.id,
          barcode: i?.barcode,
          code: i?.code,
          name: i?.name,
        })),
      });

      if (items.length === 0) {
        barcodeInputRef.current?.showError('Product Not Found');
        return;
      }

      // Find exact barcode match (strict matching - no fallback)
      let product = items.find(item => {
        const itemBarcode = String(item?.barcode || '').trim();
        return itemBarcode === trimmedBarcode;
      });

      // Fallback: if no exact match, try case-insensitive match
      if (!product) {
        product = items.find(item => {
          const itemBarcode = String(item?.barcode || '').toLowerCase().trim();
          return itemBarcode === trimmedBarcode.toLowerCase();
        });
      }

      // If still no match found, do NOT fallback to items[0] - show error instead
      if (!product) {
        barcodeInputRef.current?.showError('Product Not Found');
        return;
      }

      console.log('✅ Selected Product:', {
        selectedProduct: {
          id: product?.id,
          barcode: product?.barcode,
          code: product?.code,
          name: product?.name,
          price: product?.fourthprice || product?.salesprice || product?.price,
        },
      });

      if (!product) {
        barcodeInputRef.current?.showError('Product Not Found');
        return;
      }

      // Check if already added (by exact item code match)
      const itemCode = extractItemCode(product);
      if (selectedProducts.some(p => extractItemCode(p) === itemCode)) {
        barcodeInputRef.current?.clearInput();
        return;
      }

      // Cache the result
      setInCache(trimmedBarcode, product);

      // Add to selected products
      setSelectedProducts(prev => [...prev, product]);
      setFormData(prev => ({
        ...prev,
        item_codes: [...prev.item_codes, itemCode],
      }));

      // Show success message and clear input
      barcodeInputRef.current?.showSuccess();

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Barcode search cancelled');
        return;
      }
      console.error('Barcode search error:', err);
      barcodeInputRef.current?.clearInput();
    } finally {
      setBarcodeLoading(false);
    }
  }, [selectedProducts, isCached, getFromCache, setInCache, showToast, extractItemCode]);

  // ================= REMOVE PRODUCT =================
  const handleRemoveProduct = useCallback((itemCode) => {
    setSelectedProducts(prev => 
      prev.filter(p => extractItemCode(p) !== itemCode)
    );
    setFormData(prev => ({
      ...prev,
      item_codes: prev.item_codes.filter(code => code !== itemCode),
    }));
  }, [extractItemCode]);

  // ================= EDIT MODE =================
  useEffect(() => {
    if (bannerToEdit) {
      let itemCodes = bannerToEdit.item_codes || bannerToEdit.items || [];
      if (!Array.isArray(itemCodes)) {
        itemCodes = Object.values(itemCodes || {});
      }
      
      itemCodes = itemCodes.map(code => {
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

      // Fetch full product details for existing item_codes
      const fetchProducts = async () => {
        try {
          const products = [];
          for (const code of itemCodes) {
            const response = await productBatchAPI.getProductByCode(code);
            const payload = response?.data;
            let product = null;
            
            if (Array.isArray(payload)) {
              product = payload[0];
            } else if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
              product = payload?.results?.[0] || payload;
            }
            
            if (product && product.id) {
              products.push(product);
              // Cache the product for faster lookup
              const barcode = String(product?.barcode || '').trim();
              if (barcode) {
                setInCache(barcode, product);
              }
            }
          }
          setSelectedProducts(products);
        } catch (err) {
          console.error('Error fetching products for edit mode:', err);
        }
      };

      if (itemCodes.length > 0) {
        fetchProducts();
      }

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
  }, [bannerToEdit, setInCache]);

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
      
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setError('Image size must be less than 1MB');
        showToast?.('Image size must be less than 1MB', 'error');
        return;
      }

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

      if (formData.item_codes.length > 0) {
        const cleanedCodes = formData.item_codes.map(code => {
          const cleaned = String(code).split(':')[0].trim();
          return cleaned;
        });
        console.log('Final item codes being sent:', cleanedCodes);
        cleanedCodes.forEach(code => {
          data.append('item_codes', code);
        });
      }

      if (formData.images.length > 0) {
        data.append('image', formData.images[0]);
      }

      if (bannerToEdit) {
        await bannerAPI.editBanner(bannerToEdit.id, data);
      } else {
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

  // ================= CLEANUP =================
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          {bannerToEdit ? 'Edit Offer Zone' : 'Add Offer Zone'}
        </h1>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* ================= 1. BARCODE SCANNER ================= */}
          <BarcodeInput
            ref={barcodeInputRef}
            onSearch={handleBarcodeSearch}
            isLoading={barcodeLoading}
            minBarcodeLength={6}
          />

          {/* ================= 2. SELECTED PRODUCTS ================= */}
          {selectedProducts.length > 0 && (
            <div style={{
              marginTop: '16px',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#1f2937',
              }}>
                ✓ Selected Products ({selectedProducts.length})
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}>
                {selectedProducts.map((product) => {
                  const itemCode = extractItemCode(product);
                  const itemName = product.name || product.title || itemCode || 'Item';
                  const itemPrice = product.fourthprice || product.salesprice || product.price || 0;
                  const itemBarcode = product.barcode || itemCode;

                  return (
                    <div
                      key={itemCode}
                      style={{
                        position: 'relative',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '2px solid #10b981',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ padding: '8px' }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {itemName}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {itemBarcode}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#059669',
                          fontWeight: '600',
                          marginBottom: '8px',
                        }}>
                          ₹ {Number(itemPrice || 0).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(itemCode)}
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

          {/* ================= 3. OFFER TITLE ================= */}
          <Input
            label="Offer Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter offer title"
          />

          {/* ================= 4. CAPTION ================= */}
          <Input
            label="Caption"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            placeholder="Enter caption"
          />

          {/* ================= 5. IMAGE UPLOAD ================= */}
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

          {/* ================= 6. SUBMIT BUTTON ================= */}
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
