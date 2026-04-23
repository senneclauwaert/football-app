import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../api/auth"
import { useAuth } from "../../context/AuthContext"

export default function Login() {
    const [form,    setForm]    = useState({ username: "", password: "" })
    const [error,   setError]   = useState("")
    const [loading, setLoading] = useState(false)
    const { saveAuth } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const data = await login(form.username, form.password)
            console.log(data)
            saveAuth(data)
            if (data.user.role === "admin") {
                navigate("/admin")
            } else {
                navigate("/home")
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center p-12 bg-white">
                <div className="w-full max-w-md">
                    <p className="text-sm text-gray-400 mb-8">
                        No account?{" "}
                        <Link to="/register" className="text-indigo-500 font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>

                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back</h1>
                    <p className="text-gray-400 mb-8">Sign in to your account</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Username or Email</label>
                            <input
                                type="text"
                                required
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-indigo-500 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-indigo-400 rounded-full opacity-50" />
                <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-indigo-600 rounded-full opacity-50" />
                <div className="relative z-10 text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">Inventory Manager</h2>
                    <p className="text-indigo-200 text-lg">Manage your stock, suppliers and warehouses in one place.</p>
                </div>
            </div>
        </div>
    )
}