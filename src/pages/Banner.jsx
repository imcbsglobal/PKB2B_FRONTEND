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
          <h1 className="page__title">Banners</h1>
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
              Banners
            </h1>

            <p className="page__sub">
              {banners.length} banner
              {banners.length !== 1 ? 's' : ''}
              found
            </p>

          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleAddBanner}
          >
            + Add Banner
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
            'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          padding: '20px 0',
        }}>

          {banners.map((banner) => {
            const displayTitle = getBannerTitle(banner) || 'Untitled Banner';
            const displaySubtitle = banner.subtitle || banner.description || banner.sub_text || '';

            return (
              <div
                key={banner.id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(12,12,12,0.04)',
                }}
              >

                {/* Image with title overlay */}
                <div style={{
                  width: '100%',
                  height: '160px',
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5',
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
                      color: '#777',
                    }}>
                      No Image
                    </div>

                  )}

                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '10px 12px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{displayTitle}</div>
                    {displaySubtitle ? (
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.9,
                      }}>{displaySubtitle}</div>
                    ) : null}
                  </div>

                </div>

                {/* Footer with actions */}
                <div style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>

                  <div style={{
                    fontSize: '13px',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '60%',
                  }}>{displayTitle}</div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginLeft: 'auto',
                  }}>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        handleEditBanner(banner)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDeleteBanner(banner.id)
                      }
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