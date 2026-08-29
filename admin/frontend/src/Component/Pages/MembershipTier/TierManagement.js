import React, { useEffect, useState } from "react";
import Title from "../../extra/Title";
import Button from "../../extra/Button";
import axios from "axios";
import { setToast } from "../../../util/toast";

export default function TierManagement() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [tierName, setTierName] = useState("");
  const [level, setLevel] = useState(1);
  const [dailyEarningCapInCoins, setDailyEarningCapInCoins] = useState(1000);
  const [dailyEarningCapInINR, setDailyEarningCapInINR] = useState(100);
  const [dailyAdLimit, setDailyAdLimit] = useState(10);
  const [coinMultiplier, setCoinMultiplier] = useState(1.0);
  const [adCreditsGranted, setAdCreditsGranted] = useState(0);
  const [membershipPrice, setMembershipPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchTiers = () => {
    setLoading(true);
    axios
      .get("admin/membershipTier/getTiers")
      .then((res) => {
        setLoading(false);
        if (res.data.status) setTiers(res.data.tiers);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tierName) {
      setToast("Tier name is required!", "warning");
      return;
    }

    axios
      .post("admin/membershipTier/store", {
        tierName,
        level: Number(level),
        dailyEarningCapInCoins: Number(dailyEarningCapInCoins),
        dailyEarningCapInINR: Number(dailyEarningCapInINR),
        dailyAdLimit: Number(dailyAdLimit),
        coinMultiplier: Number(coinMultiplier),
        adCreditsGranted: Number(adCreditsGranted),
        membershipPrice: Number(membershipPrice),
        description,
        isDefault,
      })
      .then((res) => {
        if (res.data.status) {
          setToast(res.data.message, "success");
          setOpenModal(false);
          fetchTiers();
          resetForm();
        } else {
          setToast(res.data.message, "error");
        }
      })
      .catch((err) => {
        console.error(err);
        setToast("Failed to save tier", "error");
      });
  };

  const resetForm = () => {
    setTierName("");
    setLevel(1);
    setDailyEarningCapInCoins(1000);
    setDailyEarningCapInINR(100);
    setDailyAdLimit(10);
    setCoinMultiplier(1.0);
    setAdCreditsGranted(0);
    setMembershipPrice(0);
    setDescription("");
    setIsDefault(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this membership tier?")) {
      axios
        .delete(`admin/membershipTier/destroy?tierId=${id}`)
        .then((res) => {
          if (res.data.status) {
            setToast(res.data.message, "success");
            fetchTiers();
          }
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="mainPage p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title name="User Membership Tiers & Ad Credit Caps" />
        <Button btnName="Add Tier" newClass="btn-theme" onClick={() => setOpenModal(true)} />
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">Loading Tiers...</div>
        ) : tiers.length === 0 ? (
          <div className="col-12 text-center py-5">No Membership Tiers configured yet.</div>
        ) : (
          tiers.map((tier) => (
            <div className="col-md-6 col-lg-3" key={tier._id}>
              <div className={`card h-100 shadow-sm border-0 ${tier.isDefault ? "border-primary border-2" : ""}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold">{tier.tierName}</h5>
                    <span className="badge bg-secondary">Level {tier.level}</span>
                  </div>
                  {tier.isDefault && <span className="badge bg-primary mb-3">Default Tier</span>}
                  <h4 className="text-primary fw-bold mb-3">
                    {tier.membershipPrice === 0 ? "Free" : `₹ ${tier.membershipPrice}`}
                  </h4>
                  <ul className="list-unstyled text-muted small">
                    <li className="mb-2"><strong>Daily Earning Cap:</strong> {tier.dailyEarningCapInCoins} coins (₹{tier.dailyEarningCapInINR})</li>
                    <li className="mb-2"><strong>Daily Ad Watch Limit:</strong> {tier.dailyAdLimit} Ads</li>
                    <li className="mb-2"><strong>Coin Multiplier:</strong> {tier.coinMultiplier}x</li>
                    <li className="mb-2"><strong>Ad Credits Granted:</strong> {tier.adCreditsGranted} credits</li>
                  </ul>
                  <p className="text-muted small">{tier.description}</p>
                </div>
                <div className="card-footer bg-transparent border-0 text-end">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(tier._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {openModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Configure Membership Tier</h5>
                <button type="button" className="btn-close" onClick={() => setOpenModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Tier Name *</label>
                      <input type="text" className="form-control" value={tierName} onChange={(e) => setTierName(e.target.value)} required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Level *</label>
                      <input type="number" className="form-control" value={level} onChange={(e) => setLevel(e.target.value)} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Daily Cap (Coins)</label>
                      <input type="number" className="form-control" value={dailyEarningCapInCoins} onChange={(e) => setDailyEarningCapInCoins(e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Daily Cap (INR)</label>
                      <input type="number" className="form-control" value={dailyEarningCapInINR} onChange={(e) => setDailyEarningCapInINR(e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Daily Ad Limit</label>
                      <input type="number" className="form-control" value={dailyAdLimit} onChange={(e) => setDailyAdLimit(e.target.value)} />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Multiplier</label>
                      <input type="number" step="0.1" className="form-control" value={coinMultiplier} onChange={(e) => setCoinMultiplier(e.target.value)} />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ad Credits</label>
                      <input type="number" className="form-control" value={adCreditsGranted} onChange={(e) => setAdCreditsGranted(e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price (INR)</label>
                      <input type="number" className="form-control" value={membershipPrice} onChange={(e) => setMembershipPrice(e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center mt-3">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} id="isDefaultCheck" />
                        <label className="form-check-label" htmlFor="isDefaultCheck">Set as Default Tier</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setOpenModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Tier</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
