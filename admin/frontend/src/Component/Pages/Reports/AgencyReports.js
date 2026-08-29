import React, { useEffect, useState } from "react";
import Title from "../../extra/Title";
import axios from "axios";

export default function AgencyReports() {
  const [report, setReport] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgencies();
    fetchReport();
  }, []);

  const fetchAgencies = () => {
    axios
      .get("admin/agency/getAgencies?limit=100")
      .then((res) => {
        if (res.data.status) setAgencies(res.data.agencies);
      })
      .catch((err) => console.error(err));
  };

  const fetchReport = () => {
    setLoading(true);
    let url = `admin/agencyReport/getAgencyReport?agencyId=${selectedAgency}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    axios
      .get(url)
      .then((res) => {
        setLoading(false);
        if (res.data.status) setReport(res.data.report);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="mainPage p-4">
      <Title name="Agency & Regional Performance Reports" />

      <div className="card shadow-sm border-0 p-3 mb-4">
        <form onSubmit={handleFilter} className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Filter by Agency</label>
            <select className="form-select" value={selectedAgency} onChange={(e) => setSelectedAgency(e.target.value)}>
              <option value="">All Agencies / Platform Global</option>
              {agencies.map((agency) => (
                <option key={agency._id} value={agency._id}>
                  {agency.name} ({agency.district || agency.state})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Generate Report</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        {loading ? (
          <div className="text-center py-5">Generating Report...</div>
        ) : !report ? (
          <div className="text-center py-5">No report data available.</div>
        ) : (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">Total Registered Users</h6>
                <h4>{report.totalUsers}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">App Downloads</h6>
                <h4>{report.totalDownloads}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">Regional Video Views</h6>
                <h4>{report.totalVideoViews}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">Ad Impressions</h6>
                <h4>{report.totalAdImpressions}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">Gross Platform Revenue</h6>
                <h4 className="text-primary">₹ {report.totalGrossRevenue.toFixed(2)}</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <h6 className="text-muted">Commission Share</h6>
                <h4 className="text-success">₹ {report.totalCommissionEarned.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
