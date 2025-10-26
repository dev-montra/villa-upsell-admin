import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { Dashboard } from './pages/Dashboard'
import { Properties } from './pages/Properties'
import { PropertyForm } from './pages/PropertyForm'
import { Vendors } from './pages/Vendors'
import { VendorForm } from './pages/VendorForm'
import { Upsells } from './pages/Upsells'
import { UpsellForm } from './pages/UpsellForm'
import { Orders } from './pages/Orders'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/new" element={<PropertyForm />} />
                  <Route path="/properties/:id/edit" element={<PropertyForm />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/vendors/new" element={<VendorForm />} />
                  <Route path="/vendors/:id/edit" element={<VendorForm />} />
                  <Route path="/upsells" element={<Upsells />} />
                  <Route path="/upsells/new" element={<UpsellForm />} />
                  <Route path="/upsells/:id/edit" element={<UpsellForm />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App