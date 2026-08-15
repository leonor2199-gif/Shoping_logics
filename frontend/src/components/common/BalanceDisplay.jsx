import { useBalance } from "../../context/BalanceContext";

function BalanceDisplay({
  variant = "header",
}) {
  const { balance, loading } = useBalance();

  if (variant === "card") {
    return (
      <div className="balance-display balance-display--card">
        <span className="balance-display__label">
          Available Balance
        </span>

        <strong className="balance-display__amount">
          {loading
            ? "..."
            : Number(balance).toFixed(2)}
        </strong>
      </div>
    );
  }

  return (
    <div className="balance-display">
      <span className="balance-display__label">
        Balance
      </span>

      <strong className="balance-display__amount">
        {loading
          ? "..."
          : Number(balance).toFixed(2)}
      </strong>
    </div>
  );
}

export default BalanceDisplay;