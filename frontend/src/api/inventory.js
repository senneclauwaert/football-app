const BASE = "http://localhost:8000/api"

function getHeaders() {
    const token = localStorage.getItem("token")
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

export async function fetchStats() {
    const [items, users, orders] = await Promise.all([
        fetch(`${BASE}/inventory/?per_page=1`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${BASE}/users/`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${BASE}/orders/`, { headers: getHeaders() }).then(r => r.json()),
    ])
    return { items, users, orders }
}

export async function fetchLowStock() {
    const res = await fetch(`${BASE}/inventory/?per_page=100`, { headers: getHeaders() })
    const data = await res.json()
    return data.items.filter(i => i.quantity <= i.reorder_level)
}