
const API_BASE_URL =
  import.meta.env.DEV
    ? '/api'
    : 'https://pkb2backend.myimc.in/api';

const BACKEND_URL = 'https://pkb2backend.myimc.in/api';

export const resolveMediaUrl = (value) => {
  if (!value) return '';

  if (typeof value !== 'string') {
    return value?.url || value?.image || '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.startsWith('/')) {
    return `https://pkb2backend.myimc.in${value}`;
  }

  return `${API_BASE_URL}${value.startsWith('media/') ? `/${value}` : value}`;
};

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
    signal,
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
        signal,
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

  searchItems: (query, signal) => {
    const term = String(query || '').trim();

    if (!term) {
      return Promise.resolve({ data: [] });
    }

    const encoded = encodeURIComponent(term);

    // Try common backend filters used in DRF/list endpoints.
    return apiClient.get(
      `/productbatchphoto/?search=${encoded}&barcode=${encoded}&code=${encoded}&limit=20`,
      { signal }
    );
  },

  updateProductStatus: (barcode, status) =>
    apiClient.post(
      '/product/status/',
      {
        barcode,
        status,
      }
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

  // INVOICED ORDER
  invoicedOrder: (orderId) =>
    apiClient.post(
      `/order/${orderId}/invoiced/`
    ),

  // DISPATCHED ORDER
  dispatchedOrder: (orderId) =>
    apiClient.post(
      `/order/${orderId}/dispatched/`
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

  // UPLOAD BANNER (Create)
  uploadBanner: (formData) =>
    request('/banners/upload/', {
      method: 'POST',
      data: formData,
      isFormData: true,
    }),

  // EDIT BANNER (Update)
  editBanner: (id, formData) =>
    request(`/banners/${id}/edit/`, {
      method: 'PUT',
      data: formData,
      isFormData: true,
    }),

  // DELETE BANNER
  deleteBanner: (id) =>
    apiClient.delete(
      `/banners/${id}/`
    ),
};

export default apiClient;