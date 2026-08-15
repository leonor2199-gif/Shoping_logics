import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import "./AdminOrders.css";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}


function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(
    value
  ).toLocaleString();
}


function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "-";
  }
}


/*
|--------------------------------------------------------------------------
| ADMIN ORDERS
|--------------------------------------------------------------------------
*/

function AdminOrders() {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    deletingOrderId,
    setDeletingOrderId,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD ORDERS
  |--------------------------------------------------------------------------
  */

  const loadOrders =
    useCallback(
      async (page = 1) => {
        try {
          setLoading(true);
          setError("");

          const response =
            await adminService.getOrders({
              page,
              limit: 20,
              search,
              status,
            });

          setOrders(
            response.orders || []
          );

          setPagination(
            response.pagination || {
              page,
              limit: 20,
              total: 0,
              pages: 0,
            }
          );
        } catch (
          requestError
        ) {
          console.error(
            "Failed to load admin orders:",
            requestError
          );

          const message =
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load orders.";

          setError(message);
        } finally {
          setLoading(false);
        }
      },
      [
        search,
        status,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadOrders(1);
  }, [
    loadOrders,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  function handleSearch(
    event
  ) {
    event.preventDefault();

    setSearch(
      searchInput.trim()
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CLEAR SEARCH
  |--------------------------------------------------------------------------
  */

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }


  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  function handleStatusChange(
    event
  ) {
    setStatus(
      event.target.value
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VIEW ORDER
  |--------------------------------------------------------------------------
  */

  async function handleViewOrder(
    order
  ) {
    try {
      setDetailLoading(true);

      setSelectedOrder(
        order
      );

      const response =
        await adminService.getOrder(
          order._id
        );

      if (
        response?.order
      ) {
        setSelectedOrder(
          response.order
        );
      }
    } catch (
      requestError
    ) {
      console.error(
        "Failed to load order details:",
        requestError
      );

      toast.error(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to load order details."
      );
    } finally {
      setDetailLoading(false);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DELETE ORDER
  |--------------------------------------------------------------------------
  */

  async function handleDeleteOrder(
    order
  ) {
    if (
      !order?._id
    ) {
      toast.error(
        "Invalid order."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete order #${
          order.orderNumber ||
          order._id
        }?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(
        order._id
      );

      await adminService.deleteOrder(
        order._id
      );

      toast.success(
        "Order deleted successfully."
      );

      /*
       * Close the details modal
       * if the deleted order is
       * currently open.
       */

      if (
        selectedOrder?._id ===
        order._id
      ) {
        setSelectedOrder(null);
      }

      /*
       * If this was the last item
       * on the current page and we
       * are not on page 1, go back
       * one page.
       */

      if (
        orders.length === 1 &&
        pagination.page > 1
      ) {
        await loadOrders(
          pagination.page - 1
        );
      } else {
        await loadOrders(
          pagination.page
        );
      }
    } catch (
      requestError
    ) {
      console.error(
        "Failed to delete order:",
        requestError
      );

      toast.error(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to delete order."
      );
    } finally {
      setDeletingOrderId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  function closeModal() {
    if (
      detailLoading
    ) {
      return;
    }

    setSelectedOrder(null);
  }


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  function goToPage(
    page
  ) {
    if (
      page < 1 ||
      page > pagination.pages
    ) {
      return;
    }

    loadOrders(page);
  }


  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const pendingCount =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;

  const confirmedCount =
    orders.filter(
      (order) =>
        order.status ===
        "confirmed"
    ).length;

  const completedCount =
    orders.filter(
      (order) =>
        order.status ===
        "completed"
    ).length;

  const cancelledCount =
    orders.filter(
      (order) =>
        order.status ===
        "cancelled"
    ).length;


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-orders-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-page-header">

        <div>
          <p className="admin-page-header__eyebrow">
            Management
          </p>

          <h1>
            Orders
          </h1>

          <p>
            View and monitor customer
            orders.
          </p>
        </div>

      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="admin-orders-stats">

        <div className="admin-stat-card">
          <span>
            Total
          </span>

          <strong>
            {pagination.total}
          </strong>
        </div>


        <div className="admin-stat-card">
          <span>
            Pending
          </span>

          <strong>
            {pendingCount}
          </strong>
        </div>


        <div className="admin-stat-card">
          <span>
            Confirmed
          </span>

          <strong>
            {confirmedCount}
          </strong>
        </div>


        <div className="admin-stat-card">
          <span>
            Completed
          </span>

          <strong>
            {completedCount}
          </strong>
        </div>


        <div className="admin-stat-card">
          <span>
            Cancelled
          </span>

          <strong>
            {cancelledCount}
          </strong>
        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="admin-orders-filters">

        <form
          className="admin-search-form"
          onSubmit={
            handleSearch
          }
        >

          <input
            className="admin-search-input"
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder="Phone number"
          />


          <button
            className="admin-search-button"
            type="submit"
          >
            Search
          </button>


          {search && (
            <button
              className="admin-clear-button"
              type="button"
              onClick={
                clearSearch
              }
            >
              Clear
            </button>
          )}

        </form>


        <select
          className="admin-status-select"
          value={status}
          onChange={
            handleStatusChange
          }
        >

          <option value="all">
            All statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>

        </select>


        <button
          className="admin-refresh-button"
          type="button"
          onClick={() =>
            loadOrders(
              pagination.page
            )
          }
          disabled={loading}
        >
          Refresh
        </button>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-table-error">

          <strong>
            Unable to load orders
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadOrders(
                pagination.page
              )
            }
          >
            Try Again
          </button>

        </div>
      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="admin-orders-table-wrapper">

        {loading ? (

          <div className="admin-table-loading">
            Loading orders...
          </div>

        ) : orders.length === 0 ? (

          <div className="admin-table-empty">

            <h3>
              No orders found
            </h3>

            <p>
              There are no orders
              matching your filters.
            </p>

          </div>

        ) : (

          <table className="admin-orders-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  User
                </th>

                <th>
                  Product
                </th>

                <th>
                  VIP
                </th>

                <th>
                  Price
                </th>

                <th>
                  Cashback
                </th>

                <th>
                  Status
                </th>

                <th>
                  Created
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {orders.map(
                (order) => {

                  const user =
                    order.user ||
                    {};

                  const product =
                    order.product ||
                    {};

                  const isDeleting =
                    deletingOrderId ===
                    order._id;


                  return (
                    <tr
                      key={
                        order._id
                      }
                    >

                      {/* ORDER */}

                      <td>

                        <strong>
                          #
                          {
                            order.orderNumber ||
                            order._id
                          }
                        </strong>

                      </td>


                      {/* USER */}

                      <td>

                        <div>

                          <strong>
                            {
                              user.phone ||
                              "-"
                            }
                          </strong>

                          <small>
                            {
                              user.email ||
                              "No email"
                            }
                          </small>

                        </div>

                      </td>


                      {/* PRODUCT */}

                      <td>

                        <strong>
                          {
                            order.productName ||
                            product.name ||
                            "-"
                          }
                        </strong>

                      </td>


                      {/* VIP */}

                      <td>

                        VIP{" "}

                        {
                          user.vipLevel ||
                          product.minVipLevel ||
                          "-"
                        }

                      </td>


                      {/* PRICE */}

                      <td>

                        $
                        {
                          formatMoney(
                            order.basePrice
                          )
                        }

                      </td>


                      {/* CASHBACK */}

                      <td>

                        +
                        $
                        {
                          formatMoney(
                            order.cashbackBonus
                          )
                        }

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`order-status order-status--${order.status}`}
                        >
                          {
                            getStatusLabel(
                              order.status
                            )
                          }
                        </span>

                      </td>


                      {/* CREATED */}

                      <td>

                        {
                          formatDate(
                            order.createdAt
                          )
                        }

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="admin-order-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewOrder(
                                order
                              )
                            }
                            disabled={
                              isDeleting
                            }
                          >
                            View
                          </button>


                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() =>
                              handleDeleteOrder(
                                order
                              )
                            }
                            disabled={
                              isDeleting
                            }
                          >
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        )}

      </section>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading &&
        pagination.pages > 1 && (

          <div className="admin-pagination">

            <button
              type="button"
              disabled={
                pagination.page <= 1
              }
              onClick={() =>
                goToPage(
                  pagination.page - 1
                )
              }
            >
              ← Previous
            </button>


            <span>

              Page{" "}
              {
                pagination.page
              }{" "}
              of{" "}
              {
                pagination.pages
              }

            </span>


            <button
              type="button"
              disabled={
                pagination.page >=
                pagination.pages
              }
              onClick={() =>
                goToPage(
                  pagination.page + 1
                )
              }
            >
              Next →

            </button>

          </div>

        )}


      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (

        <div
          className="admin-modal-backdrop"
          onClick={
            closeModal
          }
        >

          <div
            className="admin-modal admin-order-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="admin-modal__header">

              <div>

                <p>
                  Order Details
                </p>

                <h2>
                  #
                  {
                    selectedOrder.orderNumber ||
                    selectedOrder._id
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  detailLoading
                }
              >
                ×
              </button>

            </div>


            {detailLoading ? (

              <div className="admin-table-loading">
                Loading order details...
              </div>

            ) : (

              <div className="admin-order-details">

                {/* ORDER STATUS */}

                <section>

                  <h3>
                    Order Status
                  </h3>

                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      {
                        getStatusLabel(
                          selectedOrder.status
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Created
                    </span>

                    <strong>
                      {
                        formatDate(
                          selectedOrder.createdAt
                        )
                      }
                    </strong>

                  </div>


                  {selectedOrder.confirmedAt && (

                    <div>

                      <span>
                        Confirmed
                      </span>

                      <strong>
                        {
                          formatDate(
                            selectedOrder.confirmedAt
                          )
                        }
                      </strong>

                    </div>

                  )}

                </section>


                {/* USER */}

                <section>

                  <h3>
                    Customer
                  </h3>

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .user
                          ?.phone ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .user
                          ?.email ||
                        "No email"
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      VIP Level
                    </span>

                    <strong>
                      VIP{" "}
                      {
                        selectedOrder
                          .user
                          ?.vipLevel ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Current Balance
                    </span>

                    <strong>
                      $
                      {
                        formatMoney(
                          selectedOrder
                            .user
                            ?.balance
                        )
                      }
                    </strong>

                  </div>

                </section>


                {/* PRODUCT */}

                <section>

                  <h3>
                    Product
                  </h3>

                  <div>

                    <span>
                      Product
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .productName ||
                        selectedOrder
                          .product
                          ?.name ||
                        "-"
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Quantity
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .quantity ||
                        1
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      VIP Requirement
                    </span>

                    <strong>
                      VIP{" "}
                      {
                        selectedOrder
                          .product
                          ?.minVipLevel ||
                        "-"
                      }
                    </strong>

                  </div>

                </section>


                {/* FINANCIAL */}

                <section>

                  <h3>
                    Financial
                  </h3>


                  <div>

                    <span>
                      Product Price
                    </span>

                    <strong>
                      $
                      {
                        formatMoney(
                          selectedOrder
                            .basePrice
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Cashback
                    </span>

                    <strong>
                      +$
                      {
                        formatMoney(
                          selectedOrder
                            .cashbackBonus
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Order Total
                    </span>

                    <strong>
                      $
                      {
                        formatMoney(
                          selectedOrder
                            .totalAmount
                        )
                      }
                    </strong>

                  </div>


                  <div>

                    <span>
                      Net User Profit
                    </span>

                    <strong>
                      +$
                      {
                        formatMoney(
                          selectedOrder
                            .cashbackBonus
                        )
                      }
                    </strong>

                  </div>

                </section>


                {/* NOTES */}

                {selectedOrder.adminNotes && (

                  <section>

                    <h3>
                      Admin Notes
                    </h3>

                    <p>
                      {
                        selectedOrder.adminNotes
                      }
                    </p>

                  </section>

                )}


                {/* FOOTER */}

                <div className="admin-modal__footer">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                  >
                    Close
                  </button>


                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() =>
                      handleDeleteOrder(
                        selectedOrder
                      )
                    }
                    disabled={
                      deletingOrderId ===
                      selectedOrder._id
                    }
                  >
                    {
                      deletingOrderId ===
                      selectedOrder._id
                        ? "Deleting..."
                        : "Delete Order"
                    }
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default AdminOrders;