const Product = require("../models/Product");
const Order = require("../models/Order");

const {
  findNextProductForUser,
} = require("../services/orderService");


/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function getPagination(query) {
  const page = Math.max(
    Number.parseInt(query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(query.limit, 10) || 20,
      1
    ),
    100
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}


/*
|--------------------------------------------------------------------------
| Admin/Public Product List
|--------------------------------------------------------------------------
*/

function createProductFilter(
  query,
  { includeInactive = false } = {}
) {
  const filter = includeInactive
    ? {}
    : {
        isActive: true,
      };

  if (query.category) {
    filter.category = query.category;
  }

  /*
   * IMPORTANT:
   *
   * Do NOT use this for the user product flow.
   *
   * User access is handled by findNextProductForUser()
   * and requires exact VIP matching.
   */

  if (query.minVipLevel) {
    filter.minVipLevel = Number(
      query.minVipLevel
    );
  }

  return filter;
}


/*
|--------------------------------------------------------------------------
| List Products
|--------------------------------------------------------------------------
*/

async function listProducts(req, res) {
  const {
    page,
    limit,
    skip,
  } = getPagination(req.query);

  const filter = createProductFilter(
    req.query
  );

  const [
    products,
    total,
  ] = await Promise.all([
    Product.find(filter)
      .sort({
        displayOrder: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,

    products,

    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(
        total / limit
      ),
    },
  });
}


/*
|--------------------------------------------------------------------------
| USER: Get Current Product
|--------------------------------------------------------------------------
|
| Returns ONLY one product.
|
| Example:
|
| VIP 1:
|   Product A (VIP 1)
|
| After Product A is accepted:
|   Product B (VIP 1)
|
| If Product B has zero stock:
|   Product C (VIP 1)
|
| VIP 2:
|   ONLY products with minVipLevel === 2
|
|--------------------------------------------------------------------------
*/

async function getAvailableProducts(
  req,
  res
) {
  const user = req.auth.account;

  const product =
    await findNextProductForUser(user);

  res.json({
    success: true,

    products: product
      ? [product]
      : [],

    pagination: {
      page: 1,
      limit: 1,
      total: product ? 1 : 0,
      pages: product ? 1 : 0,
    },
  });
}


/*
|--------------------------------------------------------------------------
| USER: Get Next Product
|--------------------------------------------------------------------------
*/

async function getNextProduct(
  req,
  res
) {
  const user = req.auth.account;

  /*
   * A user cannot receive another product while
   * they have a pending order.
   */
  const pendingOrder =
    await Order.findOne({
      user: user._id,
      status: "pending",
    }).populate("product");

  if (pendingOrder) {
    return res.json({
      success: true,
      product: null,
      pendingOrder,
    });
  }

  const product =
    await findNextProductForUser(user);

  return res.json({
    success: true,
    product,
    pendingOrder: null,
  });
}


/*
|--------------------------------------------------------------------------
| USER: Get Specific Product
|--------------------------------------------------------------------------
|
| IMPORTANT:
| - Must be authenticated.
| - Exact VIP match.
| - Must be the user's current product.
| - Must have stock.
| - Cannot access a product already accepted.
|--------------------------------------------------------------------------
*/

async function getProduct(
  req,
  res
) {
  const user = req.auth.account;

  /*
   * First check the product itself.
   *
   * EXACT VIP MATCH:
   *
   * minVipLevel === user.vipLevel
   */
  const product =
    await Product.findOne({
      _id: req.params.id,
      isActive: true,
      minVipLevel: user.vipLevel,
      stockQuantity: {
        $gt: 0,
      },
    });

  if (!product) {
    const error = new Error(
      "This product is not available for your VIP level or is out of stock."
    );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Make sure this product is actually
   * the user's current product.
   */
  const nextProduct =
    await findNextProductForUser(user);

  if (!nextProduct) {
    const error = new Error(
      "You have no available products."
    );

    error.statusCode = 404;

    throw error;
  }


  /*
   * User is trying to open a product that
   * isn't currently assigned to them.
   */
  if (
    String(nextProduct._id) !==
    String(product._id)
  ) {
    const error = new Error(
      "This is not your current product."
    );

    error.statusCode = 403;

    throw error;
  }


  res.json({
    success: true,
    product,
  });
}


/*
|--------------------------------------------------------------------------
| ADMIN: Create Product
|--------------------------------------------------------------------------
*/

async function createProduct(
  req,
  res
) {
  const product =
    await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
}


/*
|--------------------------------------------------------------------------
| ADMIN: Update Product
|--------------------------------------------------------------------------
*/

async function updateProduct(
  req,
  res
) {
  const product =
    await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!product) {
    const error = new Error(
      "Product not found."
    );

    error.statusCode = 404;

    throw error;
  }

  res.json({
    success: true,
    product,
  });
}


/*
|--------------------------------------------------------------------------
| ADMIN: Enable / Disable Product
|--------------------------------------------------------------------------
*/

async function updateProductStatus(
  req,
  res
) {
  if (
    typeof req.body.isActive !==
    "boolean"
  ) {
    const error = new Error(
      "isActive must be a boolean."
    );

    error.statusCode = 400;

    throw error;
  }

  const product =
    await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive:
          req.body.isActive,
      },
      {
        new: true,
      }
    );

  if (!product) {
    const error = new Error(
      "Product not found."
    );

    error.statusCode = 404;

    throw error;
  }

  res.json({
    success: true,
    product,
  });
}


/*
|--------------------------------------------------------------------------
| ADMIN: Delete Product
|--------------------------------------------------------------------------
*/

async function deleteProduct(
  req,
  res
) {
  const product =
    await Product.findByIdAndDelete(
      req.params.id
    );

  if (!product) {
    const error = new Error(
      "Product not found."
    );

    error.statusCode = 404;

    throw error;
  }

  res.status(204).send();
}


module.exports = {
  listProducts,
  getAvailableProducts,
  getNextProduct,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};