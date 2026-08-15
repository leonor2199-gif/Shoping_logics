import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import "./AdminTransactions.css"


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


function getTypeLabel(type) {
  if (
    type === "deposit"
  ) {
    return "Deposit";
  }

  if (
    type === "withdrawal"
  ) {
    return "Withdrawal";
  }

  return type || "-";
}


function getStatusLabel(
  status
) {
  if (
    status === "pending"
  ) {
    return "Pending";
  }

  if (
    status === "completed"
  ) {
    return "Completed";
  }

  if (
    status === "failed"
  ) {
    return "Failed";
  }

  return status || "-";
}


function AdminTransactions() {

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [
    transactions,
    setTransactions,
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


  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [
    type,
    setType,
  ] = useState("");


  const [
    status,
    setStatus,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    fromDate,
    setFromDate,
  ] = useState("");


  const [
    toDate,
    setToDate,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | SEARCH INPUT
  |--------------------------------------------------------------------------
  */

  const [
    phoneInput,
    setPhoneInput,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | DETAIL MODAL
  |--------------------------------------------------------------------------
  */

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | ACTION LOADING
  |--------------------------------------------------------------------------
  */

  const [
    actionId,
    setActionId,
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD TRANSACTIONS
  |--------------------------------------------------------------------------
  */

  const loadTransactions =
    useCallback(
      async (
        page = 1
      ) => {

        try {

          setLoading(true);


          const response =
            await adminService.getTransactions({
              page,
              limit: 20,
              type,
              status,
              phone,
              fromDate,
              toDate,
            });


          setTransactions(
            response.transactions ||
            []
          );


          setPagination(
            response.pagination || {
              page,
              limit: 20,
              total: 0,
              pages: 0,
            }
          );

        } catch (error) {

          console.error(
            "Failed to load transactions:",
            error
          );


          toast.error(
            error.response?.data?.message ||
            "Unable to load transactions."
          );

        } finally {

          setLoading(false);
        }
      },
      [
        type,
        status,
        phone,
        fromDate,
        toDate,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | INITIAL / FILTER LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadTransactions(1);

  }, [
    loadTransactions,
  ]);


  /*
  |--------------------------------------------------------------------------
  | PHONE SEARCH
  |--------------------------------------------------------------------------
  */

  function handlePhoneSearch(
    event
  ) {
    event.preventDefault();

    setPhone(
      phoneInput.trim()
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  function clearFilters() {

    setPhoneInput("");

    setPhone("");

    setType("");

    setStatus("");

    setFromDate("");

    setToDate("");
  }


  /*
  |--------------------------------------------------------------------------
  | APPROVE
  |--------------------------------------------------------------------------
  */

  async function handleApprove(
    transaction
  ) {

    const id =
      transaction._id;


    if (!id) {
      return;
    }


    const confirmed =
      window.confirm(
        `Approve this ${transaction.type}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setActionId(id);


      if (
        transaction.type ===
        "deposit"
      ) {

        await adminService.approveDeposit(
          id
        );

      } else if (
        transaction.type ===
        "withdrawal"
      ) {

        await adminService.approveWithdrawal(
          id
        );

      }


      toast.success(
        "Transaction approved."
      );


      await loadTransactions(
        pagination.page
      );

    } catch (error) {

      console.error(
        "Failed to approve transaction:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Unable to approve transaction."
      );

    } finally {

      setActionId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | REJECT
  |--------------------------------------------------------------------------
  */

  async function handleReject(
    transaction
  ) {

    const id =
      transaction._id;


    if (!id) {
      return;
    }


    const remarks =
      window.prompt(
        "Enter rejection reason:"
      );


    if (
      remarks === null
    ) {
      return;
    }


    try {

      setActionId(id);


      if (
        transaction.type ===
        "deposit"
      ) {

        await adminService.rejectDeposit(
          id,
          remarks
        );

      } else if (
        transaction.type ===
        "withdrawal"
      ) {

        await adminService.rejectWithdrawal(
          id,
          remarks
        );
      }


      toast.success(
        "Transaction rejected."
      );


      await loadTransactions(
        pagination.page
      );

    } catch (error) {

      console.error(
        "Failed to reject transaction:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Unable to reject transaction."
      );

    } finally {

      setActionId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  function handleView(
    transaction
  ) {
    setSelectedTransaction(
      transaction
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE
  |--------------------------------------------------------------------------
  */

  function closeDetails() {
    setSelectedTransaction(
      null
    );
  }


  /*
  |--------------------------------------------------------------------------
  | PAGE
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


    loadTransactions(
      page
    );
  }


  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const pending =
    transactions.filter(
      (transaction) =>
        transaction.status ===
        "pending"
    ).length;


  const deposits =
    transactions.filter(
      (transaction) =>
        transaction.type ===
        "deposit"
    ).length;


  const withdrawals =
    transactions.filter(
      (transaction) =>
        transaction.type ===
        "withdrawal"
    ).length;


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-transactions-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-page-header">

        <div>

          <p className="admin-page-header__eyebrow">
            Finance
          </p>

          <h1>
            Transactions
          </h1>

          <p>
            Manage deposits and
            withdrawals.
          </p>

        </div>

      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="admin-transactions-stats">

        <div className="admin-stat-card">

          <span>
            Total
          </span>

          <strong>
            {
              pagination.total
            }
          </strong>

        </div>


        <div className="admin-stat-card">

          <span>
            Pending
          </span>

          <strong>
            {pending}
          </strong>

        </div>


        <div className="admin-stat-card">

          <span>
            Deposits
          </span>

          <strong>
            {deposits}
          </strong>

        </div>


        <div className="admin-stat-card">

          <span>
            Withdrawals
          </span>

          <strong>
            {withdrawals}
          </strong>

        </div>

      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="admin-transactions-filters">

        <form
          onSubmit={
            handlePhoneSearch
          }
        >

          <input
            type="text"
            value={
              phoneInput
            }
            onChange={(event) =>
              setPhoneInput(
                event.target.value
              )
            }
            placeholder="Search phone number"
          />

          <button
            type="submit"
          >
            Search
          </button>

        </form>


        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value
            )
          }
        >

          <option value="">
            All Types
          </option>

          <option value="deposit">
            Deposit
          </option>

          <option value="withdrawal">
            Withdrawal
          </option>

        </select>


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >

          <option value="">
            All Statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="failed">
            Failed
          </option>

        </select>


        <div>

          <label>
            From
          </label>

          <input
            type="date"
            value={
              fromDate
            }
            onChange={(event) =>
              setFromDate(
                event.target.value
              )
            }
          />

        </div>


        <div>

          <label>
            To
          </label>

          <input
            type="date"
            value={
              toDate
            }
            onChange={(event) =>
              setToDate(
                event.target.value
              )
            }
          />

        </div>


        <button
          type="button"
          onClick={
            clearFilters
          }
        >
          Clear
        </button>


        <button
          type="button"
          onClick={() =>
            loadTransactions(
              pagination.page
            )
          }
          disabled={
            loading
          }
        >
          Refresh
        </button>

      </section>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="admin-table-card">

        {loading ? (

          <div className="admin-table-loading">
            Loading transactions...
          </div>

        ) : transactions.length === 0 ? (

          <div className="admin-table-empty">

            <h3>
              No transactions found
            </h3>

            <p>
              Try changing your
              filters.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Transaction
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Balance After
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  (transaction) => {

                    const isPending =
                      transaction.status ===
                      "pending";

                    const isLoading =
                      actionId ===
                      transaction._id;


                    return (
                      <tr
                        key={
                          transaction._id
                        }
                      >

                        {/* ID */}

                        <td>

                          <strong>
                            {
                              transaction.transactionId ||
                              transaction._id
                            }
                          </strong>

                        </td>


                        {/* USER */}

                        <td>

                          <strong>
                            {
                              transaction
                                .user
                                ?.phone ||
                              "-"
                            }
                          </strong>

                          <small>
                            {
                              transaction
                                .user
                                ?.email ||
                              ""
                            }
                          </small>

                        </td>


                        {/* TYPE */}

                        <td>

                          <span
                            className={`transaction-type transaction-type--${transaction.type}`}
                          >
                            {
                              getTypeLabel(
                                transaction.type
                              )
                            }
                          </span>

                        </td>


                        {/* AMOUNT */}

                        <td>

                          <strong
                            className={
                              transaction.direction ===
                              "credit"
                                ? "transaction-credit"
                                : "transaction-debit"
                            }
                          >

                            {transaction.direction ===
                            "credit"
                              ? "+"
                              : "-"}

                            $
                            {
                              formatMoney(
                                transaction.amount
                              )
                            }

                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`transaction-status transaction-status--${transaction.status}`}
                          >
                            {
                              getStatusLabel(
                                transaction.status
                              )
                            }
                          </span>

                        </td>


                        {/* BALANCE */}

                        <td>

                          $
                          {
                            formatMoney(
                              transaction.balanceAfter
                            )
                          }

                        </td>


                        {/* DATE */}

                        <td>

                          {
                            formatDate(
                              transaction.createdAt
                            )
                          }

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="admin-transaction-actions">

                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  transaction
                                )
                              }
                            >
                              View
                            </button>


                            {isPending && (

                              <>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApprove(
                                      transaction
                                    )
                                  }
                                  disabled={
                                    isLoading
                                  }
                                >
                                  {
                                    isLoading
                                      ? "..."
                                      : "Approve"
                                  }
                                </button>


                                <button
                                  type="button"
                                  className="admin-delete-button"
                                  onClick={() =>
                                    handleReject(
                                      transaction
                                    )
                                  }
                                  disabled={
                                    isLoading
                                  }
                                >
                                  Reject
                                </button>

                              </>

                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {pagination.pages > 1 && (

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
          DETAILS MODAL
      ===================================================== */}

      {selectedTransaction && (

        <div
          className="admin-modal-backdrop"
          onClick={
            closeDetails
          }
        >

          <div
            className="admin-modal admin-transaction-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal__header">

              <div>

                <p>
                  Transaction
                </p>

                <h2>
                  {
                    selectedTransaction
                      .transactionId ||
                    selectedTransaction._id
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeDetails
                }
              >
                ×
              </button>

            </div>


            <div className="admin-transaction-details">

              <section>

                <h3>
                  User
                </h3>

                <div>

                  <span>
                    Phone
                  </span>

                  <strong>
                    {
                      selectedTransaction
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
                      selectedTransaction
                        .user
                        ?.email ||
                      "-"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    VIP
                  </span>

                  <strong>
                    VIP{" "}
                    {
                      selectedTransaction
                        .user
                        ?.vipLevel ||
                      "-"
                    }
                  </strong>

                </div>

              </section>


              {selectedTransaction.type ===
                "withdrawal" && (

                <section className="admin-bank-transfer-section">

                  <div className="admin-bank-transfer-header">

                    <div>

                      <h3>
                        Bank Transfer Information
                      </h3>

                      <p>
                        Use these details to process the withdrawal.
                      </p>

                    </div>

                    <span className="admin-bank-transfer-badge">
                      Withdrawal
                    </span>

                  </div>


                  {selectedTransaction.user?.bankDetails ? (

                    <div className="admin-bank-transfer-details">

                      <div className="admin-bank-detail-row">

                        <span>
                          Bank Name
                        </span>

                        <strong>
                          {
                            selectedTransaction
                              .user
                              ?.bankDetails
                              ?.bankName ||
                            "-"
                          }
                        </strong>

                      </div>


                      <div className="admin-bank-detail-row">

                        <span>
                          Account Holder
                        </span>

                        <strong>
                          {
                            selectedTransaction
                              .user
                              ?.bankDetails
                              ?.holderName ||
                            "-"
                          }
                        </strong>

                      </div>


                      <div className="admin-bank-detail-row">

                        <span>
                          Account Number
                        </span>

                        <strong className="admin-bank-account-number">
                          {
                            selectedTransaction
                              .user
                              ?.bankDetails
                              ?.accountNumber ||
                            "-"
                          }
                        </strong>

                      </div>


                      <div className="admin-bank-detail-row">

                        <span>
                          IFSC / Bank Code
                        </span>

                        <strong>
                          {
                            selectedTransaction
                              .user
                              ?.bankDetails
                              ?.ifscCode ||
                            "-"
                          }
                        </strong>

                      </div>

                    </div>

                  ) : (

                    <div className="admin-bank-no-details">

                      <strong>
                        No bank details available
                      </strong>

                      <p>
                        This user has not provided complete
                        bank information.
                      </p>

                    </div>

                  )}

                </section>

              )}


              <section>

                <h3>
                  Transaction
                </h3>

                <div>

                  <span>
                    Type
                  </span>

                  <strong>
                    {
                      getTypeLabel(
                        selectedTransaction.type
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Amount
                  </span>

                  <strong>
                    $
                    {
                      formatMoney(
                        selectedTransaction.amount
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      getStatusLabel(
                        selectedTransaction.status
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Date
                  </span>

                  <strong>
                    {
                      formatDate(
                        selectedTransaction.createdAt
                      )
                    }
                  </strong>

                </div>

              </section>


              <section>

                <h3>
                  Balance
                </h3>

                <div>

                  <span>
                    Before
                  </span>

                  <strong>
                    $
                    {
                      formatMoney(
                        selectedTransaction.balanceBefore
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    After
                  </span>

                  <strong>
                    $
                    {
                      formatMoney(
                        selectedTransaction.balanceAfter
                      )
                    }
                  </strong>

                </div>

              </section>


              {selectedTransaction.remarks && (

                <section>

                  <h3>
                    Remarks
                  </h3>

                  <p>
                    {
                      selectedTransaction.remarks
                    }
                  </p>

                </section>

              )}


              {selectedTransaction.description && (

                <section>

                  <h3>
                    Description
                  </h3>

                  <p>
                    {
                      selectedTransaction.description
                    }
                  </p>

                </section>

              )}


              {selectedTransaction.status ===
                "pending" && (

                <div className="admin-modal__footer">

                  <button
                    type="button"
                    onClick={() => {
                      closeDetails();

                      handleApprove(
                        selectedTransaction
                      );
                    }}
                  >
                    Approve
                  </button>


                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() => {
                      closeDetails();

                      handleReject(
                        selectedTransaction
                      );
                    }}
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default AdminTransactions;