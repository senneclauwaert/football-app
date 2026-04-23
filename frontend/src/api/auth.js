const BASE = "http://localhost:8000/api/auth"

export async function login(username, password) {
    const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
    })
    if (!res.ok) throw new Error("Invalid credentials")
    return res.json()
}

export async function register(email, username, password) {
    const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Registration failed")
    }
    return res.json()
}