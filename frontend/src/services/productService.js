import api from "./api";

const productService = {
  // =========================================================
  // USER
  // =========================================================

  getAvailableProducts: async (params = {}) => {
    const response = await api.get(
      "/products/available",
      {
        params,
      }
    );

    return response.data;
  },

  getNextProduct: async () => {
    const response = await api.get(
      "/products/next"
    );

    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(
      `/products/${id}`
    );

    return response.data;
  },


  // =========================================================
  // ADMIN
  // =========================================================

  getAdminProducts: async (params = {}) => {
    const response = await api.get(
      "/products",
      {
        params,
      }
    );

    return response.data;
  },


  createProduct: async (productData) => {
    const response = await api.post(
      "/products",
      productData
    );

    return response.data;
  },


  updateProduct: async (
    productId,
    productData
  ) => {
    const response = await api.patch(
      `/products/${productId}`,
      productData
    );

    return response.data;
  },


  updateProductStatus: async (
    productId,
    isActive
  ) => {
    const response = await api.patch(
      `/products/${productId}/status`,
      {
        isActive,
      }
    );

    return response.data;
  },


  deleteProduct: async (
    productId
  ) => {
    const response = await api.delete(
      `/products/${productId}`
    );

    return response.data;
  },
};

export default productService;