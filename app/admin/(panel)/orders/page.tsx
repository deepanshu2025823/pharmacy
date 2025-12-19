"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar,
  DollarSign,
  Eye,
  Trash2,
  X,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

type Order = {
  id: number;
  customer_id: number;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: number;
  order_id: number;
  medicine_id: number;
  qty: number;
  price: number;
  medicine_name?: string;
};

type OrderDetails = Order & {
  items: OrderItem[];
};

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100" },
  PROCESSING: { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100" },
  SHIPPED: { bg: "bg-indigo-50", text: "text-indigo-700", badge: "bg-indigo-100" },
  DELIVERED: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100" },
};

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-orange-100", text: "text-orange-700" },
  PAID: { bg: "bg-green-100", text: "text-green-700" },
  FAILED: { bg: "bg-red-100", text: "text-red-700" },
  REFUNDED: { bg: "bg-gray-100", text: "text-gray-700" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const viewDetails = async (orderId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await res.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        data.items = [];
      }
      
      setSelectedOrder(data);
      setShowDetailsModal(true);
      setUpdateMessage(null);
    } catch (error) {
      console.error("Failed to load order details", error);
      alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    setLoading(true);
    setUpdateMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      const result = await res.json();
      
      await loadOrders();
      
      if (selectedOrder?.id === orderId) {
        const updatedPaymentStatus = 
          selectedOrder.payment_method === 'COD' && newStatus === 'DELIVERED' 
            ? 'PAID' 
            : newStatus === 'CANCELLED' && selectedOrder.payment_method === 'COD'
            ? 'FAILED'
            : selectedOrder.payment_status;
            
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus,
          payment_status: updatedPaymentStatus 
        });
      }
      
      if (result.emailSent) {
        setUpdateMessage({
          type: 'success',
          text: '✅ Order status updated and email sent to customer!'
        });
      } else if (result.message?.includes('no email')) {
        setUpdateMessage({
          type: 'warning',
          text: '⚠️ Order status updated (no email on file for customer)'
        });
      } else {
        setUpdateMessage({
          type: 'error',
          text: '❌ Order status updated but email failed to send.'
        });
      }
      
      setTimeout(() => setUpdateMessage(null), 5000);
      
    } catch (error) {
      console.error("Failed to update status", error);
      setUpdateMessage({
        type: 'error',
        text: '❌ Failed to update order status'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete order');
      }
      
      await loadOrders();
      setShowDetailsModal(false);
      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Failed to delete order", error);
      alert("Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "PENDING").length;
    const delivered = orders.filter(o => o.status === "DELIVERED").length;
    const cancelled = orders.filter(o => o.status === "CANCELLED").length;
    
    // Calculate revenue only from DELIVERED orders with PAID payment status
    const revenue = orders
      .filter(o => o.status === "DELIVERED" && o.payment_status === "PAID")
      .reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0);
    
    return { total, pending, delivered, cancelled, revenue };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">₹{stats.revenue.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs mt-1">From delivered orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading && orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={40} />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Package className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-600 font-medium">No orders found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-gray-900">{order.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-700">{order.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">₹{parseFloat(String(order.total_amount)).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600 font-medium">{order.payment_method}</div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.payment_status]?.bg} ${paymentStatusColors[order.payment_status]?.text}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]?.badge} ${statusColors[order.status]?.text}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewDetails(order.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Order Details - #{selectedOrder.id}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Update Message */}
                {updateMessage && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    updateMessage.type === 'success' ? 'bg-green-50 border border-green-200' :
                    updateMessage.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    {updateMessage.type === 'success' ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <AlertCircle className={updateMessage.type === 'warning' ? 'text-yellow-600' : 'text-red-600'} size={20} />
                    )}
                    <p className={`text-sm font-medium ${
                      updateMessage.type === 'success' ? 'text-green-800' :
                      updateMessage.type === 'warning' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {updateMessage.text}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    disabled={loading}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    📧 Customer will receive an email notification when status is updated
                    {selectedOrder.payment_method === 'COD' && (
                      <span className="block mt-1">
                        💡 Payment status will be automatically updated for COD orders
                      </span>
                    )}
                  </p>
                </div>

                {/* Customer Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-emerald-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedOrder.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={20} className="text-emerald-600" />
                    Order Items
                  </h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.medicine_name || `Medicine ID: ${item.medicine_id}`}
                            </p>
                            <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                          </div>
                          <p className="font-semibold text-emerald-600">₹{parseFloat(String(item.price)).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items found</p>
                  )}
                </div>

                {/* Payment & Pricing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-emerald-600" />
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[selectedOrder.payment_status]?.bg} ${paymentStatusColors[selectedOrder.payment_status]?.text}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{parseFloat(String(selectedOrder.subtotal)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-medium">₹{parseFloat(String(selectedOrder.delivery_fee)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-₹{parseFloat(String(selectedOrder.discount)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                        <span>Total Amount:</span>
                        <span className="text-emerald-600">₹{parseFloat(String(selectedOrder.total_amount)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar size={18} />
                  <span>Order placed on: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}