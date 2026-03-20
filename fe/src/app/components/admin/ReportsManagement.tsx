import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

const salesData = [
  { month: 'Jan', sales: 45600000, orders: 156 },
  { month: 'Feb', sales: 52300000, orders: 178 },
  { month: 'Mar', sales: 48900000, orders: 165 },
  { month: 'Apr', sales: 61200000, orders: 203 },
  { month: 'May', sales: 58700000, orders: 189 },
  { month: 'Jun', sales: 72400000, orders: 234 },
];

const categoryData = [
  { name: 'CPU', value: 28, sales: 125800000 },
  { name: 'GPU', value: 35, sales: 234500000 },
  { name: 'RAM', value: 15, sales: 67200000 },
  { name: 'SSD', value: 12, sales: 56300000 },
  { name: 'Motherboard', value: 10, sales: 45600000 },
];

const COLORS = ['#f37021', '#ff8c42', '#ffa500', '#ffb84d', '#ffc966'];

const topProducts = [
  { name: 'AMD Ryzen 7 7800X3D', sales: 145, revenue: 125800000, growth: 12.5 },
  { name: 'NVIDIA RTX 4070 Ti', sales: 98, revenue: 98500000, growth: 8.3 },
  { name: 'G.Skill Trident Z5 32GB', sales: 187, revenue: 67200000, growth: -3.2 },
  { name: 'WD Black SN850X 1TB', sales: 234, revenue: 56300000, growth: 15.7 },
  { name: 'MSI MAG B760 Tomahawk', sales: 156, revenue: 45600000, growth: 5.4 },
];

export function ReportsManagement() {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers'>('sales');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
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
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
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
              <p className="text-2xl font-bold text-gray-900">₫ 339.1M</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+18.2%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">1,125</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.4%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Average Order</p>
              <p className="text-2xl font-bold text-gray-900">₫ 301.4K</p>
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
                <Tooltip formatter={(value: any) => formatPrice(value)} />
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
              <p className="text-2xl font-bold text-gray-900">2,847</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+23.1%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15.3%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Returning Customers</p>
              <p className="text-2xl font-bold text-gray-900">1,456</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8.7%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Avg. Customer Value</p>
              <p className="text-2xl font-bold text-gray-900">₫ 4.2M</p>
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
        </>
      )}
    </div>
  );
}