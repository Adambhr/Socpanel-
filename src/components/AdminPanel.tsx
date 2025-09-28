import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"services" | "orders" | "users">("services");
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const services = useQuery(api.services.getAllServices);
  const orders = useQuery(api.orders.getAllOrders);
  
  const addService = useMutation(api.services.addService);
  const updateService = useMutation(api.services.updateService);
  const deleteService = useMutation(api.services.deleteService);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    category: "instagram",
    price: "",
    minQuantity: "",
    maxQuantity: "",
    deliveryTime: "",
    quality: "High",
  });

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addService({
        name: serviceForm.name,
        description: serviceForm.description,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        minQuantity: parseInt(serviceForm.minQuantity),
        maxQuantity: parseInt(serviceForm.maxQuantity),
        deliveryTime: serviceForm.deliveryTime,
        quality: serviceForm.quality,
      });
      
      toast.success("تم إضافة الخدمة بنجاح!");
      setShowAddService(false);
      setServiceForm({
        name: "",
        description: "",
        category: "instagram",
        price: "",
        minQuantity: "",
        maxQuantity: "",
        deliveryTime: "",
        quality: "High",
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService) return;

    try {
      await updateService({
        serviceId: editingService._id,
        name: serviceForm.name,
        description: serviceForm.description,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        minQuantity: parseInt(serviceForm.minQuantity),
        maxQuantity: parseInt(serviceForm.maxQuantity),
        deliveryTime: serviceForm.deliveryTime,
        quality: serviceForm.quality,
        isActive: editingService.isActive,
      });
      
      toast.success("تم تحديث الخدمة بنجاح!");
      setEditingService(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    
    try {
      await deleteService({ serviceId: serviceId as any });
      toast.success("تم حذف الخدمة بنجاح!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status });
      toast.success("تم تحديث حالة الطلب!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEditService = (service: any) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      minQuantity: service.minQuantity.toString(),
      maxQuantity: service.maxQuantity.toString(),
      deliveryTime: service.deliveryTime,
      quality: service.quality,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            مدير الموقع
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "services", name: "إدارة الخدمات", icon: "🛠️" },
              { id: "orders", name: "إدارة الطلبات", icon: "📦" },
              { id: "users", name: "إدارة المستخدمين", icon: "👥" },
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
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">الخدمات</h3>
                <button
                  onClick={() => setShowAddService(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  إضافة خدمة جديدة
                </button>
              </div>

              {(showAddService || editingService) && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">
                    {editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                  </h4>
                  <form onSubmit={editingService ? handleUpdateService : handleAddService} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم الخدمة
                      </label>
                      <input
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الفئة
                      </label>
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الوصف
                      </label>
                      <textarea
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر (لكل 1000)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        وقت التسليم
                      </label>
                      <input
                        type="text"
                        value={serviceForm.deliveryTime}
                        onChange={(e) => setServiceForm({ ...serviceForm, deliveryTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 0-1 ساعة"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأدنى
                      </label>
                      <input
                        type="number"
                        value={serviceForm.minQuantity}
                        onChange={(e) => setServiceForm({ ...serviceForm, minQuantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأقصى
                      </label>
                      <input
                        type="number"
                        value={serviceForm.maxQuantity}
                        onChange={(e) => setServiceForm({ ...serviceForm, maxQuantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="col-span-2 flex space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {editingService ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddService(false);
                          setEditingService(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {services && services.map((service) => (
                  <div key={service._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{service.name}</h4>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>الفئة: {service.category}</span>
                          <span>السعر: ${service.price}/1000</span>
                          <span>الكمية: {service.minQuantity} - {service.maxQuantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {service.isActive ? "نشط" : "غير نشط"}
                        </span>
                        <button
                          onClick={() => startEditService(service)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">إدارة الطلبات</h3>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{order.serviceName}</h4>
                          <p className="text-sm text-gray-600">العميل: {order.userEmail}</p>
                          <p className="text-sm text-gray-600">الرابط: {order.link}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${order.totalPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(order._creationTime).toLocaleDateString('ar')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>الكمية: {order.quantity}</div>
                        <div>البداية: {order.startCount || "غير محدد"}</div>
                        <div>المتبقي: {order.remains || "غير محدد"}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="pending">في الانتظار</option>
                          <option value="processing">قيد التنفيذ</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          order.status === "processing" ? "bg-blue-100 text-blue-800" :
                          order.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {order.status === "pending" ? "في الانتظار" :
                           order.status === "processing" ? "قيد التنفيذ" :
                           order.status === "completed" ? "مكتمل" : "ملغي"}
                        </span>
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

          {activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">إدارة المستخدمين</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  💡 ميزة إدارة المستخدمين ستكون متاحة قريباً
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
