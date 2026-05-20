import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { bannerAPI, resolveMediaUrl } from '../Services/api';

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

  // ================= LOAD BANNERS =================
  useEffect(() => {

    fetchBanners();

  }, [refreshTrigger]);

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
            'repeat(auto-fill, minmax(260px, 1fr))',
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
                  height: '180px',
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
                  }}>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDeleteBanner(banner.id)
                      }
                      style={{ width: '100%' }}
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

    </div>
  );
}