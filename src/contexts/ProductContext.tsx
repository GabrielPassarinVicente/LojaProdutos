"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

export interface Product {
  id: string
  name: string
  description: string
  detailedDescription?: string
  price: number
  image: string
  category: string
  inStock: boolean
  ingredients: string[]
  benefits: string[]
}

interface ProductContextType {
  products: Product[]
  categories: string[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProductById: (id: string) => Product | undefined
  addCategory: (category: string) => void
  deleteCategory: (category: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Óleo de Coco Orgânico",
    description: "Óleo de coco 100% puro e orgânico, ideal para cozinhar e cuidados com a pele.",
    detailedDescription:
      "Nosso óleo de coco orgânico é extraído a frio de cocos frescos cultivados em fazendas certificadas. Rico em ácido láurico e outros ácidos graxos de cadeia média, este óleo versátil pode ser usado tanto na culinária quanto em cuidados pessoais. Ideal para frituras em alta temperatura, preparo de doces, hidratação da pele e cabelos. Não contém conservantes, corantes ou aditivos químicos.",
    price: 29.9,
    image: "https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Óleo+de+Coco",
    category: "Óleos",
    inStock: true,
    ingredients: ["Óleo de coco orgânico"],
    benefits: ["Rico em ácidos graxos", "Propriedades antimicrobianas", "Hidratante natural"],
  },
  {
    id: "2",
    name: "Mel de Abelha Puro",
    description: "Mel puro de abelhas criadas em ambiente natural, sem aditivos químicos.",
    detailedDescription:
      "Mel artesanal coletado de colmeias localizadas em áreas preservadas, longe de agrotóxicos e poluição. Nossas abelhas se alimentam de flores silvestres, resultando em um mel com sabor único e propriedades terapêuticas excepcionais. Processo de extração a frio preserva todos os nutrientes, enzimas e propriedades antibacterianas naturais. Cristalização natural pode ocorrer, sendo um indicativo de pureza.",
    price: 35.5,
    image: "https://via.placeholder.com/300x300/FFC107/FFFFFF?text=Mel+Puro",
    category: "Mel",
    inStock: true,
    ingredients: ["Mel de abelha puro"],
    benefits: ["Antioxidante natural", "Propriedades antibacterianas", "Fonte de energia"],
  },
  {
    id: "3",
    name: "Chá Verde Orgânico",
    description: "Chá verde de folhas selecionadas, cultivado organicamente.",
    detailedDescription:
      "Folhas de chá verde (Camellia sinensis) cultivadas em altitude, em solo rico e livre de pesticidas. Colheita manual das folhas mais jovens e tenras, processadas imediatamente para preservar os antioxidantes. Rico em catequinas, especialmente EGCG, que contribuem para o metabolismo e bem-estar geral. Sabor suave e refrescante, ideal para consumo ao longo do dia.",
    price: 18.9,
    image: "https://via.placeholder.com/300x300/8BC34A/FFFFFF?text=Chá+Verde",
    category: "Chás",
    inStock: true,
    ingredients: ["Folhas de chá verde orgânico"],
    benefits: ["Rico em antioxidantes", "Acelera o metabolismo", "Melhora a concentração"],
  },
  {
    id: "4",
    name: "Açúcar de Coco",
    description: "Açúcar natural extraído da seiva do coqueiro, baixo índice glicêmico.",
    detailedDescription:
      "Açúcar natural obtido através da evaporação da seiva fresca das flores do coqueiro. Processo artesanal que preserva minerais como potássio, magnésio, zinco e ferro. Com índice glicêmico mais baixo que o açúcar refinado, é uma alternativa mais saudável para adoçar bebidas, sobremesas e receitas. Sabor caramelizado suave que realça o sabor dos alimentos sem mascarar.",
    price: 22.9,
    image: "https://via.placeholder.com/300x300/795548/FFFFFF?text=Açúcar+Coco",
    category: "Adoçantes",
    inStock: false,
    ingredients: ["Açúcar de coco natural"],
    benefits: ["Baixo índice glicêmico", "Rico em minerais", "Sabor caramelizado"],
  },
]

const initialCategories = ["Óleos", "Mel", "Chás", "Adoçantes", "Suplementos", "Cosméticos"]

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<string[]>(initialCategories)

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...productData } : product)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id)
  }

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category])
    }
  }

  const deleteCategory = (category: string) => {
    // Verificar se há produtos usando esta categoria
    const productsWithCategory = products.filter((product) => product.category === category)

    if (productsWithCategory.length > 0) {
      alert(
        `Não é possível excluir a categoria "${category}" pois existem ${productsWithCategory.length} produto(s) usando ela.`,
      )
      return
    }

    setCategories((prev) => prev.filter((cat) => cat !== category))
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
