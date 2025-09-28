import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول الخدمات
  services: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    minQuantity: v.number(),
    maxQuantity: v.number(),
    isActive: v.boolean(),
    apiServiceId: v.optional(v.string()),
    apiProvider: v.optional(v.string()),
    deliveryTime: v.string(),
    quality: v.string(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // جدول الطلبات
  orders: defineTable({
    userId: v.id("users"),
    serviceId: v.id("services"),
    link: v.string(),
    quantity: v.number(),
    totalPrice: v.number(),
    status: v.string(), // pending, processing, completed, cancelled
    startCount: v.optional(v.number()),
    remains: v.optional(v.number()),
    apiOrderId: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // جدول الرصيد والمعاملات
  transactions: defineTable({
    userId: v.id("users"),
    type: v.string(), // deposit, order, refund
    amount: v.number(),
    description: v.string(),
    orderId: v.optional(v.id("orders")),
  }).index("by_user", ["userId"]),

  // جدول المستخدمين الإضافي
  userProfiles: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    totalSpent: v.number(),
    totalOrders: v.number(),
    isAdmin: v.boolean(),
  }).index("by_user", ["userId"]),

  // جدول إعدادات الموقع
  siteSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // جدول موفري API
  apiProviders: defineTable({
    name: v.string(),
    apiUrl: v.string(),
    apiKey: v.string(),
    isActive: v.boolean(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
