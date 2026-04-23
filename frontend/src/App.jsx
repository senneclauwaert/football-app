import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Wedstrijden from './pages/Wedstrijden'
import WedstrijdDetail from './pages/WedstrijdDetail'
import Klassement from './pages/Klassement'
import Ploegen from './pages/Ploegen'
import PloegenDetail from './pages/PloegenDetail'
import Evenementen from './pages/Evenementen'
import Shop from './pages/Shop'
import Checkout from './pages/Checkout'
import Nieuws from './pages/Nieuws'
import NieuwsDetail from './pages/NieuwsDetail'
import Sponsors from './pages/Sponsors'
import Login from './pages/Login'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import AdminWedstrijden from './pages/admin/AdminWedstrijden'
import AdminPloegen from './pages/admin/AdminPloegen'
import AdminKlassement from './pages/admin/AdminKlassement'
import AdminShop from './pages/admin/AdminShop'
import AdminEvenementen from './pages/admin/AdminEvenementen'
import AdminNieuws from './pages/admin/AdminNieuws'
import AdminSponsors from './pages/admin/AdminSponsors'
import AdminScraper from './pages/admin/AdminScraper'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/wedstrijden" element={<Wedstrijden />} />
      <Route path="/wedstrijden/:id" element={<WedstrijdDetail />} />
      <Route path="/klassement" element={<Klassement />} />
      <Route path="/ploegen" element={<Ploegen />} />
      <Route path="/ploegen/:slug" element={<PloegenDetail />} />
      <Route path="/ploegen/:slug/:playerId" element={<PloegenDetail />} />
      <Route path="/evenementen" element={<Evenementen />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/afrekenen" element={<Checkout />} />
      <Route path="/nieuws" element={<Nieuws />} />
      <Route path="/nieuws/:id" element={<NieuwsDetail />} />
      <Route path="/sponsors" element={<Sponsors />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/wedstrijden" element={<ProtectedRoute adminOnly><AdminWedstrijden /></ProtectedRoute>} />
      <Route path="/admin/ploegen" element={<ProtectedRoute adminOnly><AdminPloegen /></ProtectedRoute>} />
      <Route path="/admin/klassement" element={<ProtectedRoute adminOnly><AdminKlassement /></ProtectedRoute>} />
      <Route path="/admin/shop" element={<ProtectedRoute adminOnly><AdminShop /></ProtectedRoute>} />
      <Route path="/admin/evenementen" element={<ProtectedRoute adminOnly><AdminEvenementen /></ProtectedRoute>} />
      <Route path="/admin/nieuws" element={<ProtectedRoute adminOnly><AdminNieuws /></ProtectedRoute>} />
      <Route path="/admin/sponsors" element={<ProtectedRoute adminOnly><AdminSponsors /></ProtectedRoute>} />
      <Route path="/admin/scraper" element={<ProtectedRoute adminOnly><AdminScraper /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
