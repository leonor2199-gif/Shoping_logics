import api from "./api";

const userService = {
  getProfile: async () => {
    const response = await api.get("/users/me");

    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch(
      "/users/me",
      data
    );

    return response.data;
  },

  updateBankDetails: async (bankDetails) => {
    const response = await api.put(
      "/users/me/bank-details",
      bankDetails
    );

    return response.data;
  },
};

export default userService;