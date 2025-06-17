"use client"

import type React from "react"
import { useState } from "react"
import { useProducts } from "../../contexts/ProductContext"
import type { Product } from "../../contexts/ProductContext"
import AddProductModal from "../Produtos/AddProductModal"
import EditProductModal from "../Produtos/EditProductModal"
import CategoryManager from "../Produtos/CategoryManager"
import "./AdminPanel.css"

interface AdminPanelProps {
  onClose: () => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { products, deleteProduct, updateProduct } = useProducts()
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [filter, setFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products")

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]
  const filteredProducts = filter === "all" ? products : products.filter((product) => product.category === filter)

  const handleToggleStock = (product: Product) => {
    updateProduct(product.id, { inStock: !product.inStock })
  }

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      deleteProduct(product.id)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="admin-panel">
          <div className="admin-header">
            <h2>🔧 Painel Administrativo</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              📦 Produtos
            </button>
            <button
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              🏷️ Categorias
            </button>
          </div>

          <div className="admin-content">
            {activeTab === "products" ? (
              <>
                <div className="admin-toolbar">
                  <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
                    ➕ Adicionar Produto
                  </button>

                  <div className="admin-filters">
                    <label>Filtrar por categoria:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "Todas" : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="products-table">
                  <div className="table-header">
                    <div>Produto</div>
                    <div>Categoria</div>
                    <div>Preço</div>
                    <div>Status</div>
                    <div>Ações</div>
                  </div>

                  <div className="table-body">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="table-row">
                        <div className="product-info">
                          <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-thumb" />
                          <div>
                            <h4>{product.name}</h4>
                            <p>{product.description.substring(0, 50)}...</p>
                          </div>
                        </div>

                        <div className="product-category">{product.category}</div>

                        <div className="product-price">R$ {product.price.toFixed(2).replace(".", ",")}</div>

                        <div className="product-status">
                          <span className={`status-badge ${product.inStock ? "in-stock" : "out-of-stock"}`}>
                            {product.inStock ? "Em Estoque" : "Fora de Estoque"}
                          </span>
                        </div>

                        <div className="product-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => setEditingProduct(product)}
                            title="Editar produto"
                          >
                            ✏️
                          </button>

                          <button
                            className={`action-btn toggle-btn ${product.inStock ? "deactivate" : "activate"}`}
                            onClick={() => handleToggleStock(product)}
                            title={product.inStock ? "Desativar produto" : "Ativar produto"}
                          >
                            {product.inStock ? "🔴" : "🟢"}
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteProduct(product)}
                            title="Excluir produto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="no-products">
                      <p>Nenhum produto encontrado.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <CategoryManager />
            )}
          </div>
        </div>
      </div>

      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}

      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
    </>
  )
}

export default AdminPanel
