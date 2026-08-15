import api from "./api";

const bankConfigService = {
  /*
  |--------------------------------------------------------------------------
  | USER
  |--------------------------------------------------------------------------
  */

  getActiveBanks: async () => {
    const response = await api.get(
      "/config/banks"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  getAllBanks: async () => {
    const response = await api.get(
      "/config/banks/admin/all"
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  createBank: async (data) => {
    const response = await api.post(
      "/config/banks",
      data
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  updateBank: async (
    bankId,
    data
  ) => {
    const response = await api.patch(
      `/config/banks/${bankId}`,
      data
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  deleteBank: async (
    bankId
  ) => {
    const response = await api.delete(
      `/config/banks/${bankId}`
    );

    return response.data;
  },
};

export default bankConfigService;