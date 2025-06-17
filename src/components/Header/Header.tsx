"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"
import Cart from "../Cart/Cart"
import LoginModal from "../Login/LoginModal"
import AdminPanel from "../Painel Administrativo/AdminPanel"
// Adicionar import do RegisterModal
import RegisterModal from "../Login/RegisterModal"
import "./Header.css"

const Header: React.FC = () => {
  const { getTotalItems } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [showCart, setShowCart] = useState(false)
  // Adicionar estado para controlar qual modal mostrar
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const handleLogout = () => {
    logout()
    setShowAdminPanel(false)
  }

  // Adicionar funções para alternar entre modais
  const handleSwitchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  const handleCloseModals = () => {
    setShowLogin(false)
    setShowRegister(false)
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h2>🌿 Natural Store</h2>
            </div>

            <nav className="nav">
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-greeting">
                    Olá, <strong>{user?.name}</strong>
                    {isAdmin && <span className="admin-badge">ADMIN</span>}
                  </span>

                  {isAdmin && (
                    <button className="nav-btn admin-btn pulse" onClick={() => setShowAdminPanel(true)}>
                      🔧 PAINEL ADMIN
                    </button>
                  )}

                  <button className="nav-btn logout-btn" onClick={handleLogout}>
                    🚪 Sair
                  </button>
                </div>
              ) : (
                <button className="nav-btn login-btn" onClick={() => setShowLogin(true)}>
                  👤 Login
                </button>
              )}

              <button className="cart-btn" onClick={() => setShowCart(true)}>
                🛒 Carrinho ({getTotalItems()})
              </button>
            </nav>
          </div>
        </div>
      </header>

      {showCart && <Cart onClose={() => setShowCart(false)} />}

      {showLogin && <LoginModal onClose={handleCloseModals} onSwitchToRegister={handleSwitchToRegister} />}

      {showRegister && <RegisterModal onClose={handleCloseModals} onSwitchToLogin={handleSwitchToLogin} />}

      {showAdminPanel && isAdmin && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </>
  )
}

export default Header
