import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// جلب جميع الخدمات النشطة
export const getActiveServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// جلب الخدمات حسب الفئة
export const getServicesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// إضافة خدمة جديدة (للإدارة فقط)
export const addService = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    minQuantity: v.number(),
    maxQuantity: v.number(),
    deliveryTime: v.string(),
    quality: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("غير مصرح");

    // التحقق من صلاحيات الإدارة
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح - مطلوب صلاحيات إدارة");
    }

    return await ctx.db.insert("services", {
      ...args,
      isActive: true,
    });
  },
});

// تحديث خدمة
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    minQuantity: v.number(),
    maxQuantity: v.number(),
    deliveryTime: v.string(),
    quality: v.string(),
    isActive: v.boolean(),
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

    const { serviceId, ...updateData } = args;
    await ctx.db.patch(serviceId, updateData);
  },
});

// حذف خدمة
export const deleteService = mutation({
  args: { serviceId: v.id("services") },
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

    await ctx.db.delete(args.serviceId);
  },
});

// جلب جميع الخدمات (للإدارة)
export const getAllServices = query({
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

    return await ctx.db.query("services").collect();
  },
});
