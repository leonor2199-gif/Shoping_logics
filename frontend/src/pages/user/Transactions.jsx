import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import financeService from "../../services/financeService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString();
}

function getTypeLabel(type) {
  const labels = {
    purchase: "Purchase",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    refund: "Refund",
    adjustment: "Adjustment",
  };

  return labels[type] || type;
}

function getTypeIcon(type) {
  const icons = {
    purchase: "🛒",
    deposit: "↓",
    withdrawal: "↑",
    refund: "↩",
    adjustment: "⚙",
  };

  return icons[type] || "•";
}

function Transactions() {
  const [transactions, setTransactions] =
    useState([]);

  const [balance, setBalance] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    });

  const loadTransactions =
    async (currentPage = 1) => {
      try {
        setLoading(true);

        const [
          balanceResponse,
          transactionResponse,
        ] = await Promise.all([
          financeService.getBalance(),

          financeService.getMyTransactions(
            {
              page: currentPage,
              limit: 10,
            }
          ),
        ]);

        setBalance(
          balanceResponse
        );

        setTransactions(
          transactionResponse.transactions ||
            []
        );

        setPagination(
          transactionResponse.pagination || {
            page: currentPage,
            limit: 10,
            total: 0,
            pages: 1,
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
    };

  useEffect(() => {
    loadTransactions(page);
  }, [page]);

  const handlePrevious =
    () => {
      if (page > 1) {
        setPage(
          (current) =>
            current - 1
        );
      }
    };

  const handleNext =
    () => {
      if (
        page <
        pagination.pages
      ) {
        setPage(
          (current) =>
            current + 1
        );
      }
    };

  return (
    <div className="transactions-page">

      {/* Header */}

      <section className="transactions-header">
        <div>
          <p className="transactions-eyebrow">
            Account Activity
          </p>

          <h1>
            Transactions
          </h1>

          <p>
            View your complete financial
            activity.
          </p>
        </div>

        <div className="transactions-balance">
          <span>
            Current Balance
          </span>

          <strong>
            {formatMoney(
              balance?.balance
            )}
          </strong>
        </div>
      </section>

      {/* Quick actions */}

      <section className="transaction-actions">

        <Link
          to="/deposit"
          className="transaction-action"
        >
          <span className="transaction-action__icon">
            ↓
          </span>

          <div>
            <strong>
              Deposit
            </strong>

            <p>
              Add funds
            </p>
          </div>
        </Link>

        <Link
          to="/withdraw"
          className="transaction-action"
        >
          <span className="transaction-action__icon">
            ↑
          </span>

          <div>
            <strong>
              Withdraw
            </strong>

            <p>
              Withdraw funds
            </p>
          </div>
        </Link>
      </section>

      {/* Transactions */}

      <section className="transactions-card">

        <div className="transactions-card__header">

          <div>
            <h2>
              Transaction History
            </h2>

            <p>
              {pagination.total} total
              transactions
            </p>
          </div>

          <button
            type="button"
            className="transactions-refresh"
            onClick={() =>
              loadTransactions(page)
            }
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (
          <div className="transactions-loading">
            <div className="transaction-skeleton" />
            <div className="transaction-skeleton" />
            <div className="transaction-skeleton" />
            <div className="transaction-skeleton" />
          </div>
        ) : transactions.length ===
          0 ? (
          <div className="transactions-empty">

            <div className="transactions-empty__icon">
              💳
            </div>

            <h3>
              No transactions yet
            </h3>

            <p>
              Your financial activity will
              appear here.
            </p>

            <Link
              to="/deposit"
              className="btn btn-primary"
            >
              Make a Deposit
            </Link>

          </div>
        ) : (
          <>

            <div className="transaction-list">

              {transactions.map(
                (transaction) => {

                  const isCredit =
                    transaction.direction ===
                    "credit";

                  return (
                    <div
                      key={
                        transaction._id
                      }
                      className="transaction-row"
                    >

                      <div
                        className={`transaction-icon transaction-icon--${
                          isCredit
                            ? "credit"
                            : "debit"
                        }`}
                      >
                        {getTypeIcon(
                          transaction.type
                        )}
                      </div>

                      <div className="transaction-main">

                        <div className="transaction-title-row">

                          <strong>
                            {getTypeLabel(
                              transaction.type
                            )}
                          </strong>

                          <span
                            className={`transaction-status transaction-status--${transaction.status}`}
                          >
                            {
                              transaction.status
                            }
                          </span>

                        </div>

                        <p>
                          {
                            transaction.description
                          }
                        </p>

                        {transaction.remarks && (
                          <small>
                            {
                              transaction.remarks
                            }
                          </small>
                        )}

                        <span className="transaction-date">
                          {formatDate(
                            transaction.createdAt
                          )}
                        </span>

                      </div>

                      <div className="transaction-amount">

                        <strong
                          className={
                            isCredit
                              ? "amount-credit"
                              : "amount-debit"
                          }
                        >
                          {isCredit
                            ? "+"
                            : "-"}
                          {formatMoney(
                            transaction.amount
                          )}
                        </strong>

                        <span>
                          Balance:{" "}
                          {formatMoney(
                            transaction.balanceAfter
                          )}
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* Pagination */}

            <div className="transactions-pagination">

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  loading ||
                  page <= 1
                }
              >
                ← Previous
              </button>

              <span>
                Page{" "}
                <strong>
                  {pagination.page}
                </strong>{" "}
                of{" "}
                <strong>
                  {pagination.pages}
                </strong>
              </span>

              <button
                type="button"
                onClick={
                  handleNext
                }
                disabled={
                  loading ||
                  page >=
                    pagination.pages
                }
              >
                Next →
              </button>

            </div>

          </>
        )}

      </section>

    </div>
  );
}

export default Transactions;