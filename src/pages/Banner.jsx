import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { bannerAPI, resolveMediaUrl, productBatchAPI, productAPI } from '../Services/api';

  const getBannerImageSrc = (banner) =>
    resolveMediaUrl(
      banner?.image ||
      banner?.image_url ||
      banner?.banner_image ||
      banner?.banner_image_url
    );

  const getBannerTitle = (banner) => {
    if (!banner) return '';

    const candidates = [
      banner.title,
      banner.name,
      banner.title_text,
      banner.banner_title,
      banner.bannerTitle,
      banner.heading,
      banner.label,
      banner.meta?.title,
      banner.data?.title,
    ];

    for (const c of candidates) {
      if (c && String(c).trim()) return String(c).trim();
    }

    // fallback: pick the first key that contains 'title' or 'name'
    for (const key of Object.keys(banner)) {
      try {
        if (/title|name/i.test(key)) {
          const val = banner[key];
          if (val && String(val).trim()) return String(val).trim();
        }
      } catch (e) {
        // ignore
      }
    }

    return '';
  };

export default function Banner({ onNavigate, refreshTrigger }) {

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBanner, setViewingBanner] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [itemsMap, setItemsMap] = useState({});

  // ================= LOAD BANNERS =================
  useEffect(() => {

    fetchBanners();

  }, [refreshTrigger]);

  // ================= FETCH ITEMS FOR MODAL =================
  useEffect(() => {
    if (viewingBanner) {
      fetchItemsForModal();
    }
  }, [viewingBanner]);

  const fetchItemsForModal = async () => {
    try {
      let items = [];
      
      // Try productBatchPhoto first
      console.log('Fetching from /productbatchphoto/...');
      try {
        const batchResponse = await productBatchAPI.getAllItems();
        items = batchResponse?.data || [];
        console.log('Batch API returned', items.length, 'items');
      } catch (err) {
        console.warn('Batch API failed, trying product API...');
      }
      
      // If no items or no images, try product API
      if (items.length === 0 || (items.length > 0 && !items[0]?.image && !items[0]?.url2)) {
        console.log('Trying /product-product/ API for items with images...');
        try {
          const prodResponse = await productAPI.getAllProducts();
          items = prodResponse?.data || [];
          console.log('Product API returned', items.length, 'items');
        } catch (err) {
          console.error('Product API also failed:', err);
        }
      }
      
      console.log('========== FETCHED ITEMS FROM API ==========');
      console.log('Total items fetched:', items.length);
      
      if (items.length > 0) {
        console.log('\nFIRST ITEM - All available data:');
        console.log(JSON.stringify(items[0], null, 2));
        
        console.log('\nFIRST ITEM - All Keys:');
        const firstItemKeys = Object.keys(items[0]);
        console.log(firstItemKeys);
        
        console.log('\nCHECKING IMAGE FIELDS:');
        const possibleImageFields = ['url2', 'image', 'url', 'image_url', 'photo', 'image_path', 'thumbnail', 'pic', 'productimage', 'product_image', 'productPhoto', 'productphoto'];
        const foundImageFields = [];
        possibleImageFields.forEach(field => {
          if (items[0]?.[field]) {
            console.log(`✅ FOUND: ${field} = ${items[0]?.[field]}`);
            foundImageFields.push(field);
          }
        });
        if (foundImageFields.length === 0) {
          console.log('⚠️ No image fields found!');
        }
      }
      console.log('==========================================\n');
      
      setAllItems(Array.isArray(items) ? items : []);
      
      // Create a map for quick lookup by code, id, and other fields
      const map = {};
      items.forEach(item => {
        // Try different fields for key
        const code = item.code || item.id;
        const barcode = item.barcode;
        const itemCode = item.item_code;
        
        if (code) {
          map[code] = item;
          map[String(code)] = item;
        }
        if (barcode) {
          map[barcode] = item;
          map[String(barcode)] = item;
        }
        if (itemCode) {
          map[itemCode] = item;
          map[String(itemCode)] = item;
        }
      });
      console.log('ItemsMap created with', Object.keys(map).length, 'entries');
      setItemsMap(map);
    } catch (err) {
      console.error('Error fetching items for modal:', err);
    }
  };

  // ================= LOG VIEWING BANNER =================
  useEffect(() => {
    if (viewingBanner) {
      console.log('\n========== VIEWING BANNER DATA ==========');
      console.log('Banner ID:', viewingBanner.id);
      console.log('Banner Title:', viewingBanner.title || viewingBanner.name);
      console.log('Items in banner (raw):', viewingBanner.items);
      console.log('Items type:', typeof viewingBanner.items);
      console.log('Is array?', Array.isArray(viewingBanner.items));
      if (Array.isArray(viewingBanner.items) && viewingBanner.items.length > 0) {
        console.log('First item:', viewingBanner.items[0]);
        console.log('First item type:', typeof viewingBanner.items[0]);
      }
      console.log('==========================================\n');
    }
  }, [viewingBanner]);

  const fetchBanners = async () => {

    try {

      setLoading(true);

      const response = await bannerAPI.getBanners();

      console.log('Banners:', response.data);

      setBanners(response.data || []);

    } catch (error) {

      console.error('Banner API Error:', error);

    } finally {

      setLoading(false);

    }
  };

  // ================= DELETE BANNER =================
  const handleDeleteBanner = async (id) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this banner?'
    );

    if (!confirmDelete) return;

    try {

      await bannerAPI.deleteBanner(id);   

      fetchBanners();

    } catch (error) {

      console.error('Delete Banner Error:', error);

    }
  };

  // ================= EDIT =================
  const handleEditBanner = (banner) => {

    onNavigate?.('banneradd', banner);
  };

  // ================= ADD =================
  const handleAddBanner = () => {

    onNavigate?.('banneradd');
  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="page">

        <div className="page__header">
          <h1 className="page__title">Offer Zone</h1>
        </div>

        <div style={{
          padding: '20px',
          textAlign: 'center',
        }}>
          Loading banners...
        </div>

      </div>
    );
  }

  return (

    <div className="page">

      {/* Header */}
      <div className="page__header">

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>

          <div>

            <h1 className="page__title">
              Offer Zone
            </h1>

            <p className="page__sub">
              {banners.length} offer zone
              {banners.length !== 1 ? 's' : ''}
              found
            </p>

          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleAddBanner}
          >
            + Add Offer Zone
          </Button>

        </div>

      </div>

      {/* Empty */}
      {banners.length === 0 ? (

        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999',
        }}>

          <p style={{
            fontSize: '16px',
            marginBottom: '16px',
          }}>
            No banners yet
          </p>

          <Button
            variant="primary"
            onClick={handleAddBanner}
          >
            Create Your First Banner
          </Button>

        </div>

      ) : (

        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          padding: '20px 0',
        }}>

          {banners.map((banner) => {
            const displayTitle = getBannerTitle(banner) || 'Untitled Banner';
            const displaySubtitle = banner.body || banner.subtitle || banner.description || banner.sub_text || '';

            return (
              <div
                key={banner.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >

                {/* Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  position: 'relative',
                }}>

                  {getBannerImageSrc(banner) ? (

                    <img
                      src={getBannerImageSrc(banner)}
                      alt={displayTitle}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                  ) : (

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#9ca3af',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      No Image
                    </div>

                  )}

                </div>

                {/* Content and Actions */}
                <div style={{
                  padding: '14px 16px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>

                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '6px',
                    }}>{displayTitle}</div>
                    {displaySubtitle && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{displaySubtitle}</div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    alignItems: 'center',
                  }}>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setViewingBanner(banner)
                      }
                      title="View Items"
                      style={{
                        padding: '8px 14px',
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleEditBanner(banner)
                      }
                      style={{ flex: 1 }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDeleteBanner(banner.id)
                      }
                      style={{ flex: 1 }}
                    >
                      Delete
                    </Button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

      {/* Items Modal */}
      {viewingBanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                }}>
                  {getBannerTitle(viewingBanner)}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                }}>
                  Items in this offer
                </p>
              </div>
              <button
                onClick={() => setViewingBanner(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                }}
              >
                ✕
              </button>
            </div>

            {/* Items List */}
            {(() => {
              let itemsArray = [];
              
              // Handle different item formats
              if (viewingBanner.items) {
                if (typeof viewingBanner.items === 'string') {
                  // If items is a comma-separated string
                  itemsArray = viewingBanner.items.split(',').map(s => s.trim());
                } else if (Array.isArray(viewingBanner.items)) {
                  itemsArray = viewingBanner.items;
                }
              }

              if (itemsArray.length > 0) {
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '16px',
                  }}>
                    {itemsArray.map((item, idx) => {
                      // Extract item code from various formats
                      let itemCode = 'N/A';
                      let itemName = 'Item';
                      let itemImage = '';
                      let itemPrice = 'N/A';
                      let itemDetails = null;
                      
                      if (typeof item === 'string') {
                        itemCode = item.trim();
                        // Look up item details from itemsMap first
                        itemDetails = itemsMap[itemCode] || itemsMap[String(itemCode)];
                        
                        // If not found in map, search through allItems array
                        if (!itemDetails && allItems.length > 0) {
                          itemDetails = allItems.find(i => 
                            String(i.code) === String(itemCode) ||
                            String(i.id) === String(itemCode) ||
                            String(i.barcode) === String(itemCode) ||
                            String(i.item_code) === String(itemCode)
                          );
                        }
                        
                        if (itemDetails) {
                          itemName = itemDetails.name || itemDetails.title || itemCode;
                          // Try all possible image fields from full item details
                          itemImage = itemDetails.url2 || 
                                     itemDetails.image || 
                                     itemDetails.url || 
                                     itemDetails.image_url ||
                                     itemDetails.photo ||
                                     itemDetails.image_path ||
                                     '';
                          itemPrice = itemDetails.fourthprice || itemDetails.salesprice || itemDetails.price || 'N/A';
                          console.log(`📦 Item ${itemCode} (from string):`);
                          console.log(`   Found: YES`);
                          console.log(`   Name: ${itemName}`);
                          console.log(`   Price: ${itemPrice}`);
                          console.log(`   Image: ${itemImage}`);
                        } else {
                          console.log(`❌ Item ${itemCode} (from string): NOT FOUND`);
                        }
                      } else if (typeof item === 'object' && item !== null) {
                        // Handle object format like { item_code: "4860", item_name: "...", fourthprice: 690 }
                        itemCode = item.item_code || item.code || item.id || JSON.stringify(item);
                        itemName = item.name || item.item_name || itemCode;
                        
                        // For objects, try to get image from the object first
                        itemImage = item.url2 || item.image || item.url || item.image_url || item.photo || '';
                        itemPrice = item.fourthprice || item.salesprice || item.price || 'N/A';
                        
                        // If no image in object, look up full item details by code
                        if (!itemImage && itemCode) {
                          itemDetails = itemsMap[itemCode] || itemsMap[String(itemCode)];
                          
                          if (!itemDetails && allItems.length > 0) {
                            itemDetails = allItems.find(i => 
                              String(i.code) === String(itemCode) ||
                              String(i.id) === String(itemCode) ||
                              String(i.barcode) === String(itemCode) ||
                              String(i.item_code) === String(itemCode)
                            );
                          }
                          
                          if (itemDetails) {
                            itemImage = itemDetails.url2 || itemDetails.image || itemDetails.url || itemDetails.image_url || itemDetails.photo || '';
                            console.log(`Found full details for ${itemCode}, image: ${itemImage}`);
                          }
                        }
                        
                        console.log(`📦 Item ${itemCode} (from object):`);
                        console.log(`   Name: ${itemName}`);
                        console.log(`   Price: ${itemPrice}`);
                        console.log(`   Image: ${itemImage}`);
                      }
                      
                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {console.log(`Rendering card for ${itemCode}: itemImage="${itemImage}", hasImage=${!!itemImage}`) || null}
                          {/* Image */}
                          <div style={{
                            width: '100%',
                            height: '120px',
                            backgroundColor: '#e5e7eb',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            color: '#9ca3af',
                            fontSize: '40px',
                            flexShrink: 0,
                          }}>
                            {itemImage ? (
                              <img
                                key={`${itemCode}-resolved`}
                                src={itemImage}
                                alt={itemName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  padding: '8px',
                                  display: 'block',
                                }}
                                onLoad={(e) => {
                                  console.log('✅ Image loaded successfully:', itemCode);
                                  console.log('   URL:', itemImage);
                                }}
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', itemCode);
                                  console.error('   URL:', itemImage);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerHTML = '<div style="font-size: 40px; color: #d1d5db;">🛍️</div>';
                                }}
                              />
                            ) : (
                              <div style={{
                                fontSize: '40px',
                              }}>
                                🛍️
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div style={{
                            padding: '12px',
                            textAlign: 'center',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '0',
                          }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#1f2937',
                              wordBreak: 'break-word',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.3',
                            }}>
                              {itemName}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#6b7280',
                              fontWeight: '500',
                              marginBottom: '6px',
                            }}>
                              {String(itemCode).substring(0, 15)}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#059669',
                            }}>
                              ₹ {itemPrice}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#9ca3af',
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '12px',
                    }}>
                      📭
                    </div>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      No items added to this offer
                    </p>
                  </div>
                  );
              }
            })()}

            {/* Footer */}
            <div style={{
              marginTop: '20px',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'right',
            }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingBanner(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}