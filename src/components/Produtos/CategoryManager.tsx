"use client"

import type React from "react"
import { useState } from "react"
import { useProducts } from "../../contexts/ProductContext"
import "./CategoryManager.css"

const CategoryManager: React.FC = () => {
  const { categories, products, addCategory, deleteCategory } = useProducts()
  const [newCategory, setNewCategory] = useState("")

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.trim()) {
      alert("Por favor, digite o nome da categoria.")
      return
    }

    if (categories.includes(newCategory.trim())) {
      alert("Esta categoria já existe.")
      return
    }

    addCategory(newCategory.trim())
    setNewCategory("")
    alert("Categoria adicionada com sucesso!")
  }

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
      deleteCategory(category)
    }
  }

  const getCategoryProductCount = (category: string) => {
    return products.filter((product) => product.category === category).length
  }

  return (
    <div className="category-manager">
      <div className="category-form-section">
        <h3>➕ Adicionar Nova Categoria</h3>
        <form onSubmit={handleAddCategory} className="category-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nome da categoria (ex: Vitaminas, Ervas, etc.)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="category-input"
            />
            <button type="submit" className="btn btn-primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="categories-list-section">
        <h3>🏷️ Categorias Existentes</h3>
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category} className="category-card">
              <div className="category-info">
                <h4>{category}</h4>
                <p>{getCategoryProductCount(category)} produto(s)</p>
              </div>
              <button
                className="delete-category-btn"
                onClick={() => handleDeleteCategory(category)}
                title={`Excluir categoria ${category}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="no-categories">
            <p>Nenhuma categoria cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryManager
