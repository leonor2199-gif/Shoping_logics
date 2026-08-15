const express = require("express");

const {
  getDashboardStats,
  listUsers,
  getUserDetails,
  updateUserStatus,
  updateUserVip,
  updateUserSecurity,
  addUserBonus,
  deleteUser,
} = require("../controllers/adminController");

const {
  listOrders,
  deleteOrder,
} = require("../controllers/orderController");

const {
  authenticate,
  requireRole,
} = require("../middleware/auth");


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(
  authenticate,
  requireRole("admin")
);


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard/stats",
  getDashboardStats
);


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  listUsers
);


/*
|--------------------------------------------------------------------------
| SINGLE USER
|--------------------------------------------------------------------------
*/

router.get(
  "/users/:id",
  getUserDetails
);


/*
|--------------------------------------------------------------------------
| USER STATUS
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/:id/status",
  updateUserStatus
);


/*
|--------------------------------------------------------------------------
| USER VIP
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/:id/vip",
  updateUserVip
);


/*
|--------------------------------------------------------------------------
| USER SECURITY
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/:id/security",
  updateUserSecurity
);


/*
|--------------------------------------------------------------------------
| ADD USER BONUS
|--------------------------------------------------------------------------
*/

router.post(
  "/users/:id/bonus",
  addUserBonus
);


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

router.delete(
  "/users/:id",
  deleteUser
);


/*
|--------------------------------------------------------------------------
| ADMIN ORDERS
|--------------------------------------------------------------------------
|
| GET /api/admin/orders
|
| Search:
|
| /api/admin/orders?search=527791138209
|
|--------------------------------------------------------------------------
*/

router.get(
  "/orders",
  listOrders
);

router.delete(
  "/orders/:id",
  deleteOrder
);


module.exports = {
  adminRouter:
    router,
};