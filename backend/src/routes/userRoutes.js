const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  updateMyBankDetails,
} =
  require("../controllers/userController");

const {
  authenticate,
  requireRole,
} =
  require("../middleware/auth");


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| ALL USER ROUTES
|--------------------------------------------------------------------------
*/

router.use(
  authenticate,
  requireRole("user")
);


/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  getMyProfile
);


router.patch(
  "/me",
  updateMyProfile
);


/*
|--------------------------------------------------------------------------
| BANK DETAILS
|--------------------------------------------------------------------------
*/

router.put(
  "/me/bank-details",
  updateMyBankDetails
);


module.exports = {
  userRouter:
    router,
};