
const API_BASE_URL =
  'https://pkb2backend.myimc.in/api';

const buildUrl = (path) =>
  `${API_BASE_URL}${path}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem(
    'access_token'
  );

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const parseResponse = async (response) => {
  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  const rawText =
    await response.text();

  let data = null;

  if (rawText) {
    if (
      contentType.includes(
        'application/json'
      )
    ) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    } else {
      data = rawText;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail ||
        data?.error ||
        response.statusText ||
        'Request failed'
    );

    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
    ok: response.ok,
  };
};

const request = async (
  path,
  {
    method = 'GET',
    data,
    headers = {},
    isFormData = false,
    includeAuthHeaders = true,
  } = {}
) => {
  const requestHeaders = {
    ...headers,
  };

  if (includeAuthHeaders) {
    Object.assign(
      requestHeaders,
      getAuthHeaders()
    );
  }

  if (
    data !== undefined &&
    !isFormData
  ) {
    requestHeaders['Content-Type'] =
      'application/json';
  }

  try {
    const response = await fetch(
      buildUrl(path),
      {
        method,
        headers: requestHeaders,
        body:
          data === undefined
            ? undefined
            : isFormData
              ? data
              : JSON.stringify(data),
      }
    );

    return await parseResponse(
      response
    );
  } catch (error) {
    console.error('API Error:', {
      status:
        error.response?.status,

      data:
        error.response?.data,

      message: error.message,
    });

    throw error;
  }
};

const apiClient = {
  get: (path, config = {}) =>
    request(path, {
      ...config,
      method: 'GET',
    }),

  post: (path, data, config = {}) =>
    request(path, {
      ...config,
      method: 'POST',
      data,
    }),

  delete: (path, config = {}) =>
    request(path, {
      ...config,
      method: 'DELETE',
    }),
};

// ================= AUTH =================
export const authAPI = {

  login: (id, password) => {

    return apiClient.post(
      '/login/web/',
      {
        id,
        password,
      },
      {
        includeAuthHeaders: false,
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

// ================= CATEGORIES =================
export const categoryAPI = {

  // GET ALL CATEGORY ITEMS
  getCategories: () =>
    apiClient.get(
      '/accservicemaster/'
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

  // GET ALL ORDERS
  getOrders: () =>
    apiClient.get('/orders/'),

  // ACCEPT ORDER
  acceptOrder: (orderId) =>
    apiClient.post(
      `/order/${orderId}/accept/`
    ),

  // COMPLETE ORDER
  completeOrder: (orderId) =>
    apiClient.post(
      `/order/${orderId}/complete/`
    ),
};

// ================= CUSTOMERS =================
export const customerAPI = {

  // GET ALL CUSTOMERS
  getCustomers: () =>
    apiClient.get('/acc_master/'),
};

// ================= BANNERS =================
export const bannerAPI = {

  // GET ALL BANNERS
  getBanners: () =>
    apiClient.get('/banners/'),

  // UPLOAD BANNER
  uploadBanner: (formData) =>

    apiClient.post(
      '/banners/upload/',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      }
    ),

  // DELETE BANNER
  deleteBanner: (id) =>
    apiClient.delete(
      `/banners/${id}/`
    ),
};

export default apiClient;