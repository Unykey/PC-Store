import { useEffect, useMemo, useState } from 'react';
import type { TooltipProps } from 'recharts';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { reportsApi } from '@/api/reportsApi';
import { installmentApi, type AdminInstallmentPaymentResponse } from '@/api/orderApi';

const COLORS = ['#f37021', '#ff8c42', '#ffa500', '#ffb84d', '#ffc966'];

export function ReportsManagement() {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers'>('sales');
  const [loading, setLoading] = useState(false);
  const [months] = useState(6);

  const [salesData, setSalesData] = useState<{ month: string; sales: number; orders: number }[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<{ name: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<
    { name: string; sales: number; revenue: number; growth: number }[]
  >([]);
  const [customerKpis, setCustomerKpis] = useState<{
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    avgCustomerValue: number;
  } | null>(null);
  const now = new Date();
  const [paidMonth, setPaidMonth] = useState(now.getMonth() + 1);
  const [paidYear, setPaidYear] = useState(now.getFullYear());
  const [paidInstallments, setPaidInstallments] = useState<AdminInstallmentPaymentResponse[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  const tooltipFormatter: TooltipProps<number, string>['formatter'] = (value) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? formatPrice(n) : String(value);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const [salesRes, catRes, topRes, custRes] = await Promise.all([
          reportsApi.salesOverview({ months }),
          reportsApi.categoryRevenue({ months }),
          reportsApi.topProducts({ limit: 5, sortBy: 'sales' }),
          reportsApi.customerInsights({ months }),
        ]);

        if (cancelled) return;

        setSalesData(
          (salesRes.data.data || []).map((p) => ({
            month: p.month,
            sales: Number(p.sales || 0),
            orders: Number(p.orders || 0),
          })),
        );

        const cat = (catRes.data.data || []).map((c) => ({
          name: c.name,
          revenue: Number(c.revenue || 0),
        }));
        setCategoryRevenue(cat);

        // Top products for table; growth not available yet -> set 0 (UI still renders)
        setTopProducts(
          (topRes.data.data || []).map((p) => ({
            name: p.productName,
            sales: Number(p.totalQuantitySold || 0),
            revenue: Number(p.totalSalesAmount || 0),
            growth: 0,
          })),
        );

        const ci = custRes.data.data;
        setCustomerKpis(
          ci
            ? {
                totalCustomers: Number(ci.totalCustomers || 0),
                newCustomers: Number(ci.newCustomers || 0),
                returningCustomers: Number(ci.returningCustomers || 0),
                avgCustomerValue: Number(ci.avgCustomerValue || 0),
              }
            : null,
        );
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [months]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await installmentApi.adminGetPaidInstallments({ month: paidMonth, year: paidYear });
        if (cancelled) return;
        setPaidInstallments(res.data.data || []);
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load paid installments', e);
          setPaidInstallments([]);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [paidMonth, paidYear]);

  const categoryData = useMemo(() => {
    const total = categoryRevenue.reduce((sum, c) => sum + c.revenue, 0);
    if (total <= 0) return [];
    return categoryRevenue.map((c) => ({
      name: c.name,
      value: Math.round((c.revenue / total) * 100),
      sales: c.revenue,
    }));
  }, [categoryRevenue]);

  const toCsv = (rows: Array<Array<string | number>>) =>
    rows
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? '');
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(','),
      )
      .join('\n');

  const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    const stamp = new Date().toISOString().slice(0, 10);

    if (reportType === 'sales') {
      const totalRevenue = salesData.reduce((s, p) => s + p.sales, 0);
      const totalOrders = salesData.reduce((s, p) => s + p.orders, 0);
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const rows: Array<Array<string | number>> = [
        ['Report Type', 'Sales Report'],
        ['Period (months)', months],
        ['Total Revenue', totalRevenue],
        ['Total Orders', totalOrders],
        ['Average Order Value', avgOrder],
        [],
        ['Monthly Sales'],
        ['Month', 'Sales', 'Orders'],
        ...salesData.map((r) => [r.month, r.sales, r.orders]),
        [],
        ['Category Revenue'],
        ['Category', 'Revenue', 'Share (%)'],
        ...categoryData.map((r) => [r.name, r.sales, r.value]),
      ];
      downloadCsv(`sales-report-${stamp}.csv`, rows);
      return;
    }

    if (reportType === 'products') {
      const rows: Array<Array<string | number>> = [
        ['Report Type', 'Product Performance'],
        ['Period (months)', months],
        [],
        ['Top Products'],
        ['Rank', 'Product', 'Units Sold', 'Revenue', 'Growth (%)'],
        ...topProducts.map((p, i) => [i + 1, p.name, p.sales, p.revenue, p.growth]),
        [],
        ['Monthly Product Trend'],
        ['Month', 'Orders'],
        ...salesData.map((r) => [r.month, r.orders]),
      ];
      downloadCsv(`product-performance-${stamp}.csv`, rows);
      return;
    }

    const rows: Array<Array<string | number>> = [
      ['Report Type', 'Customer Insights'],
      ['Period (months)', months],
      ['Total Customers', customerKpis?.totalCustomers ?? 0],
      ['New Customers', customerKpis?.newCustomers ?? 0],
      ['Returning Customers', customerKpis?.returningCustomers ?? 0],
      ['Average Customer Value', customerKpis?.avgCustomerValue ?? 0],
      [],
      ['Customer Acquisition Trend'],
      ['Month', 'Orders'],
      ...salesData.map((r) => [r.month, r.orders]),
    ];
    downloadCsv(`customer-insights-${stamp}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reportType === 'sales'
                ? 'bg-[#f37021] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reportType === 'products'
                ? 'bg-[#f37021] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Product Performance
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reportType === 'customers'
                ? 'bg-[#f37021] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Customer Insights
          </button>
        </div>
        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `₫ ${formatCompactPrice(salesData.reduce((s, p) => s + p.sales, 0))}`}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+18.2%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (salesData.reduce((s, p) => s + p.orders, 0)).toLocaleString('en-US')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.4%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Average Order</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading
                  ? '...'
                  : (() => {
                      const totalSales = salesData.reduce((s, p) => s + p.sales, 0);
                      const totalOrders = salesData.reduce((s, p) => s + p.orders, 0);
                      const avg = totalOrders > 0 ? totalSales / totalOrders : 0;
                      return `₫ ${formatCompactPrice(avg)}`;
                    })()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+5.1%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">3.8%</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span>-1.2%</span>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCompactPrice} />
                <Tooltip formatter={tooltipFormatter} />
                <Line type="monotone" dataKey="sales" stroke="#f37021" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const p = typeof percent === 'number' ? percent : 0;
                      return `${name} ${(p * 100).toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Revenue</h3>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(category.sales)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${category.value * 2}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Product Performance */}
      {reportType === 'products' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr key={product.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sales} units</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(product.revenue)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${
                          product.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.growth > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {product.growth > 0 ? '+' : ''}{product.growth}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend by Product</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#f37021" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Customer Insights */}
      {reportType === 'customers' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (customerKpis?.totalCustomers ?? 0).toLocaleString('en-US')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+23.1%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (customerKpis?.newCustomers ?? 0).toLocaleString('en-US')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15.3%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Returning Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (customerKpis?.returningCustomers ?? 0).toLocaleString('en-US')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8.7%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Avg. Customer Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `₫ ${formatCompactPrice(customerKpis?.avgCustomerValue ?? 0)}`}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Acquisition</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#f37021" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Installment Payments (Monthly)</h3>
              <div className="flex items-center gap-2">
                <select
                  value={paidMonth}
                  onChange={(e) => setPaidMonth(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                  ))}
                </select>
                <select
                  value={paidYear}
                  onChange={(e) => setPaidYear(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Installment</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Paid Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Late Fee</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paidInstallments.map((p) => (
                    <tr key={p.installmentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900">{p.customerName || `#${p.accountId}`}</p>
                        <p className="text-gray-500">{p.customerPhone || p.customerEmail || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">#{p.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.monthNumber}/{p.totalMonths}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {p.paidDate ? new Date(p.paidDate).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={p.overdueFee > 0 ? 'font-medium text-red-600' : 'text-gray-500'}>
                          {formatPrice(p.overdueFee || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatPrice(p.amount || 0)}</td>
                    </tr>
                  ))}
                  {paidInstallments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                        No paid installments for selected month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}