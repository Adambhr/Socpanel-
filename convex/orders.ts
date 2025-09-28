import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// إنشاء طلب جديد
export const createOrder = mutation({
  args: {
    serviceId: v.id("services"),
    link: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول أولاً");

    // جلب بيانات الخدمة
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      throw new Error("الخدمة غير متوفرة");
    }

    // التحقق من الكمية
    if (args.quantity < service.minQuantity || args.quantity > service.maxQuantity) {
      throw new Error(`الكمية يجب أن تكون بين ${service.minQuantity} و ${service.maxQuantity}`);
    }

    // حساب السعر الإجمالي
    const totalPrice = (service.price * args.quantity) / 1000;

    // جلب رصيد المستخدم
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      // إنشاء ملف تعريف جديد للمستخدم
      await ctx.db.insert("userProfiles", {
        userId,
        balance: 0,
        totalSpent: 0,
        totalOrders: 0,
        isAdmin: false,
      });
      userProfile = { balance: 0, totalSpent: 0, totalOrders: 0, isAdmin: false };
    }

    // التحقق من الرصيد
    if (userProfile.balance < totalPrice) {
      throw new Error("الرصيد غير كافي");
    }

    // إنشاء الطلب
    const orderId = await ctx.db.insert("orders", {
      userId,
      serviceId: args.serviceId,
      link: args.link,
      quantity: args.quantity,
      totalPrice,
      status: "pending",
    });

    // خصم المبلغ من الرصيد
    await ctx.db.patch(userProfile._id!, {
      balance: userProfile.balance - totalPrice,
      totalSpent: userProfile.totalSpent + totalPrice,
      totalOrders: userProfile.totalOrders + 1,
    });

    // إضافة معاملة
    await ctx.db.insert("transactions", {
      userId,
      type: "order",
      amount: -totalPrice,
      description: `طلب خدمة: ${service.name}`,
      orderId,
    });

    return orderId;
  },
});

// جلب طلبات المستخدم
export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // جلب بيانات الخدمات
    const ordersWithServices = await Promise.all(
      orders.map(async (order) => {
        const service = await ctx.db.get(order.serviceId);
        return {
          ...order,
          serviceName: service?.name || "خدمة محذوفة",
        };
      })
    );

    return ordersWithServices;
  },
});

// جلب جميع الطلبات (للإدارة)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("غير مصرح");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح - مطلوب صلاحيات إدارة");
    }

    const orders = await ctx.db.query("orders").order("desc").collect();

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const service = await ctx.db.get(order.serviceId);
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          serviceName: service?.name || "خدمة محذوفة",
          userEmail: user?.email || "مستخدم محذوف",
        };
      })
    );

    return ordersWithDetails;
  },
});

// تحديث حالة الطلب
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    startCount: v.optional(v.number()),
    remains: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("غير مصرح");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح - مطلوب صلاحيات إدارة");
    }

    const { orderId, ...updateData } = args;
    await ctx.db.patch(orderId, updateData);
  },
});
