const express = require("express");

const {
  createBank,
  deleteBank,
  listActiveBanks,
  listBanks,
  updateBank,
} = require(
  "../controllers/bankConfigController"
);

const {
  authenticate,
  requireRole,
} = require(
  "../middleware/auth"
);


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| USER
|--------------------------------------------------------------------------
|
| GET /api/bank-config
|
| Returns ONLY active accounts.
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticate,
  listActiveBanks
);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
|
| GET /api/bank-config/admin/all
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  authenticate,
  requireRole("admin"),
  listBanks
);


/*
|--------------------------------------------------------------------------
| ADMIN CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  createBank
);


/*
|--------------------------------------------------------------------------
| ADMIN UPDATE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  updateBank
);


/*
|--------------------------------------------------------------------------
| ADMIN DELETE
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  deleteBank
);


module.exports = {
  bankConfigRouter:
    router,
};