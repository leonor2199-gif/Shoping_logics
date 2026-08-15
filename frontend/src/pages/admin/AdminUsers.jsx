import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  UserCheck,
  UserX,
  KeyRound,
  Shield,
  CircleDollarSign,
  Eye,
  X,
  Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import adminService from "../../services/adminService";


function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}


function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}


function AdminUsers() {

  // =========================================================
  // USERS
  // =========================================================
  const [bonusModalOpen, setBonusModalOpen] =
  useState(false);

  const [bonusUser, setBonusUser] =
    useState(null);

  const [bonusAmount, setBonusAmount] =
    useState("");

  const [bonusRemarks, setBonusRemarks] =
    useState("");

  const [bonusSubmitting, setBonusSubmitting] =
    useState(false);

  const [bonusConfirming, setBonusConfirming] =
    useState(false);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

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
  // USER DETAILS
  // =========================================================

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [userDetailsLoading, setUserDetailsLoading] =
    useState(false);

  const [userDetailsError, setUserDetailsError] =
    useState("");


  // =========================================================
  // SECURITY MODAL
  // =========================================================

  const [securityModal, setSecurityModal] =
    useState(false);

  const [loginPassword, setLoginPassword] =
    useState("");

  const [
    withdrawalPassword,
    setWithdrawalPassword,
  ] = useState("");

  const [savingSecurity, setSavingSecurity] =
    useState(false);


  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async (
    currentPage = page
  ) => {

    try {

      setLoading(true);

      const response =
        await adminService.getUsers({
          page: currentPage,
          limit: 20,
          search:
            search.trim() || undefined,
          status:
            status || undefined,
        });

      setUsers(
        response.users || []
      );

      setPagination(
        response.pagination || {
          page: currentPage,
          limit: 20,
          total: 0,
          pages: 1,
        }
      );

    } catch (error) {

      console.error(
        "Failed to load users:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load users."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadUsers(page);

  }, [page, status]);


  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {

    event.preventDefault();

    setPage(1);

    loadUsers(1);

  };


  // =========================================================
  // VIEW USER DETAILS
  // =========================================================

  const handleViewUser = async (
    userId
  ) => {

    try {

      setUserDetailsLoading(true);

      setUserDetailsError("");

      setSelectedUser(null);

      const response =
        await adminService.getUserDetails(
          userId
        );

      if (!response?.success) {

        throw new Error(
          response?.message ||
            "Failed to load user details."
        );

      }

      setSelectedUser(
        response.user
      );

    } catch (error) {

      console.error(
        "Failed to load user details:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load user details.";

      setUserDetailsError(
        message
      );

      toast.error(message);

    } finally {

      setUserDetailsLoading(false);

    }
  };


  const closeUserDetails = () => {

    if (userDetailsLoading) {
      return;
    }

    setSelectedUser(null);

    setUserDetailsError("");

  };



  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = async (user) => {
    if (!user?._id) {
      toast.error("Invalid user.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        user.phone || user.email || "this user"
      }? This will delete the user and their related records.`
    );

    if (!confirmed) {
      return;
    }

    const confirmation = window.prompt(
      'Type DELETE to permanently delete this user.'
    );

    if (confirmation !== "DELETE") {
      if (confirmation !== null) {
        toast.error(
          'Deletion cancelled. You must type "DELETE" exactly.'
        );
      }
      return;
    }

    try {
      const response = await adminService.deleteUser(user._id);

      toast.success(
        response.message || "User deleted successfully."
      );

      if (selectedUser?._id === user._id) {
        closeUserDetails();
      }

      const nextPage =
        users.length === 1 && page > 1
          ? page - 1
          : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadUsers(page);
      }
    } catch (error) {
      console.error(
        "Failed to delete user:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };


  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange =
    async (user) => {

      const nextStatus =
        user.status === "active"
          ? "frozen"
          : "active";

      const action =
        nextStatus === "frozen"
          ? "freeze"
          : "activate";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} this account?`
        );

      if (!confirmed) {
        return;
      }

      try {

        await adminService.updateUserStatus(
          user._id,
          nextStatus
        );

        toast.success(
          `User ${action}d successfully.`
        );

        await loadUsers(page);

        // Refresh details if this user
        // is currently open.
        if (
          selectedUser?._id ===
          user._id
        ) {
          await handleViewUser(
            user._id
          );
        }

      } catch (error) {

        console.error(
          "Failed to update user status:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to update user status."
        );

      }
    };

const openBonusModal = (user) => {
  setBonusUser(user);
  setBonusAmount("");
  setBonusRemarks("");
  setBonusConfirming(false);
  setBonusModalOpen(true);
};

const closeBonusModal = () => {
  if (bonusSubmitting) {
    return;
  }

  setBonusModalOpen(false);
  setBonusUser(null);
  setBonusAmount("");
  setBonusRemarks("");
  setBonusConfirming(false);
};

const handleBonusAmountChange = (event) => {
  const value = event.target.value;

  if (!/^\d*\.?\d{0,2}$/.test(value)) {
    return;
  }

  setBonusAmount(value);
};

const handleSubmitBonus = async (event) => {
  event.preventDefault();

  if (!bonusUser) {
    return;
  }

  const amount = Number(bonusAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    toast.error("Enter a valid bonus amount.");
    return;
  }

  if (amount > 10_000_000) {
    toast.error("Bonus amount is too large.");
    return;
  }

  const decimalPlaces = bonusAmount.includes(".")
    ? bonusAmount.split(".")[1].length
    : 0;

  if (decimalPlaces > 2) {
    toast.error(
      "Bonus amount can have at most 2 decimal places."
    );
    return;
  }

  const remarks = bonusRemarks.trim();

  if (remarks.length > 1000) {
    toast.error(
      "Remarks cannot exceed 1000 characters."
    );
    return;
  }

  setBonusConfirming(true);
};

const handleConfirmBonus = async () => {
  if (!bonusUser || bonusSubmitting) {
    return;
  }

  const amount = Number(bonusAmount);
  const remarks = bonusRemarks.trim();

  try {
    setBonusSubmitting(true);

    const response =
      await adminService.addUserBonus(
        bonusUser._id,
        amount,
        remarks
      );

    toast.success(
      response.message ||
        `Bonus of $${amount.toFixed(
          2
        )} added successfully.`
    );

    setBonusConfirming(false);
    closeBonusModal();

    await loadUsers(page);

    if (selectedUser?._id === bonusUser._id) {
      await handleViewUser(bonusUser._id);
    }
  } catch (error) {
    console.error(
      "Failed to add bonus:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Unable to add bonus."
    );
  } finally {
    setBonusSubmitting(false);
  }
};

  // =========================================================
  // VIP
  // =========================================================

  const handleVipChange =
    async (user) => {

      const input =
        window.prompt(
          "Enter the new VIP level:",
          String(
            user.vipLevel || 1
          )
        );

      if (input === null) {
        return;
      }

      const vipLevel =
        Number(input);

      if (
        !Number.isInteger(
          vipLevel
        ) ||
        vipLevel < 1
      ) {

        toast.error(
          "VIP level must be a positive integer."
        );

        return;
      }

      try {

        await adminService.updateUserVip(
          user._id,
          vipLevel
        );

        toast.success(
          "VIP level updated."
        );

        await loadUsers(page);

        if (
          selectedUser?._id ===
          user._id
        ) {
          await handleViewUser(
            user._id
          );
        }

      } catch (error) {

        console.error(
          "Failed to update VIP:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to update VIP level."
        );

      }
    };


  // =========================================================
  // SECURITY MODAL
  // =========================================================

  const openSecurityModal =
    (user) => {

      setSelectedUser(user);

      setLoginPassword("");

      setWithdrawalPassword("");

      setSecurityModal(true);

    };


  const closeSecurityModal =
    () => {

      if (savingSecurity) {
        return;
      }

      setSecurityModal(false);

      setSelectedUser(null);

      setLoginPassword("");

      setWithdrawalPassword("");

    };


  const handleSecuritySubmit =
    async (event) => {

      event.preventDefault();

      if (
        !loginPassword &&
        !withdrawalPassword
      ) {

        toast.error(
          "Enter at least one new password."
        );

        return;
      }


      // Login password:
      // lowercase + number
      // minimum 6 characters

      if (
        loginPassword &&
        !/^(?=.*[a-z])(?=.*\d).{6,}$/.test(
          loginPassword
        )
      ) {

        toast.error(
          "Login password must contain lowercase letters and numbers and be at least 6 characters."
        );

        return;
      }


      // Withdrawal password:
      // numbers only
      // minimum 6 digits

      if (
        withdrawalPassword &&
        !/^\d{6,}$/.test(
          withdrawalPassword
        )
      ) {

        toast.error(
          "Withdrawal password must contain at least 6 digits."
        );

        return;
      }


      if (
        loginPassword &&
        withdrawalPassword &&
        loginPassword ===
          withdrawalPassword
      ) {

        toast.error(
          "Login and withdrawal passwords must be different."
        );

        return;
      }


      try {

        setSavingSecurity(
          true
        );

        const payload = {};

        if (loginPassword) {

          payload.loginPassword =
            loginPassword;

        }

        if (withdrawalPassword) {

          payload.withdrawalPassword =
            withdrawalPassword;

        }


        await adminService.updateUserSecurity(
          selectedUser._id,
          payload
        );

        toast.success(
          "User password updated successfully."
        );

        closeSecurityModal();

      } catch (error) {

        console.error(
          "Failed to update security:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to update password."
        );

      } finally {

        setSavingSecurity(
          false
        );

      }
    };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-users">


      {/* =====================================================
          PAGE HEADING
      ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <h1>
            Users
          </h1>

          <p>
            Manage user accounts, VIP levels
            and security.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh"
          onClick={() =>
            loadUsers(page)
          }
          disabled={loading}
        >
          Refresh
        </button>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="admin-users-toolbar">

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
            placeholder="Search phone or email..."
          />

          <button
            type="submit"
          >
            Search
          </button>

        </form>


        <select
          value={status}
          onChange={(event) => {

            setStatus(
              event.target.value
            );

            setPage(1);

          }}
        >

          <option value="">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="frozen">
            Frozen
          </option>

        </select>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-table-card">


        <div className="admin-table-card__header">

          <div>

            <strong>
              User Accounts
            </strong>

            <span>
              {pagination.total} users
            </span>

          </div>

        </div>


        {loading ? (

          <div className="admin-table-loading">
            Loading users...
          </div>

        ) : users.length === 0 ? (

          <div className="admin-table-empty">

            <UsersIcon />

            <h3>
              No users found
            </h3>

            <p>
              Try changing your search or
              filters.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    VIP
                  </th>

                  <th>
                    Balance
                  </th>

                  <th>
                    Deposited
                  </th>

                  <th>
                    Withdrawn
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map(
                  (user) => (

                    <tr
                      key={
                        user._id
                      }
                    >


                      {/* USER */}

                      <td>

                        <div className="admin-user-cell">

                          <div className="admin-user-avatar">

                            {user.phone
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}

                          </div>


                          <div>

                            <strong>
                              {
                                user.phone
                              }
                            </strong>

                            <span>
                              {
                                user.email ||
                                "No email"
                              }
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* VIP */}

                      <td>

                        <span className="admin-vip">

                          VIP{" "}
                          {
                            user.vipLevel ||
                            1
                          }

                        </span>

                      </td>


                      {/* BALANCE */}

                      <td>

                        <strong>

                          $
                          {formatMoney(
                            user.balance
                          )}

                        </strong>

                      </td>


                      {/* DEPOSITED */}

                      <td>

                        $
                        {formatMoney(
                          user.totalDeposited
                        )}

                      </td>


                      {/* WITHDRAWN */}

                      <td>

                        $
                        {formatMoney(
                          user.totalWithdrawn
                        )}

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`admin-status admin-status--${user.status}`}
                        >
                          {
                            user.status
                          }
                        </span>

                      </td>


                      {/* JOINED */}

                      <td>

                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "-"}

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="admin-user-actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            title="View user details"
                            onClick={() =>
                              handleViewUser(
                                user._id
                              )
                            }
                          >

                            <Eye
                              size={15}
                            />

                          </button>


                          {/* FREEZE / ACTIVATE */}

                          <button
                            type="button"
                            title={
                              user.status ===
                              "active"
                                ? "Freeze user"
                                : "Activate user"
                            }
                            onClick={() =>
                              handleStatusChange(
                                user
                              )
                            }
                          >

                            {user.status ===
                            "active" ? (

                              <UserX
                                size={15}
                              />

                            ) : (

                              <UserCheck
                                size={15}
                              />

                            )}

                          </button>

                          <button
                              type="button"
                              title="Add bonus"
                              onClick={() =>
                                openBonusModal(user)
                              }
                              disabled={bonusSubmitting}
                            >
                              <CircleDollarSign
                                size={15}
                              />
                            </button>


                          {/* VIP */}

                          <button
                            type="button"
                            title="Change VIP"
                            onClick={() =>
                              handleVipChange(
                                user
                              )
                            }
                          >

                            <Shield
                              size={15}
                            />

                          </button>


                          {/* PASSWORD */}

                          <button
                            type="button"
                            title="Change passwords"
                            onClick={() =>
                              openSecurityModal(
                                user
                              )
                            }
                          >

                            <KeyRound
                              size={15}
                            />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            title="Delete user"
                            onClick={() =>
                              handleDeleteUser(
                                user
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
          users.length > 0 && (

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


      {/* =====================================================
          ADD BONUS MODAL
      ===================================================== */}

      {bonusModalOpen && bonusUser && (
        <div
          className="admin-modal-backdrop"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !bonusSubmitting
            ) {
              closeBonusModal();
            }
          }}
        >
          <div
            className="admin-modal admin-bonus-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal__header">
              <div>
                <h2>
                  {bonusConfirming
                    ? "Confirm Bonus"
                    : "Add Bonus"}
                </h2>

                <p>
                  {bonusUser.phone ||
                    bonusUser.email ||
                    "User"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBonusModal}
                disabled={bonusSubmitting}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {!bonusConfirming ? (
              <form
                onSubmit={handleSubmitBonus}
              >
                <div className="admin-bonus-user">
                  <div>
                    <span>Phone</span>
                    <strong>
                      {bonusUser.phone || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Current Balance</span>
                    <strong>
                      ${formatMoney(
                        bonusUser.balance
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>VIP Level</span>
                    <strong>
                      VIP {bonusUser.vipLevel || 1}
                    </strong>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="bonus-amount">
                    Bonus Amount
                  </label>

                  <div className="admin-bonus-amount-input">
                    <span>$</span>

                    <input
                      id="bonus-amount"
                      type="text"
                      inputMode="decimal"
                      value={bonusAmount}
                      onChange={
                        handleBonusAmountChange
                      }
                      placeholder="0.00"
                      autoFocus
                      disabled={bonusSubmitting}
                    />
                  </div>

                  <small>
                    Maximum $10,000,000.00.
                    Up to 2 decimal places.
                  </small>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="bonus-remarks">
                    Reason / Remarks
                  </label>

                  <textarea
                    id="bonus-remarks"
                    value={bonusRemarks}
                    onChange={(event) =>
                      setBonusRemarks(
                        event.target.value
                      )
                    }
                    placeholder="Example: Promotional bonus"
                    maxLength={1000}
                    rows={4}
                    disabled={bonusSubmitting}
                  />

                  <small>
                    {bonusRemarks.length}/1000
                  </small>
                </div>

                {Number(bonusAmount) > 0 && (
                  <div className="admin-bonus-preview">
                    <div>
                      <span>Current Balance</span>
                      <strong>
                        ${formatMoney(
                          bonusUser.balance
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Bonus</span>
                      <strong>
                        +$
                        {Number(
                          bonusAmount
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>New Balance</span>
                      <strong>
                        $
                        {formatMoney(
                          Number(
                            bonusUser.balance || 0
                          ) +
                            Number(
                              bonusAmount
                            ) *
                              100
                        )}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="admin-bonus-warning">
                  <strong>
                    Balance adjustment
                  </strong>

                  <p>
                    This action immediately
                    increases the user's available
                    balance and creates an adjustment
                    transaction for audit purposes.
                  </p>
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    onClick={closeBonusModal}
                    disabled={bonusSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-modal-primary"
                    disabled={
                      bonusSubmitting ||
                      !bonusAmount ||
                      Number(bonusAmount) <= 0
                    }
                  >
                    Review Bonus
                  </button>
                </div>
              </form>
            ) : (
              <div className="admin-bonus-confirmation">
                <div className="admin-bonus-user">
                  <div>
                    <span>User</span>
                    <strong>
                      {bonusUser.phone ||
                        bonusUser.email ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Current Balance</span>
                    <strong>
                      ${formatMoney(
                        bonusUser.balance
                      )}
                    </strong>
                  </div>
                </div>

                <div className="admin-bonus-confirm-card">
                  <div>
                    <span>Bonus Amount</span>
                    <strong>
                      +$
                      {Number(
                        bonusAmount
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>New Balance</span>
                    <strong>
                      $
                      {formatMoney(
                        Number(
                          bonusUser.balance || 0
                        ) +
                          Number(
                            bonusAmount
                          ) *
                            100
                      )}
                    </strong>
                  </div>
                </div>

                <div className="admin-bonus-confirm-remarks">
                  <span>Reason</span>
                  <p>
                    {bonusRemarks.trim() ||
                      "No reason provided"}
                  </p>
                </div>

                <div className="admin-bonus-warning">
                  <strong>
                    Confirm this balance change
                  </strong>

                  <p>
                    You are about to add $
                    {Number(
                      bonusAmount
                    ).toFixed(2)}
                    {" "}to this user's account.
                    This action cannot be undone
                    from the frontend.
                  </p>
                </div>

                <div className="admin-modal__actions">
                  <button
                    type="button"
                    onClick={() =>
                      setBonusConfirming(false)
                    }
                    disabled={bonusSubmitting}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="admin-modal-primary"
                    onClick={
                      handleConfirmBonus
                    }
                    disabled={bonusSubmitting}
                  >
                    {bonusSubmitting
                      ? "Adding Bonus..."
                      : `Confirm & Add $${Number(
                          bonusAmount
                        ).toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {(selectedUser ||
        userDetailsLoading ||
        userDetailsError) &&
        !securityModal && (

          <div
            className="admin-modal-backdrop"
            onClick={
              closeUserDetails
            }
          >

            <div
              className="admin-modal admin-user-details-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >


              {/* HEADER */}

              <div className="admin-modal__header">

                <div>

                  <h2>
                    User Details
                  </h2>

                  {selectedUser && (

                    <p>
                      {
                        selectedUser.phone
                      }
                    </p>

                  )}

                </div>


                <button
                  type="button"
                  onClick={
                    closeUserDetails
                  }
                  disabled={
                    userDetailsLoading
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              {/* LOADING */}

              {userDetailsLoading && (

                <div className="admin-table-loading">

                  Loading user details...

                </div>

              )}


              {/* ERROR */}

              {!userDetailsLoading &&
                userDetailsError && (

                  <div className="admin-table-empty">

                    <h3>
                      Unable to load user
                    </h3>

                    <p>
                      {
                        userDetailsError
                      }
                    </p>

                    <button
                      type="button"
                      onClick={
                        closeUserDetails
                      }
                    >
                      Close
                    </button>

                  </div>

                )}


              {/* DETAILS */}

              {!userDetailsLoading &&
                !userDetailsError &&
                selectedUser && (

                  <div className="admin-user-details">


                    {/* PROFILE */}

                    <section className="admin-user-details-section">

                      <h3>
                        Profile
                      </h3>


                      <div className="admin-user-details-grid">

                        <div>

                          <span>
                            Phone
                          </span>

                          <strong>
                            {
                              selectedUser.phone ||
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
                              selectedUser.email ||
                              "No email"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Status
                          </span>

                          <strong>
                            {
                              selectedUser.status ||
                              "-"
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
                              selectedUser.vipLevel ||
                              1
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
                                selectedUser.createdAt
                              )
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Last Login
                          </span>

                          <strong>
                            {
                              selectedUser.lastLoginAt
                                ? formatDate(
                                    selectedUser.lastLoginAt
                                  )
                                : "Never"
                            }
                          </strong>

                        </div>

                      </div>

                    </section>


                    {/* FINANCIAL */}

                    <section className="admin-user-details-section">

                      <h3>
                        Financial Summary
                      </h3>


                      <div className="admin-user-details-grid">

                        <div>

                          <span>
                            Balance
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.balance
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Total Deposited
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.totalDeposited
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Total Withdrawn
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.totalWithdrawn
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Pending Withdrawal
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.pendingWithdrawal
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Total Bonus
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.totalEarned
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Today's Bonus
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.todayEarned
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Monthly Bonus
                          </span>

                          <strong>
                            $
                            {formatMoney(
                              selectedUser.monthlyEarned
                            )}
                          </strong>

                        </div>

                      </div>

                    </section>


                    {/* BANK */}

                    <section className="admin-user-details-section">

                      <h3>
                        Bank Details
                      </h3>


                      {selectedUser.bankDetails ? (

                        <div className="admin-user-details-grid">


                          <div>

                            <span>
                              Bank Name
                            </span>

                            <strong>
                              {
                                selectedUser
                                  .bankDetails
                                  ?.bankName ||
                                "-"
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Account Number
                            </span>

                            <strong>
                              {
                                selectedUser
                                  .bankDetails
                                  ?.accountNumber ||
                                "-"
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Holder Name
                            </span>

                            <strong>
                              {
                                selectedUser
                                  .bankDetails
                                  ?.holderName ||
                                "-"
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              IFSC Code
                            </span>

                            <strong>
                              {
                                selectedUser
                                  .bankDetails
                                  ?.ifscCode ||
                                "-"
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Branch
                            </span>

                            <strong>
                              {
                                selectedUser
                                  .bankDetails
                                  ?.branch ||
                                "-"
                              }
                            </strong>

                          </div>

                        </div>

                      ) : (

                        <p>
                          No bank details added.
                        </p>

                      )}

                    </section>


                    {/* ACTIONS */}

                    <div className="admin-modal__actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            selectedUser
                          )
                        }
                      >
                        {
                          selectedUser.status ===
                          "active"
                            ? "Freeze User"
                            : "Activate User"
                        }
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleVipChange(
                            selectedUser
                          )
                        }
                      >
                        Change VIP
                      </button>


                      <button
                        type="button"
                        className="admin-modal-primary"
                        onClick={() => {

                          const user =
                            selectedUser;

                          closeUserDetails();

                          openSecurityModal(
                            user
                          );

                        }}
                      >
                        Change Password
                      </button>



                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteUser(
                            selectedUser
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                        Delete User
                      </button>

                    </div>

                  </div>

                )}

            </div>

          </div>

        )}


      {/* =====================================================
          SECURITY MODAL
      ===================================================== */}

      {securityModal &&
        selectedUser && (

          <div
            className="admin-modal-backdrop"
            onClick={
              closeSecurityModal
            }
          >

           <div
            className="admin-modal"
            onClick={(event) =>
            event.stopPropagation()
            }
           >

              {/* HEADER */}

              <div className="admin-modal__header">

                <div>

                  <h2>
                    Change Passwords
                  </h2>

                  <p>
                    {
                      selectedUser.phone
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeSecurityModal
                  }
                  disabled={
                    savingSecurity
                  }
                >
                  ×
                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={
                  handleSecuritySubmit
                }
              >


                {/* LOGIN PASSWORD */}

                <div className="admin-form-group">

                  <label>
                    New Login Password
                  </label>

                  <input
                    type="text"
                    value={
                      loginPassword
                    }
                    onChange={(event) =>
                      setLoginPassword(
                        event.target.value
                      )
                    }
                    placeholder="Example: abc123"
                    autoComplete="off"
                  />

                  <small>
                    Minimum 6 characters with
                    lowercase letters and numbers.
                  </small>

                </div>


                {/* WITHDRAWAL PASSWORD */}

                <div className="admin-form-group">

                  <label>
                    New Withdrawal Password
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      withdrawalPassword
                    }
                    onChange={(event) => {

                      const value =
                        event.target.value;

                      if (
                        /^\d*$/.test(
                          value
                        )
                      ) {

                        setWithdrawalPassword(
                          value
                        );

                      }

                    }}
                    placeholder="Example: 123456"
                    autoComplete="off"
                  />

                  <small>
                    Minimum 6 digits.
                  </small>

                </div>


                <div className="admin-security-warning">

                  Leave a field empty if you
                  don't want to change that
                  password.

                </div>


                {/* ACTIONS */}

                <div className="admin-modal__actions">

                  <button
                    type="button"
                    onClick={
                      closeSecurityModal
                    }
                    disabled={
                      savingSecurity
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="admin-modal-primary"
                    disabled={
                      savingSecurity
                    }
                  >

                    {savingSecurity
                      ? "Saving..."
                      : "Save Password"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>

  );
}


function UsersIcon() {

  return (

    <div className="admin-empty-icon">
      👥
    </div>

  );

}


export default AdminUsers;