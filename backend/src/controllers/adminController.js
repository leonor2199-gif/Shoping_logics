const mongoose = require("mongoose");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const {
  validatePassword,
} = require("../utils/password");
const {
  createIdentifier,
} = require("../utils/identifiers");

function getPagination(
  query
) {
  const page =
    Math.max(
      Number.parseInt(
        query.page,
        10
      ) || 1,
      1
    );

  const limit =
    Math.min(
      Math.max(
        Number.parseInt(
          query.limit,
          10
        ) || 20,
        1
      ),
      100
    );


  return {
    page,
    limit,
    skip:
      (page - 1) *
      limit,
  };
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

async function getDashboardStats(
  req,
  res
) {
  const [
    users,
    activeUsers,
    orders,
    pendingOrders,
    deposits,
    withdrawals,
  ] = await Promise.all([

    User.countDocuments(),

    User.countDocuments({
      status: "active",
    }),

    Order.countDocuments(),

    Order.countDocuments({
      status: "pending",
    }),

    Transaction.aggregate([
      {
        $match: {
          type: "deposit",
          status: "completed",
        },
      },

      {
        $group: {
          _id: null,

          amount: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          type: "withdrawal",
          status: "completed",
        },
      },

      {
        $group: {
          _id: null,

          amount: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);


  res.json({
    success: true,

    stats: {
      users:
        Number(users || 0),

      activeUsers:
        Number(activeUsers || 0),

      orders:
        Number(orders || 0),

      pendingOrders:
        Number(pendingOrders || 0),

      completedDeposits:
        Number(
          deposits[0]?.amount || 0
        ),

      completedWithdrawals:
        Number(
          withdrawals[0]?.amount || 0
        ),
    },
  });
}


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

async function listUsers(
  req,
  res
) {
  const {
    page,
    limit,
    skip,
  } = getPagination(
    req.query
  );


  const filter = {};


  if (req.query.status) {
    filter.status =
      req.query.status;
  }


  if (req.query.search) {
    const escapedSearch =
      req.query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


    const regex =
      new RegExp(
        escapedSearch,
        "i"
      );


    filter.$or = [
      {
        phone: regex,
      },
      {
        email: regex,
      },
    ];
  }


  const [
    users,
    total,
  ] = await Promise.all([

    User.find(filter)
      .select(
        "-loginPassword -withdrawalPassword"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    User.countDocuments(
      filter
    ),
  ]);


  res.json({
    success: true,

    users,

    pagination: {
      page,
      limit,
      total,

      pages:
        Math.ceil(
          total / limit
        ),
    },
  });
}


/*
|--------------------------------------------------------------------------
| USER STATUS
|--------------------------------------------------------------------------
*/

async function updateUserStatus(
  req,
  res
) {
  if (
    ![
      "active",
      "frozen",
    ].includes(
      req.body.status
    )
  ) {
    const error =
      new Error(
        "Status must be active or frozen."
      );

    error.statusCode = 400;

    throw error;
  }


  const user =
    await User.findByIdAndUpdate(
      req.params.id,

      {
        status:
          req.body.status,
      },

      {
        new: true,
      }
    );


  if (!user) {
    const error =
      new Error(
        "User not found."
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
| VIP
|--------------------------------------------------------------------------
*/

async function updateUserVip(
  req,
  res
) {
  const vipLevel =
    Number(
      req.body.vipLevel
    );


  if (
    !Number.isInteger(
      vipLevel
    ) ||
    vipLevel < 1
  ) {
    const error =
      new Error(
        "VIP level must be a positive integer."
      );

    error.statusCode = 400;

    throw error;
  }


  const user =
    await User.findByIdAndUpdate(
      req.params.id,

      {
        vipLevel,
      },

      {
        new: true,
      }
    );


  if (!user) {
    const error =
      new Error(
        "User not found."
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
| SECURITY
|--------------------------------------------------------------------------
*/

async function updateUserSecurity(
  req,
  res
) {
  const {
    loginPassword,
    withdrawalPassword,
  } = req.body;


  if (
    !loginPassword &&
    !withdrawalPassword
  ) {
    const error =
      new Error(
        "Provide a login password or withdrawal password to update."
      );

    error.statusCode = 400;

    throw error;
  }


  if (loginPassword) {
    const validationError =
      validatePassword(
        loginPassword,
        "Login password"
      );


    if (validationError) {
      const error =
        new Error(
          validationError
        );

      error.statusCode = 400;

      throw error;
    }
  }


  if (withdrawalPassword) {
    const validationError =
      validatePassword(
        withdrawalPassword,
        "Withdrawal password"
      );


    if (validationError) {
      const error =
        new Error(
          validationError
        );

      error.statusCode = 400;

      throw error;
    }
  }


  const user =
    await User.findById(
      req.params.id
    );


  if (!user) {
    const error =
      new Error(
        "User not found."
      );

    error.statusCode = 404;

    throw error;
  }


  if (loginPassword) {
    user.loginPassword =
      loginPassword;
  }


  if (withdrawalPassword) {
    user.withdrawalPassword =
      withdrawalPassword;
  }


  await user.save();


  res.json({
    success: true,
    user,
  });
}

async function getUserDetails(
  req,
  res
) {
  const user =
    await User.findById(
      req.params.id
    )
      .select(
        "-loginPassword -withdrawalPassword"
      );


  if (!user) {
    const error =
      new Error(
        "User not found."
      );

    error.statusCode = 404;

    throw error;
  }


  res.json({
    success: true,

    user,
  });
}

async function addUserBonus(req, res) {
  const {
    amount,
    remarks,
  } = req.body;


  /*
   * Amount comes from frontend in normal currency.
   *
   * Example:
   *
   * 100.00
   *
   * becomes:
   *
   * 10000
   *
   * because your database stores minor currency units.
   */
  const numericAmount =
    Number(amount);


  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {
    const error =
      new Error(
        "Bonus amount must be greater than 0."
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Convert to minor currency.
   */
  const bonusAmount =
    Math.round(
      numericAmount * 100
    );


  if (
    !Number.isSafeInteger(
      bonusAmount
    ) ||
    bonusAmount <= 0
  ) {
    const error =
      new Error(
        "Invalid bonus amount."
      );

    error.statusCode = 400;

    throw error;
  }


  if (
    bonusAmount >
    1_000_000_000
  ) {
    const error =
      new Error(
        "Bonus amount is too large."
      );

    error.statusCode = 400;

    throw error;
  }


  if (
    remarks &&
    String(remarks).length > 1000
  ) {
    const error =
      new Error(
        "Remarks cannot exceed 1000 characters."
      );

    error.statusCode = 400;

    throw error;
  }


  const session =
    await mongoose.startSession();


  try {
    let result;


    await session.withTransaction(
      async () => {

        /*
         * Lock/update the user atomically.
         */
        const user =
          await User.findById(
            req.params.id
          ).session(session);


        if (!user) {
          const error =
            new Error(
              "User not found."
            );

          error.statusCode = 404;

          throw error;
        }


        const balanceBefore =
          Number(
            user.balance || 0
          );


        const balanceAfter =
          balanceBefore +
          bonusAmount;


        if (
          !Number.isSafeInteger(
            balanceAfter
          )
        ) {
          const error =
            new Error(
              "Resulting balance is too large."
            );

          error.statusCode = 400;

          throw error;
        }


        /*
         * Add bonus to balance.
         */
        user.balance =
          balanceAfter;


        /*
         * Do NOT add this to
         * totalDeposited.
         *
         * This is an admin bonus,
         * not a customer deposit.
         */
        await user.save({
          session,
        });


        /*
         * Create audit transaction.
         */
        const transactions =
          await Transaction.create(
            [
              {
                transactionId:
                  createIdentifier(
                    "TXN"
                  ),

                user:
                  user._id,

                type:
                  "adjustment",

                direction:
                  "credit",

                amount:
                  bonusAmount,

                status:
                  "completed",

                balanceBefore,

                balanceAfter,

                description:
                  "Admin bonus",

                remarks:
                  remarks
                    ? String(
                        remarks
                      ).trim()
                    : "Bonus added by administrator.",

                createdBy:
                  req.auth.account.id,
              },
            ],
            {
              session,
            }
          );


        result = {
          user,
          transaction:
            transactions[0],
        };
      }
    );


    res.json({
      success: true,

      message:
        "Bonus added successfully.",

      balance:
        result.user.balance,

      user:
        result.user,

      transaction:
        result.transaction,
    });

  } finally {
    await session.endSession();
  }
}


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
|
| Permanently deletes a user and their related orders/transactions.
|
| Safety:
| - Rejects invalid user IDs.
| - Refuses deletion while there is a pending withdrawal/deposit.
| - Refuses deletion while there is a pending order.
| - Deletes related orders and transactions in the same MongoDB
|   transaction as the user deletion.
|
| This is intentionally a HARD DELETE. Use only from the admin route.
|--------------------------------------------------------------------------
*/

async function deleteUser(
  req,
  res
) {
  const userId =
    req.params.id;


  if (
    !mongoose.isValidObjectId(
      userId
    )
  ) {
    const error =
      new Error(
        "Invalid user ID."
      );

    error.statusCode = 400;

    throw error;
  }


  const session =
    await mongoose.startSession();


  try {
    let deletedResult;


    await session.withTransaction(
      async () => {

        const user =
          await User.findById(
            userId
          ).session(
            session
          );


        if (!user) {
          const error =
            new Error(
              "User not found."
            );

          error.statusCode = 404;

          throw error;
        }


        /*
         * Never remove a user while money is
         * still waiting for an admin decision.
         */
        const pendingTransactions =
          await Transaction.countDocuments({
            user: userId,
            status: "pending",
            type: {
              $in: [
                "deposit",
                "withdrawal",
              ],
            },
          }).session(
            session
          );


        if (
          pendingTransactions > 0
        ) {
          const error =
            new Error(
              "Cannot delete this user while they have a pending deposit or withdrawal. Resolve the pending transaction first."
            );

          error.statusCode = 409;

          throw error;
        }


        /*
         * Do not remove an account while an order
         * is still in the active workflow.
         */
        const pendingOrders =
          await Order.countDocuments({
            user: userId,
            status: "pending",
          }).session(
            session
          );


        if (
          pendingOrders > 0
        ) {
          const error =
            new Error(
              "Cannot delete this user while they have a pending order. Complete or cancel the order first."
            );

          error.statusCode = 409;

          throw error;
        }


        const ordersResult =
          await Order.deleteMany({
            user: userId,
          }).session(
            session
          );


        const transactionsResult =
          await Transaction.deleteMany({
            user: userId,
          }).session(
            session
          );


        await User.deleteOne({
          _id: userId,
        }).session(
          session
        );


        deletedResult = {
          userId,
          phone: user.phone,
          ordersDeleted:
            ordersResult.deletedCount ||
            0,
          transactionsDeleted:
            transactionsResult.deletedCount ||
            0,
        };
      }
    );


    res.json({
      success: true,

      message:
        "User and related records deleted successfully.",

      deleted:
        deletedResult,
    });

  } finally {
    await session.endSession();
  }
}

module.exports = {
  getDashboardStats,
  listUsers,
  getUserDetails,
  updateUserStatus,
  updateUserVip,
  updateUserSecurity,
  addUserBonus,
  deleteUser,
};