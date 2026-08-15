const express = require("express");

const {
  placeOrder,
  listMyOrders,
  getOrder,
  confirm,
  cancel,
} =
  require("../controllers/orderController");

const {
  authenticate,
  requireRole,
} =
  require("../middleware/auth");


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requireRole("user"),
  placeOrder
);


/*
|--------------------------------------------------------------------------
| USER ORDERS
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  authenticate,
  requireRole("user"),
  listMyOrders
);


/*
|--------------------------------------------------------------------------
| SINGLE ORDER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticate,
  requireRole("user", "admin"),
  getOrder
);


/*
|--------------------------------------------------------------------------
| CONFIRM
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/confirm",
  authenticate,
  requireRole("user", "admin"),
  confirm
);


/*
|--------------------------------------------------------------------------
| CANCEL
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/cancel",
  authenticate,
  requireRole("user", "admin"),
  cancel
);


module.exports = {
  orderRouter:
    router,
};