import { useState } from 'react';
import { Save, CreditCard, Truck, Calculator, Users, Shield, Bell } from 'lucide-react';

type SettingsTab = 'payment' | 'shipping' | 'tax' | 'users' | 'security' | 'notifications';

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('payment');

  const tabs = [
    { id: 'payment' as SettingsTab, label: 'Payment Methods', icon: CreditCard },
    { id: 'shipping' as SettingsTab, label: 'Shipping', icon: Truck },
    { id: 'tax' as SettingsTab, label: 'Tax', icon: Calculator },
    { id: 'users' as SettingsTab, label: 'Admin Roles', icon: Users },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#f37021] text-[#f37021]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#f37021]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Credit/Debit Card</h4>
                  <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#f37021]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
                  <p className="text-sm text-gray-600">Direct bank transfer</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cash on Delivery</h4>
                  <p className="text-sm text-gray-600">Pay when you receive</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Configuration</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold</label>
              <input
                type="number"
                defaultValue="5000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Orders above this amount get free shipping</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping Fee</label>
              <input
                type="number"
                defaultValue="30000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping Fee</label>
              <input
                type="number"
                defaultValue="60000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Standard)</label>
              <input
                type="text"
                defaultValue="3-5 business days"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Express)</label>
              <input
                type="text"
                defaultValue="1-2 business days"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Settings */}
      {activeTab === 'tax' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tax Configuration</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">VAT (Value Added Tax)</h4>
                <p className="text-sm text-gray-600">Standard VAT rate</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="10"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                />
                <span className="text-gray-700">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Include Tax in Prices</h4>
                <p className="text-sm text-gray-600">Display prices with tax included</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Roles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Roles & Permissions</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Super Admin</h4>
                <span className="px-3 py-1 bg-[#f37021] text-white rounded-full text-xs font-medium">Full Access</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Complete system access and control</p>
              <div className="flex flex-wrap gap-2">
                {['Dashboard', 'Products', 'Orders', 'Customers', 'Reports', 'Settings'].map((perm) => (
                  <span key={perm} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Manager</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Limited Access</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Manage products, orders, and customers</p>
              <div className="flex flex-wrap gap-2">
                {['Products', 'Orders', 'Customers', 'Inventory'].map((perm) => (
                  <span key={perm} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Support Staff</h4>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">View Only</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">View orders and customer information</p>
              <div className="flex flex-wrap gap-2">
                {['Orders (View)', 'Customers (View)'].map((perm) => (
                  <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Login Alerts</h4>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Change Password</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Update Security Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">New Orders</h4>
                <p className="text-sm text-gray-600">Get notified when new orders arrive</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Low Stock Alerts</h4>
                <p className="text-sm text-gray-600">Alert when products are running low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
                <p className="text-sm text-gray-600">Notify when customers leave reviews</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Daily Reports</h4>
                <p className="text-sm text-gray-600">Receive daily sales summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f3702133] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f37021]"></div>
              </label>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d96319] transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}