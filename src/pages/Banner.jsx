import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { bannerAPI } from '../Services/api';

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

          {banners.map((banner) => (

            <div
              key={banner.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >

              {/* Image */}
              <div style={{
                width: '100%',
                height: '140px',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}>

                {banner.image ? (

                  <img
                    src={banner.image}
                    alt={banner.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                ) : (

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}>
                    No Image
                  </div>

                )}

              </div>

              {/* Content */}
              <div style={{
                padding: '16px',
              }}>

                <h3 style={{
                  marginBottom: '8px',
                }}>
                  {banner.title}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px',
                }}>
                  {banner.subtitle}
                </p>

                <div style={{
                  display: 'flex',
                  gap: '8px',
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

          ))}

        </div>

      )}

    </div>
  );
}