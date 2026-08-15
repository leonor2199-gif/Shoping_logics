const express = require("express");

const {
  createProduct,
  deleteProduct,
  getAvailableProducts,
  getNextProduct,
  getProduct,
  listProducts,
  updateProduct,
  updateProductStatus,
} = require("../controllers/productController");

const {
  authenticate,
  requireRole,
} = require("../middleware/auth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN / GENERAL PRODUCT LIST
|--------------------------------------------------------------------------
*/

router.get("/", listProducts);


/*
|--------------------------------------------------------------------------
| USER PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/available",
  authenticate,
  requireRole("user"),
  getAvailableProducts
);

router.get(
  "/next",
  authenticate,
  requireRole("user"),
  getNextProduct
);

router.get(
  "/:id",
  authenticate,
  requireRole("user"),
  getProduct
);


/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  createProduct
);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  updateProduct
);

router.patch(
  "/:id/status",
  authenticate,
  requireRole("admin"),
  updateProductStatus
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  deleteProduct
);


module.exports = {
  productRouter: router,
};