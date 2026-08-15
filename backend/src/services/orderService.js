const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const {
  createIdentifier,
} = require("../utils/identifiers");


/*
|--------------------------------------------------------------------------
| HTTP ERROR
|--------------------------------------------------------------------------
*/

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}


/*
|--------------------------------------------------------------------------
| ID NORMALIZER
|--------------------------------------------------------------------------
*/

function normalizeId(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "object" &&
    value._id
  ) {
    return String(value._id);
  }

  return String(value);
}


/*
|--------------------------------------------------------------------------
| GET USER ID
|--------------------------------------------------------------------------
*/

function getUserId(user) {
  if (!user) {
    return null;
  }

  return (
    user._id ||
    user.id ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| GET VIP LEVEL
|--------------------------------------------------------------------------
*/

function getUserVipLevel(user) {
  const vipLevel =
    Number(
      user?.vipLevel
    );

  if (
    !Number.isInteger(vipLevel) ||
    vipLevel < 1
  ) {
    return 1;
  }

  return vipLevel;
}


/*
|--------------------------------------------------------------------------
| MONEY
|--------------------------------------------------------------------------
|
| Database stores money in minor currency units.
|
| Example:
|
| 10000 = 100.00
|
|--------------------------------------------------------------------------
*/

function calculatePurchaseAmount(
  basePrice
) {
  return Number(
    basePrice || 0
  );
}


function calculateCashbackAmount(
  cashbackBonus
) {
  return Number(
    cashbackBonus || 0
  );
}


function calculateOrderTotal(
  basePrice,
  cashbackBonus,
  quantity = 1
) {
  const itemCount =
    Number.isFinite(Number(quantity)) &&
    Number(quantity) > 0
      ? Number(quantity)
      : 1;

  return (
    (
      calculatePurchaseAmount(
        basePrice
      ) +
      calculateCashbackAmount(
        cashbackBonus
      )
    ) * itemCount
  );
}


/*
|--------------------------------------------------------------------------
| FIND NEXT PRODUCT FOR USER
|--------------------------------------------------------------------------
|
| RULES:
|
| 1. Exact VIP match:
|
|    product.minVipLevel === user.vipLevel
|
| 2. Active product
|
| 3. Stock >= 1
|
| 4. User has NOT already accepted it
|
| 5. Lowest displayOrder first
|
| 6. If stock = 0, skip it
|
|--------------------------------------------------------------------------
*/

async function findNextProductForUser(
  user
) {
  const userId =
    getUserId(user);

  if (!userId) {
    throw createHttpError(
      "User account is required.",
      401
    );
  }

  const vipLevel =
    getUserVipLevel(user);


  /*
   * Products already accepted
   * by this user.
   */

  const acceptedProductIds =
    await Order.distinct(
      "product",
      {
        user: userId,

        status: {
          $in: [
            "confirmed",
            "completed",
          ],
        },
      }
    );


  /*
   * EXACT VIP MATCH.
   *
   * NOT:
   *
   * minVipLevel <= vipLevel
   *
   * It must be:
   *
   * minVipLevel === vipLevel
   */

  const product =
    await Product.findOne({
      isActive: true,

      minVipLevel:
        vipLevel,

      stockQuantity: {
        $gte: 1,
      },

      _id: {
        $nin:
          acceptedProductIds,
      },
    })
      .sort({
        displayOrder: 1,
        createdAt: 1,
      });


  return (
    product ||
    null
  );
}


/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Quantity is ALWAYS 1.
|
| The frontend does not control quantity.
|
|--------------------------------------------------------------------------
*/

async function createOrder({
  user,
  productId,
}) {
  const userId =
    getUserId(user);

  if (!userId) {
    throw createHttpError(
      "Invalid user account.",
      401
    );
  }


  /*
   * Normalize product ID.
   */

  const normalizedProductId =
    normalizeId(
      productId
    );


  if (
    !normalizedProductId ||
    !mongoose.isValidObjectId(
      normalizedProductId
    )
  ) {
    throw createHttpError(
      "Invalid product identifier.",
      400
    );
  }


  /*
   * Prevent multiple pending
   * orders for the same user.
   */

  const pendingOrder =
    await Order.exists({
      user: userId,
      status: "pending",
    });


  if (pendingOrder) {
    throw createHttpError(
      "Confirm or cancel your current pending order before starting another.",
      409
    );
  }


  /*
   * Get ONLY the next eligible
   * product for this user.
   */

  const product =
    await findNextProductForUser(
      user
    );


  if (!product) {
    throw createHttpError(
      "No eligible product is currently available.",
      404
    );
  }


  /*
   * Make sure the requested
   * product is actually the next
   * product.
   */

  if (
    normalizeId(
      product._id
    ) !==
    normalizedProductId
  ) {
    throw createHttpError(
      "This is not your current product.",
      409
    );
  }


  /*
   * Make sure stock still exists.
   */

  if (
    Number(
      product.stockQuantity || 0
    ) < 1
  ) {
    throw createHttpError(
      "Product is out of stock.",
      409
    );
  }


  /*
   * ONE PRODUCT = ONE UNIT
   */

  const quantity = 1;


  /*
   * Product price.
   *
   * This is what the user needs
   * in their balance.
   */

  const purchaseAmount =
    calculatePurchaseAmount(
      product.basePrice
    );


  /*
   * Cashback.
   */

  const cashbackAmount =
    calculateCashbackAmount(
      product.cashbackBonus
    );


  /*
   * Display total.
   */

  const totalAmount =
    calculateOrderTotal(
      product.basePrice,
      product.cashbackBonus
    );


  /*
   * Validate product price.
   */

  if (
    !Number.isSafeInteger(
      purchaseAmount
    ) ||
    purchaseAmount < 0
  ) {
    throw createHttpError(
      "Invalid product price.",
      400
    );
  }


  /*
   * Validate cashback.
   */

  if (
    !Number.isSafeInteger(
      cashbackAmount
    ) ||
    cashbackAmount < 0
  ) {
    throw createHttpError(
      "Invalid cashback amount.",
      400
    );
  }


  /*
   * Create pending order.
   *
   * No money is deducted here.
   * No stock is deducted here.
   */

  const order =
    await Order.create({
      orderNumber:
        createIdentifier(
          "ORD"
        ),

      user:
        userId,

      product:
        product._id,

      productName:
        product.name,

      quantity,

      basePrice:
        purchaseAmount,

      cashbackBonus:
        cashbackAmount,

      totalAmount,

      status:
        "pending",
    });


  return order;
}


/*
|--------------------------------------------------------------------------
| CONFIRM ORDER
|--------------------------------------------------------------------------
|
| FINANCIAL FLOW
|
| Example:
|
| Starting balance = 100
| Product price    = 100
| Cashback         = 10
|
| Purchase:
|
|   100 - 100 = 0
|
| Reward:
|
|   0 + 100 + 10 = 110
|
| Final balance:
|
|   110
|
|--------------------------------------------------------------------------
*/

async function confirmOrder({
  orderId,
  actor,
  adminNotes,
}) {
  const normalizedOrderId =
    normalizeId(
      orderId
    );


  if (
    !normalizedOrderId ||
    !mongoose.isValidObjectId(
      normalizedOrderId
    )
  ) {
    throw createHttpError(
      "Invalid order identifier.",
      400
    );
  }


  const session =
    await mongoose.startSession();


  let result = null;


  try {

    await session.withTransaction(
      async () => {

        /*
         * ----------------------------------------------------
         * GET ORDER
         * ----------------------------------------------------
         */

        const order =
          await Order.findById(
            normalizedOrderId
          ).session(
            session
          );


        if (!order) {
          throw createHttpError(
            "Order not found.",
            404
          );
        }


        /*
         * Only pending orders.
         */

        if (
          order.status !==
          "pending"
        ) {
          throw createHttpError(
            "Only pending orders can be confirmed.",
            409
          );
        }


        /*
         * User can only confirm
         * their own order.
         */

        if (
          actor.role ===
          "user"
        ) {

          const actorUserId =
            normalizeId(
              actor.account?._id ||
              actor.account?.id
            );


          const orderUserId =
            normalizeId(
              order.user
            );


          if (
            !actorUserId ||
            actorUserId !==
              orderUserId
          ) {
            throw createHttpError(
              "You can only confirm your own orders.",
              403
            );
          }
        }


        /*
         * ----------------------------------------------------
         * GET CURRENT USER
         * ----------------------------------------------------
         */

        const currentUser =
          await User.findById(
            order.user
          ).session(
            session
          );


        if (!currentUser) {
          throw createHttpError(
            "User not found.",
            404
          );
        }


        if (
          currentUser.status !==
          "active"
        ) {
          throw createHttpError(
            "User account is not active.",
            403
          );
        }


        /*
         * ----------------------------------------------------
         * EXACT VIP VALIDATION
         * ----------------------------------------------------
         */

        const currentVipLevel =
          getUserVipLevel(
            currentUser
          );


        /*
         * ----------------------------------------------------
         * ATOMIC STOCK DECREASE
         * ----------------------------------------------------
         */

        const product =
          await Product.findOneAndUpdate(
            {
              _id:
                order.product,

              isActive:
                true,

              minVipLevel:
                currentVipLevel,

              stockQuantity: {
                $gte: 1,
              },
            },

            {
              $inc: {
                stockQuantity:
                  -1,
              },
            },

            {
              new: true,
              session,
            }
          );


        if (!product) {
          throw createHttpError(
            "Product is no longer available.",
            409
          );
        }


        /*
         * ----------------------------------------------------
         * MONEY
         * ----------------------------------------------------
         */

        const purchaseAmount =
          calculatePurchaseAmount(
            order.basePrice
          );


        const cashbackAmount =
          calculateCashbackAmount(
            order.cashbackBonus
          );


        /*
         * ----------------------------------------------------
         * CHECK BALANCE
         * ----------------------------------------------------
         *
         * Only product price is required.
         *
         * Cashback is NOT required
         * before accepting.
         *
         * ----------------------------------------------------
         */

        const balanceBefore =
          Number(
            currentUser.balance || 0
          );


        if (
          balanceBefore <
          purchaseAmount
        ) {
          throw createHttpError(
            "User has insufficient available balance.",
            409
          );
        }


        /*
         * ----------------------------------------------------
         * PURCHASE DEBIT
         * ----------------------------------------------------
         *
         * Example:
         *
         * 100 - 100 = 0
         *
         * ----------------------------------------------------
         */

        const userAfterDebit =
          await User.findOneAndUpdate(
            {
              _id:
                currentUser._id,

              status:
                "active",

              balance: {
                $gte:
                  purchaseAmount,
              },
            },

            {
              $inc: {
                balance:
                  -purchaseAmount,
              },
            },

            {
              new: true,
              session,
            }
          );


        if (!userAfterDebit) {
          throw createHttpError(
            "User has insufficient available balance.",
            409
          );
        }


        const balanceAfterDebit =
          Number(
            userAfterDebit.balance
          );


        /*
         * Purchase transaction.
         */

        const purchaseTransaction =
          await Transaction.create(
            [
              {
                transactionId:
                  createIdentifier(
                    "TXN"
                  ),

                user:
                  userAfterDebit._id,

                type:
                  "purchase",

                direction:
                  "debit",

                amount:
                  purchaseAmount,

                balanceBefore:
                  balanceBefore,

                balanceAfter:
                  balanceAfterDebit,

                order:
                  order._id,

                createdBy:
                  actor.role ===
                  "admin"
                    ? actor.account.id
                    : undefined,

                description:
                  `Purchase ${order.orderNumber}: ${order.productName}`,
              },
            ],
            {
              session,
            }
          );


        /*
         * ----------------------------------------------------
         * PRODUCT PRICE RETURN + CASHBACK
         * ----------------------------------------------------
         *
         * This is the important part.
         *
         * Example:
         *
         * Starting balance = 100
         * Product price    = 100
         * Cashback         = 10
         *
         * After purchase:
         *
         *   100 - 100 = 0
         *
         * After reward:
         *
         *   0 + 100 + 10 = 110
         *
         * Final balance = 110
         *
         * Therefore:
         *
         * rewardAmount =
         *   purchaseAmount +
         *   cashbackAmount
         *
         * ----------------------------------------------------
         */

        const rewardAmount =
          purchaseAmount +
          cashbackAmount;


        let finalUser =
          userAfterDebit;


        let rewardTransaction =
          null;


        if (
          rewardAmount > 0
        ) {

          const balanceBeforeReward =
            Number(
              userAfterDebit.balance
            );


          /*
           * Add back:
           *
           * product price
           * +
           * cashback
           */

          finalUser =
            await User.findByIdAndUpdate(
              currentUser._id,

              {
                $inc: {
                  balance:
                    rewardAmount,
                },
              },

              {
                new: true,
                session,
              }
            );


          if (!finalUser) {
            throw createHttpError(
              "Unable to apply product reward.",
              500
            );
          }


          const balanceAfterReward =
            Number(
              finalUser.balance
            );


          /*
           * Record the entire reward
           * as one credit transaction.
           */

          rewardTransaction =
            (
              await Transaction.create(
                [
                  {
                    transactionId:
                      createIdentifier(
                        "TXN"
                      ),

                    user:
                      finalUser._id,

                    type:
                      "adjustment",

                    direction:
                      "credit",

                    amount:
                      rewardAmount,

                    balanceBefore:
                      balanceBeforeReward,

                    balanceAfter:
                      balanceAfterReward,

                    order:
                      order._id,

                    createdBy:
                      actor.role ===
                      "admin"
                        ? actor.account.id
                        : undefined,

                    description:
                      `Product reward for ${order.orderNumber}: ${order.productName} (price return ${purchaseAmount} + cashback ${cashbackAmount})`,
                  },
                ],
                {
                  session,
                }
              )
            )[0];
        }


        /*
         * ----------------------------------------------------
         * UPDATE ORDER
         * ----------------------------------------------------
         */

        order.status =
          "confirmed";


        order.confirmedAt =
          new Date();


        /*
         * Purchase transaction remains
         * the order's balance transaction.
         */

        order.balanceTransaction =
          purchaseTransaction[0]._id;


        if (
          adminNotes
        ) {
          order.adminNotes =
            adminNotes;
        }


        await order.save({
          session,
        });


        /*
         * Final result.
         */

        result = {
          order,

          product,

          transaction:
            purchaseTransaction[0],

          rewardTransaction,

          balance:
            Number(
              finalUser.balance
            ),
        };
      },

      {
        readConcern: {
          level:
            "snapshot",
        },

        writeConcern: {
          w:
            "majority",
        },
      }
    );

  } finally {

    await session.endSession();

  }


  /*
   * --------------------------------------------------------
   * FIND NEXT PRODUCT
   * --------------------------------------------------------
   */

  if (
    result
  ) {

    const nextProduct =
      await findNextProductForUser(
        {
          _id:
            actor.account?._id ||
            actor.account?.id,

          id:
            actor.account?.id ||
            actor.account?._id,

          vipLevel:
            actor.account?.vipLevel,
        }
      );


    result.nextProduct =
      nextProduct;
  }


  return result;
}


/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/

async function cancelOrder({
  orderId,
  actor,
}) {
  const normalizedOrderId =
    normalizeId(
      orderId
    );


  if (
    !normalizedOrderId ||
    !mongoose.isValidObjectId(
      normalizedOrderId
    )
  ) {
    throw createHttpError(
      "Invalid order identifier.",
      400
    );
  }


  const order =
    await Order.findById(
      normalizedOrderId
    );


  if (!order) {
    throw createHttpError(
      "Order not found.",
      404
    );
  }


  /*
   * Normal user can only
   * cancel their own order.
   */

  if (
    actor.role ===
    "user"
  ) {

    const actorUserId =
      normalizeId(
        actor.account?._id ||
        actor.account?.id
      );


    if (
      actorUserId !==
      normalizeId(
        order.user
      )
    ) {
      throw createHttpError(
        "You can only cancel your own orders.",
        403
      );
    }
  }


  /*
   * Only pending orders
   * can be cancelled.
   */

  if (
    order.status !==
    "pending"
  ) {
    throw createHttpError(
      "Only pending orders can be cancelled.",
      409
    );
  }


  order.status =
    "cancelled";


  order.cancelledAt =
    new Date();


  await order.save();


  return order;
}


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  calculateOrderTotal,
  calculatePurchaseAmount,
  calculateCashbackAmount,
  createOrder,
  findNextProductForUser,
  confirmOrder,
  cancelOrder,
};