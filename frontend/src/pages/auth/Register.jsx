import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../../api/auth"
import { useAuth } from "../../context/AuthContext"

export default function Register() {
    const [form,  setForm]  = useState({ email: "", username: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { saveAuth } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const data = await register(form.email, form.username, form.password)
            saveAuth(data)
            navigate("/")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left */}
            <div className="hidden lg:flex flex-1 bg-indigo-500 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-indigo-400 rounded-full opacity-50" />
                <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 bg-indigo-600 rounded-full opacity-50" />
                <div className="relative z-10 text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">Join us today</h2>
                    <p className="text-indigo-200 text-lg">Your data, your rules. Full control over your inventory.</p>
                </div>
            </div>

            {/* Right */}
            <div className="flex-1 flex items-center justify-center p-12 bg-white">
                <div className="w-full max-w-md">
                    <p className="text-sm text-gray-400 mb-8">
                        Already a member?{" "}
                        <Link to="/login" className="text-indigo-500 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Sign Up</h1>
                    <p className="text-gray-400 mb-8">Create your account to get started</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
                                placeholder="Choose a username"
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
                            {loading ? "Creating account..." : "Sign up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}