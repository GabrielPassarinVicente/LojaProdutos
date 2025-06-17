"use client"
import { useState, useEffect } from "react"
import { paymentService, type PaymentData, type PaymentResponse } from "../../services/ServicoPagamento"
import "./Pagamento.css"

interface PaymentProcessorProps {
  paymentData: PaymentData
  onSuccess: (response: PaymentResponse) => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function PaymentProcessor({ paymentData, onSuccess, onError, onCancel }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null)
  const [pixTimer, setPixTimer] = useState<number>(0)
  const [checkingPix, setCheckingPix] = useState(false)

  useEffect(() => {
    processPayment()
  }, [])

  // Timer para PIX
  useEffect(() => {
    if (paymentData.method === "pix" && paymentResponse?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expires = paymentResponse.expiresAt!.getTime()
        const remaining = Math.max(0, expires - now)

        setPixTimer(Math.floor(remaining / 1000))

        if (remaining <= 0) {
          clearInterval(interval)
          onError("PIX expirado. Gere um novo código.")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [paymentResponse, paymentData.method])

  const processPayment = async () => {
    setIsProcessing(true)

    try {
      let response: PaymentResponse

      switch (paymentData.method) {
        case "credit":
        case "debit":
          response = await paymentService.processCardPayment(paymentData)
          break
        case "pix":
          response = await paymentService.generatePix(paymentData)
          break
        case "boleto":
          response = await paymentService.generateBoleto(paymentData)
          break
        default:
          throw new Error("Método de pagamento não suportado")
      }

      setPaymentResponse(response)

      if (response.success) {
        if (paymentData.method === "credit" || paymentData.method === "debit") {
          // Para cartão, sucesso imediato
          setTimeout(() => onSuccess(response), 1000)
        }
      } else {
        onError(response.message)
      }
    } catch (error) {
      onError("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const checkPixStatus = async () => {
    if (!paymentResponse?.transactionId) return

    setCheckingPix(true)
    try {
      const status = await paymentService.checkPixPayment(paymentResponse.transactionId)
      if (status.paid) {
        onSuccess({ ...paymentResponse, message: "Pagamento PIX confirmado!" })
      } else {
        alert("Pagamento ainda não foi detectado. Tente novamente em alguns segundos.")
      }
    } catch (error) {
      alert("Erro ao verificar pagamento.")
    } finally {
      setCheckingPix(false)
    }
  }

  const copyPixCode = () => {
    if (paymentResponse?.pixCode) {
      navigator.clipboard.writeText(paymentResponse.pixCode)
      alert("Código PIX copiado!")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isProcessing) {
    return (
      <div className="payment-processor">
        <div className="processing-animation">
          <div className="spinner"></div>
          <h3>Processando pagamento...</h3>
          <p>Aguarde enquanto processamos seu pagamento</p>
        </div>
      </div>
    )
  }

  if (!paymentResponse) {
    return (
      <div className="payment-processor">
        <div className="error-state">
          <h3>❌ Erro no processamento</h3>
          <button className="btn btn-primary" onClick={processPayment}>
            Tentar Novamente
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-processor">
      {/* Cartão de Crédito/Débito */}
      {(paymentData.method === "credit" || paymentData.method === "debit") && (
        <div className="card-success">
          <div className="success-icon">✅</div>
          <h3>Pagamento Aprovado!</h3>
          <p>Transação: {paymentResponse.transactionId}</p>
          <p>Seu pedido foi confirmado com sucesso.</p>
        </div>
      )}

      {/* PIX */}
      {paymentData.method === "pix" && (
        <div className="pix-payment">
          <div className="pix-header">
            <h3>📱 Pagamento via PIX</h3>
            <div className="pix-timer">⏰ Expira em: {formatTime(pixTimer)}</div>
          </div>

          <div className="pix-content">
            <div className="qr-code-section">
              <h4>Escaneie o QR Code:</h4>
              <div className="qr-code">
                <img src={paymentResponse.pixQrCode || "/placeholder.svg"} alt="QR Code PIX" />
              </div>
            </div>

            <div className="pix-code-section">
              <h4>Ou copie o código PIX:</h4>
              <div className="pix-code-container">
                <textarea value={paymentResponse.pixCode} readOnly className="pix-code-text" />
                <button className="btn btn-primary" onClick={copyPixCode}>
                  📋 Copiar Código
                </button>
              </div>
            </div>

            <div className="pix-instructions">
              <h4>Como pagar:</h4>
              <ol>
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            <div className="pix-actions">
              <button className="btn btn-success" onClick={checkPixStatus} disabled={checkingPix}>
                {checkingPix ? "🔄 Verificando..." : "✅ Já Paguei"}
              </button>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boleto */}
      {paymentData.method === "boleto" && (
        <div className="boleto-payment">
          <div className="boleto-header">
            <h3>📄 Boleto Bancário</h3>
            <p>Vencimento: {paymentResponse.expiresAt?.toLocaleDateString("pt-BR")}</p>
          </div>

          <div className="boleto-content">
            <div className="barcode-section">
              <h4>Código de Barras:</h4>
              <div className="barcode-container">
                <input type="text" value={paymentResponse.boletoBarCode} readOnly className="barcode-input" />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentResponse.boletoBarCode!)
                    alert("Código copiado!")
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            </div>

            <div className="boleto-instructions">
              <h4>Como pagar:</h4>
              <ul>
                <li>Acesse o internet banking do seu banco</li>
                <li>Escolha a opção "Pagar Boleto"</li>
                <li>Digite ou cole o código de barras</li>
                <li>Confirme o pagamento até o vencimento</li>
              </ul>
            </div>

            <div className="boleto-actions">
              <a href={paymentResponse.boletoUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                📄 Visualizar Boleto
              </a>
              <button className="btn btn-success" onClick={() => onSuccess(paymentResponse)}>
                ✅ Confirmar Pedido
              </button>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
