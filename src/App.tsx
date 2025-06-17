import { ProductProvider } from "./contexts/ProductContext"
import { CartProvider } from "./contexts/CartContext"
import { AuthProvider } from "./contexts/AuthContext"
import Home from "./pages/Home"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <div className="App">
            <Home />
          </div>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
