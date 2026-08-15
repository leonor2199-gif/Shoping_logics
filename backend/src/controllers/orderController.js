const Order = require("../models/Order");
const User = require("../models/User");

const {
  cancelOrder,
  confirmOrder,
  createOrder,
} = require("../services/orderService");


/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

function getPagination(query) {
  const page = Math.max(
    Number.parseInt(
      query.page,
      10
    ) || 1,
    1
  );

  const limit = Math.min(
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
      (page - 1) * limit,
  };
}


/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

async function placeOrder(
  req,
  res
) {
  const order =
    await createOrder({
      user:
        req.auth.account,

      productId:
        req.body.productId,
    });

  res.status(201).json({
    success: true,
    order,
  });
}


/*
|--------------------------------------------------------------------------
| USER ORDERS
|--------------------------------------------------------------------------
*/

async function listMyOrders(
  req,
  res
) {
  const {
    page,
    limit,
    skip,
  } =
    getPagination(
      req.query
    );

  const filter = {
    user:
      req.auth.account.id,
  };

  const [
    orders,
    total,
  ] =
    await Promise.all([
      Order.find(filter)
        .populate(
          "product"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(
        filter
      ),
    ]);

  res.json({
    success: true,

    orders,

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
| ADMIN ORDER LIST
|--------------------------------------------------------------------------
|
| GET /api/admin/orders
|
| Supported:
|
| ?page=1
| ?limit=20
| ?status=pending
| ?search=527791138209
|
| Search is based on USER PHONE.
|
|--------------------------------------------------------------------------
*/

async function listOrders(
  req,
  res
) {
  const {
    page,
    limit,
    skip,
  } =
    getPagination(
      req.query
    );

  const filter = {};


  /*
   * ========================================================
   * STATUS FILTER
   * ========================================================
   */

  if (
    req.query.status &&
    req.query.status !== "all"
  ) {
    filter.status =
      req.query.status;
  }


  /*
   * ========================================================
   * USER PHONE SEARCH
   * ========================================================
   */

  const search =
    String(
      req.query.search || ""
    ).trim();


  if (search) {

    /*
     * Escape regex characters.
     */

    const escapedSearch =
      search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


    /*
     * Find users whose phone
     * contains the search text.
     */

    const matchingUsers =
      await User.find({
        phone: {
          $regex:
            escapedSearch,
          $options: "i",
        },
      })
        .select("_id")
        .lean();


    /*
     * No matching users.
     */

    if (
      matchingUsers.length === 0
    ) {

      return res.json({
        success: true,

        orders: [],

        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }


    /*
     * Get user IDs.
     */

    const userIds =
      matchingUsers.map(
        (user) =>
          user._id
      );


    /*
     * Find orders belonging
     * to those users.
     */

    filter.user = {
      $in: userIds,
    };
  }


  /*
   * ========================================================
   * LOAD ORDERS
   * ========================================================
   */

  const [
    orders,
    total,
  ] =
    await Promise.all([
      Order.find(filter)

        /*
         * USER
         */

        .populate(
          "user",
          "phone email vipLevel balance status createdAt"
        )

        /*
         * PRODUCT
         */

        .populate(
          "product",
          "name image description basePrice cashbackBonus minVipLevel stockQuantity"
        )

        /*
         * NEWEST FIRST
         */

        .sort({
          createdAt: -1,
        })

        /*
         * PAGINATION
         */

        .skip(skip)
        .limit(limit),

      /*
       * TOTAL
       */

      Order.countDocuments(
        filter
      ),
    ]);


  /*
   * ========================================================
   * RESPONSE
   * ========================================================
   */

  res.json({
    success: true,

    orders,

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
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

async function getOrder(
  req,
  res
) {
  const order =
    await Order.findById(
      req.params.id
    )
      .populate(
        "user",
        "phone email vipLevel balance status createdAt"
      )
      .populate(
        "product",
        "name image description basePrice cashbackBonus minVipLevel stockQuantity"
      );


  if (!order) {

    const error =
      new Error(
        "Order not found."
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Normal users can only
   * view their own order.
   */

  if (
    req.auth.role ===
    "user"
  ) {

    const currentUserId =
      String(
        req.auth.account.id
      );

    const orderUserId =
      String(
        order.user._id
      );


    if (
      currentUserId !==
      orderUserId
    ) {

      const error =
        new Error(
          "You can only view your own orders."
        );

      error.statusCode = 403;

      throw error;
    }
  }


  res.json({
    success: true,
    order,
  });
}


/*
|--------------------------------------------------------------------------
| CONFIRM
|--------------------------------------------------------------------------
*/

async function confirm(
  req,
  res
) {
  const result =
    await confirmOrder({
      orderId:
        req.params.id,

      actor:
        req.auth,

      adminNotes:
        req.auth.role ===
        "admin"
          ? req.body?.adminNotes
          : undefined,
    });


  res.json({
    success: true,
    ...result,
  });
}


/*
|--------------------------------------------------------------------------
| CANCEL
|--------------------------------------------------------------------------
*/

async function cancel(
  req,
  res
) {
  const order =
    await cancelOrder({
      orderId:
        req.params.id,

      actor:
        req.auth,
    });


  res.json({
    success: true,
    order,
  });
}

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

async function deleteOrder(req, res) {
  const order = await Order.findById(
    req.params.id
  );

  if (!order) {
    const error = new Error(
      "Order not found."
    );

    error.statusCode = 404;
    throw error;
  }

  await Order.findByIdAndDelete(
    req.params.id
  );

  res.json({
    success: true,
    message: "Order deleted successfully.",
  });
}
/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  placeOrder,
  listMyOrders,
  listOrders,
  getOrder,
  confirm,
  cancel,
  deleteOrder,
};