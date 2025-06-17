"use client"

import type React from "react"
import { useState } from "react"
import { useProducts } from "../../contexts/ProductContext"
import ProductCard from "./ProductCard"
import ProductModal from "./ProductModal"
import type { Product } from "../../contexts/ProductContext"
import "./ProductList.css"

const ProductList: React.FC = () => {
  const { products } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState("all")

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = filter === "all" ? products : products.filter((product) => product.category === filter)

  return (
    <section className="product-list-section">
      <div className="container">
        <div className="section-header">
          <h2>Nossos Produtos</h2>

          <div className="filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${filter === category ? "active" : ""}`}
                onClick={() => setFilter(category)}
              >
                {category === "all" ? "Todos" : category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onViewDetails={() => setSelectedProduct(product)} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </section>
  )
}

export default ProductList
