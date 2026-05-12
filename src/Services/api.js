import axios from 'axios';

const API_BASE_URL =
  'https://pkb2backend.myimc.in/api';

// ================= AXIOS CLIENT =================
const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type':
      'application/json',
  },
});

// ================= REQUEST INTERCEPTOR =================
apiClient.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem(
        'access_token'
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
apiClient.interceptors.response.use(

  (response) => response,

  (error) => {

    console.error(
      'API Error:',
      {
        status:
          error.response?.status,

        data:
          error.response?.data,

        message:
          error.message,
      }
    );

    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const authAPI = {

  login: (id, password) => {

    return apiClient.post(
      '/login/web/',
      {
        id,
        password,
      }
    );
  },

  logout: () => {

    localStorage.removeItem(
      'access_token'
    );

    localStorage.removeItem(
      'refresh_token'
    );

    localStorage.removeItem(
      'user_role'
    );

    localStorage.removeItem(
      'user_id'
    );
  },
};

// ================= PRODUCTS =================
export const productAPI = {

  getAllProducts: () =>
    apiClient.get(
      '/product-product/'
    ),

  toggleProductFavorite:
    (productName) =>

      apiClient.post(
        '/product-product/toggle-favorite/',
        {
          product:
            productName,
        }
      ),
};

// ================= PRODUCT BATCH PHOTO =================
export const productBatchAPI = {

  getAllItems: () =>
    apiClient.get(
      '/productbatchphoto/'
    ),
};

// ================= BRANDS =================
export const brandAPI = {

  getAllBrands: () =>
    apiClient.get(
      '/product-brands/'
    ),

  toggleBrandFavorite:
    (brandName) =>

      apiClient.post(
        '/product-brands/toggle-favorite/',
        {
          brand:
            brandName,
        }
      ),
};

// ================= ORDERS =================
export const orderAPI = {

  getOrders: () =>
    apiClient.get('/orders/'),

  createOrder: (orderData) =>
    apiClient.post(
      '/order/create/',
      orderData
    ),

  acceptOrder:
    (orderId) =>

      apiClient.post(
        `/order/${orderId}/accept/`
      ),

  completeOrder:
    (orderId) =>

      apiClient.post(
        `/order/${orderId}/complete/`
      ),
};

// ================= BANNERS =================
export const bannerAPI = {

  getBanners: () =>
    apiClient.get('/banners/'),

  uploadBanner:
    (formData) =>

      apiClient.post(
        '/banners/upload/',
        formData
      ),

  deleteBanner: (id) =>
    apiClient.delete(
      `/banners/${id}/`
    ),
};

export default apiClient;