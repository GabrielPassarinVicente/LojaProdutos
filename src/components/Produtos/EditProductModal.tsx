"use client"

import type React from "react"
import { useState } from "react"
import { useProducts } from "../../contexts/ProductContext"
import type { Product } from "../../contexts/ProductContext"
import "./AddProductModal.css"

interface EditProductModalProps {
  product: Product
  onClose: () => void
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const { updateProduct, categories, addCategory } = useProducts()
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    detailedDescription: product.detailedDescription || "",
    price: product.price.toString(),
    image: product.image,
    category: product.category,
    newCategory: "",
    inStock: product.inStock,
    ingredients: product.ingredients.join(", "),
    benefits: product.benefits.join(", "),
  })
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let selectedCategory = formData.category

    // Se escolheu "Nova categoria", usar a categoria digitada
    if (formData.category === "new" && formData.newCategory.trim()) {
      selectedCategory = formData.newCategory.trim()
      addCategory(selectedCategory)
    }

    if (!formData.name || !formData.description || !formData.price || !selectedCategory) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const updatedProduct = {
      name: formData.name,
      description: formData.description,
      detailedDescription: formData.detailedDescription,
      price: Number.parseFloat(formData.price),
      image:
        formData.image || `https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=${encodeURIComponent(formData.name)}`,
      category: selectedCategory,
      inStock: formData.inStock,
      ingredients: formData.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      benefits: formData.benefits
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    }

    updateProduct(product.id, updatedProduct)
    alert("Produto atualizado com sucesso!")
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (name === "category") {
      setShowNewCategoryInput(value === "new")
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Editar Produto</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Nome do Produto *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria *</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">➕ Nova categoria</option>
            </select>
          </div>

          {showNewCategoryInput && (
            <div className="form-group">
              <label htmlFor="newCategory">Nome da Nova Categoria *</label>
              <input
                type="text"
                id="newCategory"
                name="newCategory"
                value={formData.newCategory}
                onChange={handleChange}
                placeholder="Digite o nome da nova categoria"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="price">Preço (R$) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="detailedDescription">Descrição Detalhada</label>
            <textarea
              id="detailedDescription"
              name="detailedDescription"
              value={formData.detailedDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Descrição completa do produto, características, modo de uso, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagem do Produto</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <small className="field-hint">
              Cole a URL de uma imagem ou use um serviço como Imgur, Google Drive, etc.
            </small>
            {formData.image && (
              <div className="image-preview">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredientes (separados por vírgula)</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows={2}
              placeholder="Ingrediente 1, Ingrediente 2, Ingrediente 3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="benefits">Benefícios (separados por vírgula)</label>
            <textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows={2}
              placeholder="Benefício 1, Benefício 2, Benefício 3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="inStock" className="checkbox-label">
              <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} />
              Produto em estoque
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProductModal
