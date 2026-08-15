import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import bankConfigService from "../../services/bankConfigService";

function AdminBankAccounts() {

  const [
    banks,
    setBanks,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingBank,
    setEditingBank,
  ] = useState(null);


  const emptyForm = {
    bankName: "",
    accountNumber: "",
    holderName: "",
    ifscCode: "",
    branch: "",
    paymentInstructions: "",
    qrCodeImage: "",
    isActive: true,
    displayOrder: 0,
  };


  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );


  /*
  |--------------------------------------------------------------------------
  | LOAD BANKS
  |--------------------------------------------------------------------------
  */

  const loadBanks =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const response =
            await bankConfigService.getAllBanks();

          setBanks(
            response.banks || []
          );

        } catch (error) {

          console.error(
            "Failed to load bank accounts:",
            error
          );

          toast.error(
            error.response?.data?.message ||
            "Unable to load bank accounts."
          );

        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadBanks();
  }, [
    loadBanks,
  ]);


  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE
  |--------------------------------------------------------------------------
  */

  function openCreate() {
    setEditingBank(null);

    setForm(
      emptyForm
    );

    setModalOpen(true);
  }


  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT
  |--------------------------------------------------------------------------
  */

  function openEdit(bank) {
    setEditingBank(
      bank
    );

    setForm({
      bankName:
        bank.bankName || "",

      accountNumber:
        bank.accountNumber || "",

      holderName:
        bank.holderName || "",

      ifscCode:
        bank.ifscCode || "",

      branch:
        bank.branch || "",

      paymentInstructions:
        bank.paymentInstructions || "",

      qrCodeImage:
        bank.qrCodeImage || "",

      isActive:
        bank.isActive !== false,

      displayOrder:
        bank.displayOrder || 0,
    });

    setModalOpen(true);
  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingBank(null);

    setForm(
      emptyForm
    );
  }


  /*
  |--------------------------------------------------------------------------
  | INPUT
  |--------------------------------------------------------------------------
  */

  function handleChange(
    event
  ) {
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
  }


  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (
      !form.bankName.trim()
    ) {
      toast.error(
        "Bank name is required."
      );

      return;
    }


    if (
      !form.accountNumber.trim()
    ) {
      toast.error(
        "Account number is required."
      );

      return;
    }


    if (
      !form.holderName.trim()
    ) {
      toast.error(
        "Account holder name is required."
      );

      return;
    }


    const payload = {
      bankName:
        form.bankName.trim(),

      accountNumber:
        form.accountNumber.trim(),

      holderName:
        form.holderName.trim(),

      ifscCode:
        form.ifscCode.trim(),

      branch:
        form.branch.trim(),

      paymentInstructions:
        form.paymentInstructions.trim(),

      qrCodeImage:
        form.qrCodeImage.trim(),

      isActive:
        form.isActive,

      displayOrder:
        Number(
          form.displayOrder
        ) || 0,
    };


    try {

      setSaving(true);


      if (editingBank) {

        await bankConfigService.updateBank(
          editingBank._id,
          payload
        );

        toast.success(
          "Bank account updated."
        );

      } else {

        await bankConfigService.createBank(
          payload
        );

        toast.success(
          "Bank account added."
        );
      }


      closeModal();

      await loadBanks();

    } catch (error) {

      console.error(
        "Failed to save bank account:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to save bank account."
      );

    } finally {
      setSaving(false);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  async function handleToggle(
    bank
  ) {
    try {

      await bankConfigService.updateBank(
        bank._id,
        {
          isActive:
            !bank.isActive,
        }
      );


      toast.success(
        bank.isActive
          ? "Bank account disabled."
          : "Bank account activated."
      );


      await loadBanks();

    } catch (error) {

      console.error(
        "Failed to update bank status:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to update bank status."
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    bank
  ) {
    const confirmed =
      window.confirm(
        `Delete ${bank.bankName} account ${bank.accountNumber}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(
        bank._id
      );


      await bankConfigService.deleteBank(
        bank._id
      );


      toast.success(
        "Bank account deleted."
      );


      await loadBanks();

    } catch (error) {

      console.error(
        "Failed to delete bank account:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to delete bank account."
      );

    } finally {
      setDeletingId(null);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-bank-accounts">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <p>
            Deposit Management
          </p>

          <h1>
            Bank Accounts
          </h1>

          <span>
            Manage payment accounts
            available to users.
          </span>

        </div>


        <div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={
              openCreate
            }
          >
            + Add Bank Account
          </button>


          <button
            type="button"
            className="admin-refresh"
            onClick={
              loadBanks
            }
            disabled={
              loading
            }
          >
            Refresh
          </button>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-table-card">

        <div className="admin-table-card__header">

          <div>

            <strong>
              Deposit Accounts
            </strong>

            <span>
              {
                banks.length
              }{" "}
              accounts
            </span>

          </div>

        </div>


        {loading ? (

          <div className="admin-table-loading">
            Loading bank accounts...
          </div>

        ) : banks.length === 0 ? (

          <div className="admin-table-empty">

            <div className="admin-empty-icon">
              🏦
            </div>

            <h3>
              No bank accounts
            </h3>

            <p>
              Add a deposit account
              for users to see.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={
                openCreate
              }
            >
              Add First Account
            </button>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Bank
                  </th>

                  <th>
                    Account
                  </th>

                  <th>
                    Holder
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {banks.map(
                  (bank) => (

                    <tr
                      key={
                        bank._id
                      }
                    >

                      <td>

                        <strong>
                          {
                            bank.bankName
                          }
                        </strong>

                        {bank.branch && (
                          <small>
                            {
                              bank.branch
                            }
                          </small>
                        )}

                      </td>


                      <td>

                        <strong>
                          {
                            bank.accountNumber
                          }
                        </strong>

                        {bank.ifscCode && (
                          <small>
                            IFSC:{" "}
                            {
                              bank.ifscCode
                            }
                          </small>
                        )}

                      </td>


                      <td>
                        {
                          bank.holderName
                        }
                      </td>


                      <td>
                        {
                          bank.displayOrder
                        }
                      </td>


                      <td>

                        <span
                          className={`admin-status ${
                            bank.isActive
                              ? "admin-status--active"
                              : "admin-status--frozen"
                          }`}
                        >
                          {
                            bank.isActive
                              ? "Active"
                              : "Disabled"
                          }
                        </span>

                      </td>


                      <td>

                        <div className="admin-user-actions">

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                bank
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                bank
                              )
                            }
                          >
                            {
                              bank.isActive
                                ? "Disable"
                                : "Enable"
                            }
                          </button>


                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() =>
                              handleDelete(
                                bank
                              )
                            }
                            disabled={
                              deletingId ===
                              bank._id
                            }
                          >
                            {
                              deletingId ===
                              bank._id
                                ? "Deleting..."
                                : "Delete"
                            }
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

      </div>


      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (

        <div
          className="admin-modal-backdrop"
          onClick={
            closeModal
          }
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal__header">

              <div>

                <h2>
                  {
                    editingBank
                      ? "Edit Bank Account"
                      : "Add Bank Account"
                  }
                </h2>

                <p>
                  This account will be
                  available for deposits
                  when active.
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
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* BANK */}

              <div className="admin-form-group">

                <label>
                  Bank / Payment Method
                </label>

                <input
                  name="bankName"
                  value={
                    form.bankName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="KBZ Pay"
                />

              </div>


              {/* ACCOUNT NUMBER */}

              <div className="admin-form-group">

                <label>
                  Account Number
                </label>

                <input
                  name="accountNumber"
                  value={
                    form.accountNumber
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="09xxxxxxxxx"
                />

              </div>


              {/* HOLDER */}

              <div className="admin-form-group">

                <label>
                  Account Holder Name
                </label>

                <input
                  name="holderName"
                  value={
                    form.holderName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="John Doe"
                />

              </div>


              {/* IFSC */}

              <div className="admin-form-group">

                <label>
                  IFSC / Bank Code
                </label>

                <input
                  name="ifscCode"
                  value={
                    form.ifscCode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional"
                />

              </div>


              {/* BRANCH */}

              <div className="admin-form-group">

                <label>
                  Branch
                </label>

                <input
                  name="branch"
                  value={
                    form.branch
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional"
                />

              </div>


              {/* QR */}

              <div className="admin-form-group">

                <label>
                  QR Code Image URL
                </label>

                <input
                  name="qrCodeImage"
                  value={
                    form.qrCodeImage
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />

                <small>
                  Leave empty if this
                  account does not use
                  a QR code.
                </small>

              </div>


              {/* INSTRUCTIONS */}

              <div className="admin-form-group">

                <label>
                  Payment Instructions
                </label>

                <textarea
                  name="paymentInstructions"
                  value={
                    form.paymentInstructions
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Send the exact amount and keep your payment reference."
                />

              </div>


              {/* DISPLAY ORDER */}

              <div className="admin-form-group">

                <label>
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  name="displayOrder"
                  value={
                    form.displayOrder
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* ACTIVE */}

              <div className="admin-form-group">

                <label>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      form.isActive
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {" "}
                  Active — users can
                  deposit to this account

                </label>

              </div>


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
                  {
                    saving
                      ? "Saving..."
                      : editingBank
                        ? "Save Changes"
                        : "Add Account"
                  }
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default AdminBankAccounts;