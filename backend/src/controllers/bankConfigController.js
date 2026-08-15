const BankConfig = require("../models/BankConfig");


/*
|--------------------------------------------------------------------------
| LIST ACTIVE BANKS
|--------------------------------------------------------------------------
| User-facing endpoint.
|--------------------------------------------------------------------------
*/

async function listActiveBanks(
  req,
  res
) {
  const banks =
    await BankConfig.find({
      isActive: true,
    })
      .sort({
        displayOrder: 1,
        createdAt: 1,
      })
      .lean();

  res.json({
    success: true,
    banks,
  });
}


/*
|--------------------------------------------------------------------------
| LIST ALL BANKS
|--------------------------------------------------------------------------
| Admin only.
|--------------------------------------------------------------------------
*/

async function listBanks(
  req,
  res
) {
  const banks =
    await BankConfig.find()
      .sort({
        displayOrder: 1,
        createdAt: 1,
      })
      .lean();

  res.json({
    success: true,
    banks,
  });
}


/*
|--------------------------------------------------------------------------
| CREATE BANK
|--------------------------------------------------------------------------
*/

async function createBank(
  req,
  res
) {
  const {
    bankName,
    accountNumber,
    holderName,
    ifscCode,
    branch,
    paymentInstructions,
    qrCodeImage,
    isActive,
    displayOrder,
  } = req.body;


  if (
    !bankName ||
    !String(bankName).trim()
  ) {
    const error =
      new Error(
        "Bank name is required."
      );

    error.statusCode = 400;

    throw error;
  }


  if (
    !accountNumber ||
    !String(accountNumber).trim()
  ) {
    const error =
      new Error(
        "Account number is required."
      );

    error.statusCode = 400;

    throw error;
  }


  if (
    !holderName ||
    !String(holderName).trim()
  ) {
    const error =
      new Error(
        "Account holder name is required."
      );

    error.statusCode = 400;

    throw error;
  }


  const bank =
    await BankConfig.create({
      bankName:
        String(bankName).trim(),

      accountNumber:
        String(accountNumber).trim(),

      holderName:
        String(holderName).trim(),

      ifscCode:
        ifscCode
          ? String(ifscCode)
              .trim()
              .toUpperCase()
          : "",

      branch:
        branch
          ? String(branch).trim()
          : "",

      paymentInstructions:
        paymentInstructions
          ? String(
              paymentInstructions
            ).trim()
          : "",

      qrCodeImage:
        qrCodeImage
          ? String(qrCodeImage).trim()
          : "",

      isActive:
        isActive !== false,

      displayOrder:
        Number.isFinite(
          Number(displayOrder)
        )
          ? Math.max(
              Number(displayOrder),
              0
            )
          : 0,
    });


  res.status(201).json({
    success: true,
    bank,
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE BANK
|--------------------------------------------------------------------------
*/

async function updateBank(
  req,
  res
) {
  const bank =
    await BankConfig.findById(
      req.params.id
    );


  if (!bank) {
    const error =
      new Error(
        "Bank configuration not found."
      );

    error.statusCode = 404;

    throw error;
  }


  const {
    bankName,
    accountNumber,
    holderName,
    ifscCode,
    branch,
    paymentInstructions,
    qrCodeImage,
    isActive,
    displayOrder,
  } = req.body;


  if (
    bankName !== undefined
  ) {
    bank.bankName =
      String(bankName).trim();
  }


  if (
    accountNumber !== undefined
  ) {
    bank.accountNumber =
      String(accountNumber).trim();
  }


  if (
    holderName !== undefined
  ) {
    bank.holderName =
      String(holderName).trim();
  }


  if (
    ifscCode !== undefined
  ) {
    bank.ifscCode =
      String(ifscCode)
        .trim()
        .toUpperCase();
  }


  if (
    branch !== undefined
  ) {
    bank.branch =
      String(branch).trim();
  }


  if (
    paymentInstructions !==
    undefined
  ) {
    bank.paymentInstructions =
      String(
        paymentInstructions
      ).trim();
  }


  if (
    qrCodeImage !== undefined
  ) {
    bank.qrCodeImage =
      String(
        qrCodeImage
      ).trim();
  }


  if (
    isActive !== undefined
  ) {
    bank.isActive =
      Boolean(isActive);
  }


  if (
    displayOrder !== undefined
  ) {
    bank.displayOrder =
      Math.max(
        Number(displayOrder) || 0,
        0
      );
  }


  await bank.save();


  res.json({
    success: true,
    bank,
  });
}


/*
|--------------------------------------------------------------------------
| DELETE BANK
|--------------------------------------------------------------------------
*/

async function deleteBank(
  req,
  res
) {
  const bank =
    await BankConfig.findByIdAndDelete(
      req.params.id
    );


  if (!bank) {
    const error =
      new Error(
        "Bank configuration not found."
      );

    error.statusCode = 404;

    throw error;
  }


  res.json({
    success: true,
    message:
      "Bank account deleted successfully.",
  });
}


module.exports = {
  listActiveBanks,
  listBanks,
  createBank,
  updateBank,
  deleteBank,
};