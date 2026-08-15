import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  UserCheck,
  ShoppingBag,
  Clock3,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import toast from "react-hot-toast";

import adminService from "../../services/adminService";

function formatMoney(value) {
  return (
    Number(value || 0) / 100
  ).toFixed(2);
}

function StatCard({
  title,
  value,
  icon: Icon,
  type,
}) {
  return (
    <div className="admin-stat-card">

      <div className="admin-stat-card__top">

        <span>
          {title}
        </span>

        <div
          className={`admin-stat-icon admin-stat-icon--${type}`}
        >
          <Icon size={19} />
        </div>

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);

      const response =
        await adminService.getDashboardStats();

      setStats(
        response.stats
      );
    } catch (error) {
      console.error(
        "Failed to load admin stats:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="admin-page-heading">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Overview of your store activity.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={loadStats}
        >
          Refresh
        </button>

      </div>

      <div className="admin-stats-grid">

        <StatCard
          title="Total Users"
          value={
            stats?.users || 0
          }
          icon={Users}
          type="blue"
        />

        <StatCard
          title="Active Users"
          value={
            stats?.activeUsers || 0
          }
          icon={UserCheck}
          type="green"
        />

        <StatCard
          title="Total Orders"
          value={
            stats?.orders || 0
          }
          icon={ShoppingBag}
          type="purple"
        />

        <StatCard
          title="Pending Orders"
          value={
            stats?.pendingOrders || 0
          }
          icon={Clock3}
          type="orange"
        />

        <StatCard
          title="Completed Deposits"
          value={`$${formatMoney(
            stats?.completedDeposits
          )}`}
          icon={ArrowDownToLine}
          type="green"
        />

        <StatCard
          title="Completed Withdrawals"
          value={`$${formatMoney(
            stats?.completedWithdrawals
          )}`}
          icon={ArrowUpFromLine}
          type="red"
        />

      </div>

    </div>
  );
}

export default AdminDashboard;