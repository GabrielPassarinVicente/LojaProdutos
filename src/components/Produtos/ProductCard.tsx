"use client"

import type React from "react"
import type { Product } from "../../contexts/ProductContext"
import { useCart } from "../../contexts/CartContext"
import "./ProductCard.css"

interface ProductCardProps {
  product: Product
  onViewDetails: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <div className="product-card" onClick={onViewDetails}>
      <div className="product-image">
        <img src={product.image || "/placeholder.svg"} alt={product.name} />
        {!product.inStock && <div className="out-of-stock">Fora de Estoque</div>}
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div className="product-price">R$ {product.price.toFixed(2).replace(".", ",")}</div>

          <button
            className={`add-to-cart-btn ${!product.inStock ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? "Adicionar" : "Indisponível"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
