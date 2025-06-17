"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "../../contexts/CartContext"
import Checkout from "../Checkout/Checkout"
import "./Cart.css"

interface CartProps {
  onClose: () => void
}

export default function Cart({ onClose }: CartProps) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handleCloseCheckout = () => {
    setShowCheckout(false)
    onClose()
  }

  if (showCheckout) {
    return <Checkout onClose={handleCloseCheckout} />
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="cart-modal">
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Seu carrinho está vazio</p>
              <button className="btn btn-primary" onClick={onClose}>
                Continuar Comprando
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.product.id} className="cart-item">
                    <img src={item.product.image || "/placeholder.svg"} alt={item.product.name} />

                    <div className="item-info">
                      <h4>{item.product.name}</h4>
                      <p className="item-category">{item.product.category}</p>
                      <p className="item-price">R$ {item.product.price.toFixed(2).replace(".", ",")}</p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                    </div>

                    <button onClick={() => removeFromCart(item.product.id)} className="remove-btn">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <h3>Total: R$ {getTotalPrice().toFixed(2).replace(".", ",")}</h3>
                </div>

                <div className="cart-actions">
                  <button className="btn btn-secondary" onClick={clearCart}>
                    Limpar Carrinho
                  </button>
                  <button className="btn btn-primary" onClick={handleCheckout}>
                    🛒 Finalizar Compra
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
