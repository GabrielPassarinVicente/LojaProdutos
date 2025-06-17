import type React from "react"
import Header from "../components/Header/Header"
import ProductList from "../components/Produtos/ProductList"
import "./Home.css"

const Home: React.FC = () => {
  return (
    <div className="home">
      <Header />
      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1>Produtos Naturais</h1>
            <p>Descubra nossa seleção de produtos 100% naturais para sua saúde e bem-estar</p>
          </div>
        </section>
        <ProductList />
      </main>
    </div>
  )
}

export default Home
