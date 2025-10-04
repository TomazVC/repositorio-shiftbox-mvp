import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { WalletPage } from './pages/WalletPage'
import Users from './pages/Users'
import Investments from './pages/Investments'
import LoansPage from './pages/LoansPage'
import AdminPage from './pages/AdminPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Layout>
                  <WalletPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Investments />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <Layout>
                  <LoansPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

