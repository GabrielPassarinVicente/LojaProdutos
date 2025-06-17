"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

// Interface para dados de registro
interface RegisterData {
  name: string
  email: string
  password: string
}

// Interface completa do contexto de autenticação
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuários de exemplo (em produção, isso viria de uma API)
const mockUsers: Array<User & { password: string }> = [
  {
    id: "1",
    email: "admin@naturalstore.com",
    password: "admin123",
    name: "Administrador",
    role: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "João Silva",
    role: "user",
  },
]

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      return true
    }

    return false
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar se email já existe
    const existingUser = mockUsers.find((u) => u.email === data.email)
    if (existingUser) {
      return { success: false, message: "Este email já está cadastrado" }
    }

    // Determinar role baseado no email (admin se contém 'admin')
    const role: "admin" | "user" = data.email.toLowerCase().includes("admin") ? "admin" : "user"

    // Criar novo usuário
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: role,
    }

    // Adicionar à lista de usuários (em produção seria salvo no banco)
    mockUsers.push(newUser)

    // Fazer login automático
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)

    return { success: true, message: "Cadastro realizado com sucesso!" }
  }

  const logout = () => {
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
