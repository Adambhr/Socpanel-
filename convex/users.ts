import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// جلب ملف المستخدم الحالي
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      // إنشاء ملف تعريف جديد
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        balance: 0,
        totalSpent: 0,
        totalOrders: 0,
        isAdmin: false,
      });
      userProfile = await ctx.db.get(profileId);
    }

    const user = await ctx.db.get(userId);
    return {
      ...user,
      profile: userProfile,
    };
  },
});

// إضافة رصيد
export const addBalance = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول أولاً");

    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        balance: args.amount,
        totalSpent: 0,
        totalOrders: 0,
        isAdmin: false,
      });
      userProfile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(userProfile._id, {
        balance: userProfile.balance + args.amount,
      });
    }

    // إضافة معاملة
    await ctx.db.insert("transactions", {
      userId,
      type: "deposit",
      amount: args.amount,
      description: args.description,
    });
  },
});

// جلب المعاملات
export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// تسجيل دخول الإدارة
export const adminLogin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // التحقق من بيانات الإدارة المحددة
    if (args.username !== "6NM30E9FQ76" || args.password !== "6NM30E9FQ76") {
      throw new Error("بيانات الدخول غير صحيحة");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول أولاً");

    // تحديث صلاحيات المستخدم
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      await ctx.db.insert("userProfiles", {
        userId,
        balance: 0,
        totalSpent: 0,
        totalOrders: 0,
        isAdmin: true,
      });
    } else {
      await ctx.db.patch(userProfile._id, {
        isAdmin: true,
      });
    }

    return true;
  },
});
