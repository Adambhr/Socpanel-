import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import HomePage from "./components/HomePage";
import AdminPanel from "./components/AdminPanel";
import UserDashboard from "./components/UserDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "admin" | "dashboard">("home");
  const user = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={() => setCurrentPage("home")}
              >
                SMM Tiger
              </h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentPage("home")}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === "home" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  الرئيسية
                </button>
                <Authenticated>
                  <button
                    onClick={() => setCurrentPage("dashboard")}
                    className={`px-3 py-2 text-sm font-medium ${
                      currentPage === "dashboard" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    لوحة التحكم
                  </button>
                  {user?.profile?.isAdmin && (
                    <button
                      onClick={() => setCurrentPage("admin")}
                      className={`px-3 py-2 text-sm font-medium ${
                        currentPage === "admin" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      إدارة الموقع
                    </button>
                  )}
                </Authenticated>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Authenticated>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    الرصيد: ${user?.profile?.balance?.toFixed(2) || "0.00"}
                  </span>
                  <SignOutButton />
                </div>
              </Authenticated>
              <Unauthenticated>
                <div className="text-sm text-gray-600">
                  مرحباً بك في SMM Tiger
                </div>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Unauthenticated>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                مرحباً بك في SMM Tiger
              </h2>
              <p className="text-gray-600">
                أفضل موقع لتزويد المتابعين ووسائل التواصل الاجتماعي
              </p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>

        <Authenticated>
          {currentPage === "home" && <HomePage />}
          {currentPage === "dashboard" && <UserDashboard />}
          {currentPage === "admin" && user?.profile?.isAdmin && <AdminPanel />}
        </Authenticated>
      </main>

      <Toaster />
    </div>
  );
}
