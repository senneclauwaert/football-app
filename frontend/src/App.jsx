import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import ProtectedRoute from "./components/ProtectedRoute"

import Login      from "./pages/auth/Login"
import Register   from "./pages/auth/Register"
import Dashboard  from "./pages/admin/Dashboard"
import Items      from "./pages/admin/Items"
import Users      from "./pages/admin/Users"
import Orders     from "./pages/admin/Orders"
import Suppliers  from "./pages/admin/Suppliers"
import Warehouses from "./pages/admin/Warehouses"
import Categories from "./pages/admin/Categories"
import Movements  from "./pages/admin/Movements"
import Home       from "./pages/Home"
import Catalog    from "./pages/Catalog"

function RootRedirect() {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (user.role === "admin") return <Navigate to="/admin" replace />
    return <Navigate to="/home" replace />
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            success: {
                                style: { background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 13 },
                                iconTheme: { primary: "#fff", secondary: "#22c55e" },
                            },
                            error: {
                                style: { background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: 13 },
                                iconTheme: { primary: "#fff", secondary: "#ef4444" },
                            },
                        }}
                    />
                    <Routes>
                        <Route path="/login"    element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/"         element={<RootRedirect />} />

                        <Route path="/home" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/catalog" element={
                            <ProtectedRoute>
                                <Catalog />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/items" element={
                            <ProtectedRoute adminOnly>
                                <Items />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute adminOnly>
                                <Users />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/orders" element={
                            <ProtectedRoute adminOnly>
                                <Orders />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/suppliers" element={
                            <ProtectedRoute adminOnly>
                                <Suppliers />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/warehouses" element={
                            <ProtectedRoute adminOnly>
                                <Warehouses />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/categories" element={
                            <ProtectedRoute adminOnly>
                                <Categories />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/movements" element={
                            <ProtectedRoute adminOnly>
                                <Movements />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    )
}