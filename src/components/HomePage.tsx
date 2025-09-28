import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

const categories = [
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "facebook", name: "Facebook", icon: "📘" },
  { id: "twitter", name: "Twitter", icon: "🐦" },
  { id: "youtube", name: "YouTube", icon: "📺" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "telegram", name: "Telegram", icon: "✈️" },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("instagram");
  const [orderForm, setOrderForm] = useState({
    serviceId: "",
    link: "",
    quantity: "",
  });

  const services = useQuery(api.services.getServicesByCategory, { 
    category: selectedCategory 
  });
  const createOrder = useMutation(api.orders.createOrder);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.serviceId || !orderForm.link || !orderForm.quantity) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      await createOrder({
        serviceId: orderForm.serviceId as any,
        link: orderForm.link,
        quantity: parseInt(orderForm.quantity),
      });
      
      toast.success("تم إنشاء الطلب بنجاح!");
      setOrderForm({ serviceId: "", link: "", quantity: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">SMM Tiger</h1>
        <p className="text-xl mb-6">
          أفضل موقع لتزويد المتابعين ووسائل التواصل الاجتماعي
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm">دعم فني</div>
          </div>
          <div>
            <div className="text-2xl font-bold">1000+</div>
            <div className="text-sm">خدمة متاحة</div>
          </div>
          <div>
            <div className="text-2xl font-bold">99%</div>
            <div className="text-sm">معدل النجاح</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">الفئات</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-right p-3 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">الخدمات المتاحة</h2>
          
          {services && services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service._id} className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-blue-600">
                        ${service.price}/1000
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.deliveryTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>الحد الأدنى: {service.minQuantity}</div>
                    <div>الحد الأقصى: {service.maxQuantity}</div>
                  </div>

                  <form onSubmit={handleOrder} className="space-y-3">
                    <input
                      type="url"
                      placeholder="رابط المنشور أو الحساب"
                      value={orderForm.serviceId === service._id ? orderForm.link : ""}
                      onChange={(e) => setOrderForm({
                        ...orderForm,
                        serviceId: service._id,
                        link: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="الكمية"
                        min={service.minQuantity}
                        max={service.maxQuantity}
                        value={orderForm.serviceId === service._id ? orderForm.quantity : ""}
                        onChange={(e) => setOrderForm({
                          ...orderForm,
                          serviceId: service._id,
                          quantity: e.target.value
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        اطلب الآن
                      </button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد خدمات متاحة
              </h3>
              <p className="text-gray-600">
                لا توجد خدمات في هذه الفئة حالياً
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
