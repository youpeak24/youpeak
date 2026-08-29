import React, { useEffect, useState } from "react";
import Title from "../../extra/Title";
import axios from "axios";

export default function ReferralManagement() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    fetchLogs();
  }, []);

  const fetchLeaderboard = () => {
    setLoading(true);
    axios
      .get("admin/referral/getLeaderboard")
      .then((res) => {
        setLoading(false);
        if (res.data.status) setLeaderboard(res.data.topReferrers);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const fetchLogs = () => {
    axios
      .get("admin/referral/getReferralLogs?limit=20")
      .then((res) => {
        if (res.data.status) setLogs(res.data.logs);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="mainPage p-4">
      <Title name="Referral Management & Leaderboard" />

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Top Referrers Leaderboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            Referral Logs & Audit
          </button>
        </li>
      </ul>

      {activeTab === "leaderboard" && (
        <div className="card shadow-sm border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Referral Code</th>
                  <th>Successful Referrals</th>
                  <th>Total Referral Coins Earned</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Loading leaderboard...</td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No referral activity recorded yet.</td>
                  </tr>
                ) : (
                  leaderboard.map((item, idx) => (
                    <tr key={item._id}>
                      <td className="fw-bold">#{idx + 1}</td>
                      <td>{item.fullName || "User"}</td>
                      <td>{item.email}</td>
                      <td><span className="badge bg-secondary">{item.referralCode}</span></td>
                      <td className="fw-bold text-primary">{item.referralCount} users</td>
                      <td className="fw-bold text-success">{item.referralRewardCoin} coins</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="card shadow-sm border-0 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Referrer</th>
                  <th>Referred New User</th>
                  <th>Referral Code</th>
                  <th>Reward Granted</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No recent referral log records.</td>
                  </tr>
                ) : (
                  logs.map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>{item.referrerId?.fullName} ({item.referrerId?.email})</td>
                      <td>{item.referredUserId?.fullName} ({item.referredUserId?.email})</td>
                      <td><span className="badge bg-secondary">{item.referralCode}</span></td>
                      <td className="fw-bold text-success">+{item.rewardCoinsGiven} coins</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
