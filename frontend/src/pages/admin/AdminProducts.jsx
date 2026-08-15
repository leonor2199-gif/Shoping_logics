import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import productService from "../../services/productService";


const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  basePrice: "",
  cashbackBonus: "",
  minVipLevel: "1",
  isActive: true,
  displayOrder: "0",
  category: "general",
  tags: "",
  stockQuantity: "0",
};


function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}


function AdminProducts() {

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      pages: 1,
    });


  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("");


  // =========================================================
  // CREATE / EDIT MODAL
  // =========================================================

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);


  // =========================================================
  // VIEW MODAL
  // =========================================================

  const [viewProduct, setViewProduct] =
    useState(null);


  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async (
    currentPage = page
  ) => {

    try {

      setLoading(true);

      const params = {
        page: currentPage,
        limit: 20,
      };

      /*
       * The current backend supports category,
       * but does not have a search parameter or
       * inactive parameter.
       */

      if (category) {
        params.category =
          category;
      }

      const response =
        await productService.getAdminProducts(
          params
        );

      let loadedProducts =
        response.products || [];


      /*
       * Client-side search because the current
       * backend product controller does not
       * implement search.
       */

      if (search.trim()) {

        const keyword =
          search
            .trim()
            .toLowerCase();

        loadedProducts =
          loadedProducts.filter(
            (product) =>
              product.name
                ?.toLowerCase()
                .includes(keyword) ||
              product.description
                ?.toLowerCase()
                .includes(keyword) ||
              product.category
                ?.toLowerCase()
                .includes(keyword)
          );

      }


      /*
       * Client-side status filter.
       *
       * Current GET /products returns active
       * products only because listProducts()
       * calls createProductFilter() without
       * includeInactive.
       */

      if (status) {

        loadedProducts =
          loadedProducts.filter(
            (product) =>
              status === "active"
                ? product.isActive
                : !product.isActive
          );

      }


      setProducts(
        loadedProducts
      );

      setPagination(
        response.pagination || {
          page: currentPage,
          limit: 20,
          total:
            loadedProducts.length,
          pages: 1,
        }
      );

    } catch (error) {

      console.error(
        "Failed to load products:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load products."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadProducts(page);

  }, [page, category]);


  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (
    event
  ) => {

    event.preventDefault();

    setPage(1);

    loadProducts(1);

  };


  // =========================================================
  // FORM
  // =========================================================

  const handleInputChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

  };


  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreateModal = () => {

    setEditingProduct(null);

    setForm({
      ...EMPTY_FORM,
    });

    setModalOpen(true);

  };


  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (
    product
  ) => {

    setEditingProduct(
      product
    );

    setForm({
      name:
        product.name || "",

      description:
        product.description || "",

      image:
        product.image || "",

      /*
       * Convert backend minor units
       * into normal currency display.
       */

      basePrice:
        formatMoney(
          product.basePrice
        ),

      cashbackBonus:
        formatMoney(
          product.cashbackBonus
        ),

      minVipLevel:
        String(
          product.minVipLevel || 1
        ),

      isActive:
        product.isActive !== false,

      displayOrder:
        String(
          product.displayOrder || 0
        ),

      category:
        product.category ||
        "general",

      tags:
        Array.isArray(
          product.tags
        )
          ? product.tags.join(", ")
          : "",

      stockQuantity:
        String(
          product.stockQuantity || 0
        ),
    });

    setModalOpen(true);

  };


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {

    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingProduct(null);

    setForm({
      ...EMPTY_FORM,
    });

  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (!form.name.trim()) {

      toast.error(
        "Product name is required."
      );

      return;
    }


    if (
      !form.description.trim()
    ) {

      toast.error(
        "Product description is required."
      );

      return;
    }


    const price =
      Number(
        form.basePrice
      );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      toast.error(
        "Enter a valid product price."
      );

      return;
    }


    const cashback =
      Number(
        form.cashbackBonus
      );

    if (
      !Number.isFinite(cashback) ||
      cashback < 0
    ) {

      toast.error(
        "Enter a valid cashback bonus."
      );

      return;
    }


    const vip =
      Number(
        form.minVipLevel
      );

    if (
      !Number.isInteger(vip) ||
      vip < 1
    ) {

      toast.error(
        "VIP level must be a positive integer."
      );

      return;
    }


    const displayOrder =
      Number(
        form.displayOrder
      );

    if (
      !Number.isInteger(
        displayOrder
      ) ||
      displayOrder < 0
    ) {

      toast.error(
        "Display order must be a whole number."
      );

      return;
    }


    const stock =
      Number(
        form.stockQuantity
      );

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      toast.error(
        "Stock quantity must be a whole number."
      );

      return;
    }


    /*
     * Convert tags:
     *
     * "phone, electronics, apple"
     *
     * =>
     *
     * ["phone", "electronics", "apple"]
     */

    const tags =
      form.tags
        .split(",")
        .map(
          (tag) =>
            tag.trim()
        )
        .filter(Boolean);


    /*
     * Backend expects money in minor units.
     *
     * Example:
     *
     * 10.50 => 1050
     */

    const payload = {

      name:
        form.name.trim(),

      description:
        form.description.trim(),

      image:
        form.image.trim(),

      basePrice:
        Math.round(
          price * 100
        ),

      cashbackBonus:
        Math.round(
          cashback * 100
        ),

      minVipLevel:
        vip,

      isActive:
        Boolean(
          form.isActive
        ),

      displayOrder:
        displayOrder,

      category:
        form.category.trim() ||
        "general",

      tags,

      stockQuantity:
        stock,
    };


    try {

      setSaving(true);


      if (editingProduct) {

        await productService.updateProduct(
          editingProduct._id,
          payload
        );

        toast.success(
          "Product updated successfully."
        );

      } else {

        await productService.createProduct(
          payload
        );

        toast.success(
          "Product created successfully."
        );

      }


      closeModal();

      await loadProducts(
        page
      );

    } catch (error) {

      console.error(
        "Failed to save product:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to save product."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange =
    async (product) => {

      const nextStatus =
        !product.isActive;

      const action =
        nextStatus
          ? "activate"
          : "deactivate";


      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} "${product.name}"?`
        );

      if (!confirmed) {
        return;
      }


      try {

        await productService.updateProductStatus(
          product._id,
          nextStatus
        );

        toast.success(
          `Product ${action}d successfully.`
        );

        await loadProducts(
          page
        );

      } catch (error) {

        console.error(
          "Failed to update product status:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to update product status."
        );

      }

    };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${product.name}" permanently?`
      );

    if (!confirmed) {
      return;
    }


    try {

      await productService.deleteProduct(
        product._id
      );

      toast.success(
        "Product deleted successfully."
      );

      await loadProducts(
        page
      );

    } catch (error) {

      console.error(
        "Failed to delete product:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete product."
      );

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-products">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="admin-page-heading">

        <div>

          <h1>
            Products
          </h1>

          <p>
            Manage your product catalog,
            pricing and availability.
          </p>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={
            openCreateModal
          }
        >

          <Plus size={16} />

          Add Product

        </button>

      </div>


      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="admin-products-toolbar">


        <form
          className="admin-search"
          onSubmit={
            handleSearch
          }
        >

          <Search size={16} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
          />

          <button
            type="submit"
          >
            Search
          </button>

        </form>


        <input
          type="text"
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
          placeholder="Category"
        />


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

        </select>

      </div>


      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="admin-table-card">


        <div className="admin-table-card__header">

          <div>

            <strong>
              Product Catalog
            </strong>

            <span>
              {pagination.total} products
            </span>

          </div>


          <button
            type="button"
            onClick={() =>
              loadProducts(
                page
              )
            }
            disabled={
              loading
            }
          >
            Refresh
          </button>

        </div>


        {loading ? (

          <div className="admin-table-loading">

            Loading products...

          </div>

        ) : products.length === 0 ? (

          <div className="admin-table-empty">

            <h3>
              No products found
            </h3>

            <p>
              Create your first product
              to get started.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Cashback
                  </th>

                  <th>
                    VIP
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {products.map(
                  (product) => (

                    <tr
                      key={
                        product._id
                      }
                    >


                      {/* PRODUCT */}

                      <td>

                        <div className="admin-product-cell">

                          {product.image ? (

                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                            />

                          ) : (

                            <div className="admin-product-placeholder">
                              P
                            </div>

                          )}


                          <div>

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span>
                              {
                                product.description
                                  ?.slice(
                                    0,
                                    60
                                  )
                              }
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {
                          product.category ||
                          "general"
                        }

                      </td>


                      {/* PRICE */}

                      <td>

                        <strong>

                          $
                          {formatMoney(
                            product.basePrice
                          )}

                        </strong>

                      </td>


                      {/* CASHBACK */}

                      <td>

                        $
                        {formatMoney(
                          product.cashbackBonus
                        )}

                      </td>


                      {/* VIP */}

                      <td>

                        VIP{" "}
                        {
                          product.minVipLevel ||
                          1
                        }

                      </td>


                      {/* STOCK */}

                      <td>

                        {
                          product.stockQuantity ??
                          0
                        }

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`admin-status ${
                            product.isActive
                              ? "admin-status--active"
                              : "admin-status--inactive"
                          }`}
                        >

                          {
                            product.isActive
                              ? "Active"
                              : "Inactive"
                          }

                        </span>

                      </td>


                      {/* ORDER */}

                      <td>

                        {
                          product.displayOrder ??
                          0
                        }

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="admin-product-actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            title="View product"
                            onClick={() =>
                              setViewProduct(
                                product
                              )
                            }
                          >

                            <Eye
                              size={15}
                            />

                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            title="Edit product"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                          >

                            <Pencil
                              size={15}
                            />

                          </button>


                          {/* STATUS */}

                          <button
                            type="button"
                            title={
                              product.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() =>
                              handleStatusChange(
                                product
                              )
                            }
                          >

                            {product.isActive ? (

                              <EyeOff
                                size={15}
                              />

                            ) : (

                              <Eye
                                size={15}
                              />

                            )}

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            title="Delete product"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                          >

                            <Trash2
                              size={15}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          products.length > 0 && (

            <div className="admin-pagination">

              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
              >
                ← Previous
              </button>


              <span>

                Page{" "}

                <strong>
                  {
                    pagination.page
                  }
                </strong>

                {" "}of{" "}

                <strong>
                  {
                    pagination.pages
                  }
                </strong>

              </span>


              <button
                type="button"
                disabled={
                  page >=
                  pagination.pages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
              >
                Next →

              </button>

            </div>

          )}

      </div>


      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {modalOpen && (

        <div
          className="admin-modal-backdrop"
          onClick={
            closeModal
          }
        >

          <div
            className="admin-modal admin-product-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >


            {/* HEADER */}

            <div className="admin-modal__header">

              <div>

                <h2>

                  {editingProduct
                    ? "Edit Product"
                    : "Create Product"}

                </h2>

                <p>

                  {editingProduct
                    ? "Update product information."
                    : "Add a new product to the catalog."}

                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >


              {/* NAME */}

              <div className="admin-form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleInputChange
                  }
                  maxLength={160}
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="admin-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleInputChange
                  }
                  maxLength={5000}
                  rows={5}
                  required
                />

              </div>


              {/* IMAGE */}

              <div className="admin-form-group">

                <label>
                  Image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={
                    form.image
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="https://..."
                />

              </div>


              {/* PRICE */}

              <div className="admin-form-grid">

                <div className="admin-form-group">

                  <label>
                    Base Price
                  </label>

                  <input
                    type="number"
                    name="basePrice"
                    value={
                      form.basePrice
                    }
                    onChange={
                      handleInputChange
                    }
                    min="0"
                    step="0.01"
                    required
                  />

                </div>


                {/* CASHBACK */}

                <div className="admin-form-group">

                  <label>
                    Cashback Bonus
                  </label>

                  <input
                    type="number"
                    name="cashbackBonus"
                    value={
                      form.cashbackBonus
                    }
                    onChange={
                      handleInputChange
                    }
                    min="0"
                    step="0.01"
                  />

                </div>

              </div>


              {/* VIP / STOCK */}

              <div className="admin-form-grid">

                <div className="admin-form-group">

                  <label>
                    Minimum VIP Level
                  </label>

                  <input
                    type="number"
                    name="minVipLevel"
                    value={
                      form.minVipLevel
                    }
                    onChange={
                      handleInputChange
                    }
                    min="1"
                    step="1"
                    required
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stockQuantity"
                    value={
                      form.stockQuantity
                    }
                    onChange={
                      handleInputChange
                    }
                    min="0"
                    step="1"
                    required
                  />

                </div>

              </div>


              {/* CATEGORY / ORDER */}

              <div className="admin-form-grid">

                <div className="admin-form-group">

                  <label>
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleInputChange
                    }
                    maxLength={80}
                  />

                </div>


                <div className="admin-form-group">

                  <label>
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="displayOrder"
                    value={
                      form.displayOrder
                    }
                    onChange={
                      handleInputChange
                    }
                    min="0"
                    step="1"
                  />

                </div>

              </div>


              {/* TAGS */}

              <div className="admin-form-group">

                <label>
                  Tags
                </label>

                <input
                  type="text"
                  name="tags"
                  value={
                    form.tags
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="phone, electronics, apple"
                />

                <small>
                  Separate tags with commas.
                </small>

              </div>


              {/* ACTIVE */}

              <label className="admin-checkbox">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    form.isActive
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <span>
                  Product is active
                </span>

              </label>


              {/* ACTIONS */}

              <div className="admin-modal__actions">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="admin-modal-primary"
                  disabled={
                    saving
                  }
                >

                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================
          VIEW PRODUCT MODAL
      =================================================== */}

      {viewProduct && (

        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setViewProduct(
              null
            )
          }
        >

          <div
            className="admin-modal admin-product-view-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            <div className="admin-modal__header">

              <div>

                <h2>
                  Product Details
                </h2>

                <p>
                  {
                    viewProduct.name
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setViewProduct(
                    null
                  )
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* IMAGE */}

            {viewProduct.image && (

              <div className="admin-product-preview">

                <img
                  src={
                    viewProduct.image
                  }
                  alt={
                    viewProduct.name
                  }
                />

              </div>

            )}


            {/* DETAILS */}

            <div className="admin-user-details-grid">


              <div>

                <span>
                  Name
                </span>

                <strong>
                  {
                    viewProduct.name
                  }
                </strong>

              </div>


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {
                    viewProduct.category ||
                    "general"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Base Price
                </span>

                <strong>
                  $
                  {formatMoney(
                    viewProduct.basePrice
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Cashback
                </span>

                <strong>
                  $
                  {formatMoney(
                    viewProduct.cashbackBonus
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Minimum VIP
                </span>

                <strong>
                  VIP{" "}
                  {
                    viewProduct.minVipLevel ||
                    1
                  }
                </strong>

              </div>


              <div>

                <span>
                  Stock
                </span>

                <strong>
                  {
                    viewProduct.stockQuantity ??
                    0
                  }
                </strong>

              </div>


              <div>

                <span>
                  Display Order
                </span>

                <strong>
                  {
                    viewProduct.displayOrder ??
                    0
                  }
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong>
                  {
                    viewProduct.isActive
                      ? "Active"
                      : "Inactive"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Created
                </span>

                <strong>
                  {
                    viewProduct.createdAt
                      ? new Date(
                          viewProduct.createdAt
                        ).toLocaleString()
                      : "-"
                  }
                </strong>

              </div>

            </div>


            {/* DESCRIPTION */}

            <section className="admin-product-description">

              <h3>
                Description
              </h3>

              <p>
                {
                  viewProduct.description ||
                  "No description."
                }
              </p>

            </section>


            {/* TAGS */}

            <section className="admin-product-description">

              <h3>
                Tags
              </h3>

              <p>
                {Array.isArray(
                  viewProduct.tags
                ) &&
                viewProduct.tags.length
                  ? viewProduct.tags.join(
                      ", "
                    )
                  : "No tags."}
              </p>

            </section>


            {/* ACTIONS */}

            <div className="admin-modal__actions">

              <button
                type="button"
                onClick={() => {

                  const product =
                    viewProduct;

                  setViewProduct(
                    null
                  );

                  openEditModal(
                    product
                  );

                }}
              >

                <Pencil size={15} />

                Edit Product

              </button>


              <button
                type="button"
                className="admin-modal-primary"
                onClick={() => {

                  const product =
                    viewProduct;

                  setViewProduct(
                    null
                  );

                  handleStatusChange(
                    product
                  );

                }}
              >

                {viewProduct.isActive
                  ? "Deactivate"
                  : "Activate"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


export default AdminProducts;