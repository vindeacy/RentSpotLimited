import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  AlertCircle,
  Calendar,
  Download,
  FileText,
  PieChart,
  Clock,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

const AnalyticReports = () => {
  const [analytics, setAnalytics] = useState({
    occupancyRate: 0,
    totalRevenue: 0,
    overdueRent: 0,
    maintenanceCosts: 0,
    properties: [],
    revenueData: [],
    maintenanceData: [],
    overdueData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedYear]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/landlord/analytics?range=${timeRange}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/landlord/export-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          format: exportFormat,
          timeRange,
          year: selectedYear
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${selectedYear}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  };

  const revenueStats = {
    total: analytics.totalRevenue,
    trend: calculateTrend(analytics.revenueData),
    data: analytics.revenueData
  };

  const maintenanceStats = {
    total: analytics.maintenanceCosts,
    trend: calculateTrend(analytics.maintenanceData),
    data: analytics.maintenanceData
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark">Analytics & Reports</h1>
          <p className="text-muted">Comprehensive insights into your property portfolio</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="form-select"
          >
            {[2024, 2023, 2022, 2021, 2020].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button onClick={fetchAnalytics} className="btn btn-primary d-flex align-items-center">
            <RefreshCw size={16} className="me-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Occupancy Rate</p>
                <h4 className="fw-bold">{analytics.occupancyRate}%</h4>
                <small className={
                  analytics.occupancyRate >= 90
                    ? "text-success"
                    : analytics.occupancyRate >= 70
                    ? "text-warning"
                    : "text-danger"
                }>
                  {analytics.occupancyRate >= 90
                    ? "Excellent"
                    : analytics.occupancyRate >= 70
                    ? "Good"
                    : "Needs Attention"}
                </small>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                <Home className="text-primary" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between">
              <div>
                <p className="text-muted mb-1">Total Revenue</p>
                <h4 className="fw-bold">${revenueStats.total.toLocaleString()}</h4>
                <div className="d-flex align-items-center">
                  {revenueStats.trend >= 0 ? (
                    <TrendingUp className="text-success me-1" size={16} />
                  ) : (
                    <TrendingDown className="text-danger me-1" size={16} />
                  )}
                  <small className={
                    revenueStats.trend >= 0 ? "text-success" : "text-danger"
                  }>
                    {Math.abs(revenueStats.trend).toFixed(1)}% from last period
                  </small>
                </div>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                <DollarSign className="text-success" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Similar for Overdue Rent and Maintenance */}
      </div>

      {/* Export Reports */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Export Reports</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="form-select"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>

            <div className="col-md-3">
              <button onClick={() => exportReport('revenue')} className="btn btn-success w-100">
                <Download size={16} className="me-2" />
                Revenue Report
              </button>
            </div>

            <div className="col-md-3">
              <button onClick={() => exportReport('occupancy')} className="btn btn-primary w-100">
                <Download size={16} className="me-2" />
                Occupancy Report
              </button>
            </div>

            <div className="col-md-3">
              <button onClick={() => exportReport('maintenance')} className="btn btn-warning w-100 text-white">
                <Download size={16} className="me-2" />
                Maintenance Report
              </button>
            </div>
          </div>

          <div className="border-top mt-4 pt-3 text-center">
            <button
              onClick={() => exportReport('comprehensive')}
              className="btn btn-secondary w-100"
            >
              <FileText size={18} className="me-2" />
              Export Comprehensive Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticReports;
