import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "transactions" | "balance">("orders");
  const [balanceAmount, setBalanceAmount] = useState("");

  const user = useQuery(api.users.getCurrentUser);
  const orders = useQuery(api.orders.getUserOrders);
  const transactions = useQuery(api.users.getUserTransactions);
  const addBalance = useMutation(api.users.addBalance);

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      await addBalance({
        amount,
        description: "إيداع رصيد",
      });
      
      toast.success("تم إضافة الرصيد بنجاح!");
      setBalanceAmount("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "في الانتظار";
      case "processing": return "قيد التنفيذ";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الرصيد الحالي</p>
              <p className="text-2xl font-bold text-gray-900">
                ${user?.profile?.balance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.profile?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الإنفاق</p>
              <p className="text-2xl font-bold text-gray-900">
                ${user?.profile?.totalSpent?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الحالة</p>
              <p className="text-lg font-bold text-gray-900">
                {user?.profile?.isAdmin ? "مدير" : "عضو"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "orders", name: "الطلبات", icon: "📦" },
              { id: "transactions", name: "المعاملات", icon: "💳" },
              { id: "balance", name: "إضافة رصيد", icon: "💰" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">طلباتي</h3>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{order.serviceName}</h4>
                          <p className="text-sm text-gray-600">{order.link}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>الكمية: {order.quantity}</div>
                        <div>السعر: ${order.totalPrice.toFixed(2)}</div>
                        <div>التاريخ: {new Date(order._creationTime).toLocaleDateString('ar')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">📦</span>
                  <p className="text-gray-600 mt-2">لا توجد طلبات بعد</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">المعاملات المالية</h3>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction._creationTime).toLocaleDateString('ar')}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${
                          transaction.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">💳</span>
                  <p className="text-gray-600 mt-2">لا توجد معاملات بعد</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "balance" && (
            <div className="max-w-md">
              <h3 className="text-lg font-medium mb-4">إضافة رصيد</h3>
              <form onSubmit={handleAddBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل المبلغ"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  إضافة رصيد
                </button>
              </form>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 ملاحظة: في النسخة التجريبية، يمكنك إضافة رصيد مجاني لتجربة الموقع
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
