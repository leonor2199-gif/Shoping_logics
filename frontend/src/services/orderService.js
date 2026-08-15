import api from "./api";


const orderService = {

  /*
   * --------------------------------------------------------
   * CREATE ORDER
   * --------------------------------------------------------
   *
   * One product = one unit.
   *
   * Do not send quantity from the frontend.
   */

  createOrder: async ({
    productId,
  }) => {

    if (
      !productId
    ) {
      throw new Error(
        "Product ID is missing."
      );
    }


    const response =
      await api.post(
        "/orders",
        {
          productId:
            String(productId),
        }
      );


    return response.data;
  },


  /*
   * --------------------------------------------------------
   * GET MY ORDERS
   * --------------------------------------------------------
   */

  getMyOrders: async (
    params = {}
  ) => {

    const response =
      await api.get(
        "/orders/my",
        {
          params,
        }
      );


    return response.data;
  },


  /*
   * --------------------------------------------------------
   * GET ORDER
   * --------------------------------------------------------
   */

  getOrder: async (
    id
  ) => {

    const response =
      await api.get(
        `/orders/${id}`
      );


    return response.data;
  },


  /*
   * --------------------------------------------------------
   * CONFIRM ORDER
   * --------------------------------------------------------
   */

  confirmOrder: async (
    id
  ) => {

    const response =
      await api.patch(
        `/orders/${id}/confirm`
      );


    return response.data;
  },


  /*
   * --------------------------------------------------------
   * CANCEL ORDER
   * --------------------------------------------------------
   */

  cancelOrder: async (
    id
  ) => {

    const response =
      await api.patch(
        `/orders/${id}/cancel`
      );


    return response.data;
  },

};


export default orderService;