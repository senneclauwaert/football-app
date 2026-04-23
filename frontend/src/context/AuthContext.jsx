import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user,  setUser]  = useState(null)
    const [token, setToken] = useState(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const savedUser  = localStorage.getItem("user")
        const savedToken = localStorage.getItem("token")
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser))
            setToken(savedToken)
        }
        setReady(true)
    }, [])

    function saveAuth(data) {
        setUser(data.user)
        setToken(data.access_token)
        localStorage.setItem("user",  JSON.stringify(data.user))
        localStorage.setItem("token", data.access_token)
    }

    function logout() {
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }

    if (!ready) return null

    return (
        <AuthContext.Provider value={{ user, token, saveAuth, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}