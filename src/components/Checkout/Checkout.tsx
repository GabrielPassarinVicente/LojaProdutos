"use client"

import type React from "react"
import { useState } from "react"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../contexts/AuthContext"
import PaymentProcessor from "../../components/Pagamento/Pagamento"
import type { PaymentData, PaymentResponse } from "../../services/ServicoPagamento"
import "./Checkout.css"

interface CheckoutProps {
  onClose: () => void
}

interface ShippingData {
  fullName: string
  email: string
  phone: string
  zipCode: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface PaymentFormData {
  method: "credit" | "debit" | "pix" | "boleto"
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvv: string
  installments: number
}

export default function Checkout({ onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [shippingData, setShippingData] = useState<ShippingData>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    zipCode: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    method: "credit",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    installments: 1,
  })

  const shippingCost = 15.9
  const totalWithShipping = getTotalPrice() + shippingCost

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleZipCodeBlur = async () => {
    if (shippingData.zipCode.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${shippingData.zipCode}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setShippingData((prev) => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    }
  }

  const validateStep1 = () => {
    return (
      shippingData.fullName &&
      shippingData.email &&
      shippingData.phone &&
      shippingData.zipCode &&
      shippingData.address &&
      shippingData.number &&
      shippingData.neighborhood &&
      shippingData.city &&
      shippingData.state
    )
  }

  const validateStep2 = () => {
    if (paymentFormData.method === "pix" || paymentFormData.method === "boleto") {
      return true
    }
    return (
      paymentFormData.cardNumber && paymentFormData.cardName && paymentFormData.cardExpiry && paymentFormData.cardCvv
    )
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleProcessPayment = () => {
    setIsProcessingPayment(true)
  }

  const handlePaymentSuccess = (response: PaymentResponse) => {
    const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase()

    alert(
      `🎉 Pedido realizado com sucesso!\n\nNúmero do pedido: ${orderNumber}\nTransação: ${response.transactionId || "N/A"}\n\nVocê receberá um email com os detalhes do pedido.`,
    )

    clearCart()
    onClose()
  }

  const handlePaymentError = (error: string) => {
    alert(`❌ Erro no pagamento: ${error}`)
    setIsProcessingPayment(false)
  }

  const handlePaymentCancel = () => {
    setIsProcessingPayment(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2")
  }

  // Se está processando pagamento, mostrar o PaymentProcessor
  if (isProcessingPayment) {
    const orderId = `ORDER_${Date.now()}`

    const paymentData: PaymentData = {
      method: paymentFormData.method,
      amount: totalWithShipping,
      orderId: orderId,
      customer: {
        name: shippingData.fullName,
        email: shippingData.email,
        document: "000.000.000-00", // Em produção, coletar CPF
        phone: shippingData.phone,
      },
      card:
        paymentFormData.method === "credit" || paymentFormData.method === "debit"
          ? {
              number: paymentFormData.cardNumber,
              name: paymentFormData.cardName,
              expiry: paymentFormData.cardExpiry,
              cvv: paymentFormData.cardCvv,
              installments: paymentFormData.installments,
            }
          : undefined,
    }

    return (
      <div className="modal-overlay">
        <div className="payment-modal">
          <PaymentProcessor
            paymentData={paymentData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>🛒 Finalizar Compra</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="checkout-progress">
          <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
            <span>1</span>
            <label>Entrega</label>
          </div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
            <span>2</span>
            <label>Pagamento</label>
          </div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
            <span>3</span>
            <label>Confirmação</label>
          </div>
        </div>

        <div className="checkout-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h3>📦 Dados de Entrega</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingData.fullName}
                    onChange={handleShippingChange}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingData.email}
                    onChange={handleShippingChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingData.zipCode}
                    onChange={handleShippingChange}
                    onBlur={handleZipCodeBlur}
                    placeholder="00000-000"
                    maxLength={8}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Endereço *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingData.address}
                    onChange={handleShippingChange}
                    placeholder="Rua, Avenida..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número *</label>
                  <input
                    type="text"
                    name="number"
                    value={shippingData.number}
                    onChange={handleShippingChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    name="complement"
                    value={shippingData.complement}
                    onChange={handleShippingChange}
                    placeholder="Apto, Bloco..."
                  />
                </div>
                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={shippingData.neighborhood}
                    onChange={handleShippingChange}
                    placeholder="Bairro"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    placeholder="Cidade"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select name="state" value={shippingData.state} onChange={handleShippingChange} required>
                    <option value="">Selecione</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h3>💳 Forma de Pagamento</h3>

              <div className="payment-methods">
                <label className={`payment-method ${paymentFormData.method === "credit" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value="credit"
                    checked={paymentFormData.method === "credit"}
                    onChange={handlePaymentChange}
                  />
                  <span>💳 Cartão de Crédito</span>
                </label>

                <label className={`payment-method ${paymentFormData.method === "debit" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value="debit"
                    checked={paymentFormData.method === "debit"}
                    onChange={handlePaymentChange}
                  />
                  <span>💳 Cartão de Débito</span>
                </label>

                <label className={`payment-method ${paymentFormData.method === "pix" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value="pix"
                    checked={paymentFormData.method === "pix"}
                    onChange={handlePaymentChange}
                  />
                  <span>📱 PIX</span>
                </label>

                <label className={`payment-method ${paymentFormData.method === "boleto" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value="boleto"
                    checked={paymentFormData.method === "boleto"}
                    onChange={handlePaymentChange}
                  />
                  <span>📄 Boleto</span>
                </label>
              </div>

              {(paymentFormData.method === "credit" || paymentFormData.method === "debit") && (
                <div className="card-form">
                  <div className="test-cards-info">
                    <h4>🧪 Cartões de Teste:</h4>
                    <p>Use estes números para testar:</p>
                    <ul>
                      <li>
                        <strong>4111 1111 1111 1111</strong> - Visa (Aprovado)
                      </li>
                      <li>
                        <strong>5555 5555 5555 4444</strong> - Mastercard (Aprovado)
                      </li>
                      <li>
                        <strong>4000 0000 0000 0002</strong> - Visa (Aprovado)
                      </li>
                    </ul>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Número do Cartão *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formatCardNumber(paymentFormData.cardNumber)}
                        onChange={(e) =>
                          setPaymentFormData((prev) => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, "") }))
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome no Cartão *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentFormData.cardName}
                        onChange={handlePaymentChange}
                        placeholder="Nome como está no cartão"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Validade *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formatExpiry(paymentFormData.cardExpiry)}
                        onChange={(e) => setPaymentFormData((prev) => ({ ...prev, cardExpiry: e.target.value }))}
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cardCvv"
                        value={paymentFormData.cardCvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {paymentFormData.method === "credit" && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Parcelas</label>
                        <select name="installments" value={paymentFormData.installments} onChange={handlePaymentChange}>
                          <option value={1}>1x de R$ {totalWithShipping.toFixed(2).replace(".", ",")}</option>
                          <option value={2}>2x de R$ {(totalWithShipping / 2).toFixed(2).replace(".", ",")}</option>
                          <option value={3}>3x de R$ {(totalWithShipping / 3).toFixed(2).replace(".", ",")}</option>
                          <option value={6}>6x de R$ {(totalWithShipping / 6).toFixed(2).replace(".", ",")}</option>
                          <option value={12}>12x de R$ {(totalWithShipping / 12).toFixed(2).replace(".", ",")}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentFormData.method === "pix" && (
                <div className="pix-info">
                  <div className="info-card">
                    <h4>📱 Pagamento via PIX</h4>
                    <p>Após confirmar o pedido, você receberá um QR Code para pagamento via PIX.</p>
                    <p>O pagamento deve ser realizado em até 30 minutos.</p>
                  </div>
                </div>
              )}

              {paymentFormData.method === "boleto" && (
                <div className="boleto-info">
                  <div className="info-card">
                    <h4>📄 Pagamento via Boleto</h4>
                    <p>Após confirmar o pedido, você receberá um boleto para pagamento.</p>
                    <p>O boleto tem vencimento em 3 dias úteis.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h3>✅ Confirmação do Pedido</h3>

              <div className="order-summary">
                <div className="summary-section">
                  <h4>📦 Entrega</h4>
                  <p>
                    <strong>{shippingData.fullName}</strong>
                  </p>
                  <p>
                    {shippingData.address}, {shippingData.number}
                  </p>
                  {shippingData.complement && <p>{shippingData.complement}</p>}
                  <p>
                    {shippingData.neighborhood} - {shippingData.city}/{shippingData.state}
                  </p>
                  <p>CEP: {shippingData.zipCode}</p>
                </div>

                <div className="summary-section">
                  <h4>💳 Pagamento</h4>
                  <p>
                    {paymentFormData.method === "credit" && "💳 Cartão de Crédito"}
                    {paymentFormData.method === "debit" && "💳 Cartão de Débito"}
                    {paymentFormData.method === "pix" && "📱 PIX"}
                    {paymentFormData.method === "boleto" && "📄 Boleto"}
                  </p>
                  {(paymentFormData.method === "credit" || paymentFormData.method === "debit") && (
                    <p>**** **** **** {paymentFormData.cardNumber.slice(-4)}</p>
                  )}
                  {paymentFormData.method === "credit" && paymentFormData.installments > 1 && (
                    <p>
                      {paymentFormData.installments}x de R${" "}
                      {(totalWithShipping / paymentFormData.installments).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>

                <div className="summary-section">
                  <h4>🛒 Produtos</h4>
                  {items.map((item) => (
                    <div key={item.product.id} className="order-item">
                      <span>
                        {item.quantity}x {item.product.name}
                      </span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-sidebar">
          <div className="order-total">
            <h4>📋 Resumo do Pedido</h4>

            <div className="total-line">
              <span>Subtotal:</span>
              <span>R$ {getTotalPrice().toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="total-line">
              <span>Frete:</span>
              <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="total-line total">
              <span>Total:</span>
              <span>R$ {totalWithShipping.toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="checkout-actions">
              {currentStep > 1 && (
                <button className="btn btn-secondary" onClick={handlePreviousStep}>
                  ← Voltar
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={currentStep === 1 ? !validateStep1() : !validateStep2()}
                >
                  Continuar →
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleProcessPayment}>
                  🎉 Processar Pagamento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
