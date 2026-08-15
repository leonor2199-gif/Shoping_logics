const User = require("../models/User");
const bcrypt = require("bcrypt");


/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
*/

async function getMyProfile(req, res) {
  if (!req.auth?.account?.id) {
    const error =
      new Error("User authentication is required.");

    error.statusCode = 401;

    throw error;
  }

  const user =
    await User.findById(
      req.auth.account.id
    );

  if (!user) {
    const error =
      new Error("User account not found.");

    error.statusCode = 404;

    throw error;
  }

  res.json({
    success: true,
    user,
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE MY PROFILE
|--------------------------------------------------------------------------
*/

async function updateMyProfile(
  req,
  res
) {
  if (!req.auth?.account?.id) {
    const error =
      new Error("User authentication is required.");

    error.statusCode = 401;

    throw error;
  }


  const allowedFields = [
    "email",
    "profileImage",
  ];


  const updates =
    Object.fromEntries(
      allowedFields
        .filter(
          (field) =>
            req.body?.[field] !==
            undefined
        )
        .map(
          (field) => [
            field,
            req.body[field],
          ]
        )
    );


  if (
    Object.keys(updates).length ===
    0
  ) {
    const error =
      new Error(
        "Provide at least one editable profile field."
      );

    error.statusCode = 400;

    throw error;
  }


  const user =
    await User.findByIdAndUpdate(
      req.auth.account.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );


  if (!user) {
    const error =
      new Error(
        "User account not found."
      );

    error.statusCode = 404;

    throw error;
  }


  res.json({
    success: true,
    user,
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE BANK DETAILS
|--------------------------------------------------------------------------
|
| User must provide their withdrawal
| password before changing bank details.
|
|--------------------------------------------------------------------------
*/

async function updateMyBankDetails(
  req,
  res
) {
  /*
   * --------------------------------------------------------
   * AUTH CHECK
   * --------------------------------------------------------
   */

  const userId =
    req.auth?.account?.id;


  if (!userId) {
    const error =
      new Error(
        "User authentication is required."
      );

    error.statusCode = 401;

    throw error;
  }


  /*
   * --------------------------------------------------------
   * READ INPUT
   * --------------------------------------------------------
   */

  const {
    bankName,
    accountNumber,
    holderName,
    ifscCode,
    withdrawalPassword,
  } =
    req.body || {};


  /*
   * --------------------------------------------------------
   * VALIDATION
   * --------------------------------------------------------
   */

  const cleanBankName =
    String(
      bankName || ""
    ).trim();


  const cleanAccountNumber =
    String(
      accountNumber || ""
    ).trim();


  const cleanHolderName =
    String(
      holderName || ""
    ).trim();


  const cleanIfscCode =
    String(
      ifscCode || ""
    ).trim();


  const cleanWithdrawalPassword =
    String(
      withdrawalPassword || ""
    );


  if (
    !cleanBankName ||
    !cleanAccountNumber ||
    !cleanHolderName ||
    !cleanWithdrawalPassword
  ) {
    const error =
      new Error(
        "Bank name, account number, holder name, and withdrawal password are required."
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * --------------------------------------------------------
   * GET USER
   * --------------------------------------------------------
   *
   * Explicitly select withdrawalPassword
   * because it may have select:false
   * in the User model.
   */

  const user =
    await User.findById(
      userId
    ).select(
      "+withdrawalPassword"
    );


  if (!user) {
    const error =
      new Error(
        "User account not found."
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * --------------------------------------------------------
   * WITHDRAWAL PASSWORD CHECK
   * --------------------------------------------------------
   */

  if (
    !user.withdrawalPassword
  ) {
    const error =
      new Error(
        "Withdrawal password has not been configured."
      );

    error.statusCode = 400;

    throw error;
  }


  let passwordMatches =
    false;


  try {

    passwordMatches =
      await bcrypt.compare(
        cleanWithdrawalPassword,
        user.withdrawalPassword
      );

  } catch (passwordError) {

    console.error(
      "Withdrawal password comparison failed:",
      passwordError
    );

    const error =
      new Error(
        "Unable to verify withdrawal password."
      );

    error.statusCode = 500;

    throw error;
  }


  if (
    !passwordMatches
  ) {
    const error =
      new Error(
        "Withdrawal password is incorrect."
      );

    error.statusCode = 401;

    throw error;
  }


  /*
   * --------------------------------------------------------
   * UPDATE BANK DETAILS
   * --------------------------------------------------------
   */

  user.bankDetails = {
    bankName:
      cleanBankName,

    accountNumber:
      cleanAccountNumber,

    holderName:
      cleanHolderName,

    ifscCode:
      cleanIfscCode,
  };


  await user.save();


  /*
   * --------------------------------------------------------
   * RETURN USER
   * --------------------------------------------------------
   */

  res.json({
    success: true,
    message:
      "Bank details updated successfully.",
    user,
  });
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyBankDetails,
};