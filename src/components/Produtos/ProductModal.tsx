"use client"

import type React from "react"
import { useState } from "react"
import type { Product } from "../../contexts/ProductContext"
import { useCart } from "../../contexts/CartContext"
import "./ProductModal.css"

interface ProductModalProps {
  product: Product
  onClose: () => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="product-modal">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-content">
          <div className="modal-image">
            <img src={product.image || "/placeholder.svg"} alt={product.name} />
            {!product.inStock && <div className="out-of-stock-badge">Fora de Estoque</div>}
          </div>

          <div className="modal-info">
            <div className="product-category-modal">{product.category}</div>
            <h2>{product.name}</h2>
            <p className="product-description-modal">{product.description}</p>

            {product.detailedDescription && (
              <div className="detailed-description">
                <h4>Descrição Detalhada:</h4>
                <p>{product.detailedDescription}</p>
              </div>
            )}

            <div className="product-details">
              <div className="ingredients">
                <h4>Ingredientes:</h4>
                <ul>
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="benefits">
                <h4>Benefícios:</h4>
                <ul>
                  {product.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="price-section">
              <div className="price">R$ {product.price.toFixed(2).replace(".", ",")}</div>

              {product.inStock && (
                <div className="quantity-section">
                  <label htmlFor="quantity">Quantidade:</label>
                  <div className="quantity-controls">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="quantity-btn">
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="quantity-btn">
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className={`add-to-cart-modal-btn ${!product.inStock ? "disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock
                ? `Adicionar ao Carrinho - R$ ${(product.price * quantity).toFixed(2).replace(".", ",")}`
                : "Produto Indisponível"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
