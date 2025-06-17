// Simulação de serviços de pagamento
export interface PaymentResponse {
  success: boolean
  method?: "credit" | "debit" | "pix" | "boleto"
  transactionId?: string
  pixQrCode?: string
  pixCode?: string
  boletoUrl?: string
  boletoBarCode?: string
  message: string
  expiresAt?: Date
}

export interface PaymentData {
  method: "credit" | "debit" | "pix" | "boleto"
  amount: number
  orderId: string
  customer: {
    name: string
    email: string
    document: string
    phone: string
  }
  card?: {
    number: string
    name: string
    expiry: string
    cvv: string
    installments: number
  }
}

class PaymentService {
  // Simular processamento de cartão de crédito/débito
  async processCardPayment(data: PaymentData): Promise<PaymentResponse> {
    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Validações básicas do cartão
    if (!data.card) {
      return { success: false, message: "Dados do cartão não fornecidos" }
    }

    // Simular validação do cartão
    const cardNumber = data.card.number.replace(/\s/g, "")

    // Cartões de teste que sempre aprovam
    const testCards = ["4111111111111111", "5555555555554444", "4000000000000002"]

    if (testCards.includes(cardNumber)) {
      return {
        success: true,
        method: data.method,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Pagamento aprovado com sucesso!",
      }
    }

    // Simular algumas rejeições para demonstração
    const random = Math.random()
    if (random < 0.1) {
      return { success: false, message: "Cartão recusado - Saldo insuficiente" }
    } else if (random < 0.15) {
      return { success: false, message: "Cartão recusado - Dados inválidos" }
    }

    return {
      success: true,
      method: data.method,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: "Pagamento aprovado com sucesso!",
    }
  }

  // Simular geração de PIX
  async generatePix(data: PaymentData): Promise<PaymentResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const pixCode = this.generatePixCode(data.amount, data.orderId)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`

    return {
      success: true,
      method: "pix",
      pixQrCode: qrCodeUrl,
      pixCode: pixCode,
      message: "PIX gerado com sucesso! Escaneie o QR Code ou copie o código.",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
    }
  }

  // Simular geração de boleto
  async generateBoleto(data: PaymentData): Promise<PaymentResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const barCode = this.generateBoletoBarCode(data.amount, data.orderId)
    const boletoUrl = `#boleto-${data.orderId}` // Em produção seria uma URL real

    return {
      success: true,
      method: "boleto",
      boletoUrl: boletoUrl,
      boletoBarCode: barCode,
      message: "Boleto gerado com sucesso! Pague até o vencimento.",
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
    }
  }

  // Gerar código PIX simulado
  private generatePixCode(amount: number, orderId: string): string {
    const payload = {
      version: "01",
      initMethod: "12",
      merchant: {
        name: "NATURAL STORE LTDA",
        city: "SAO PAULO",
      },
      amount: amount.toFixed(2),
      reference: orderId,
      crc: "0000",
    }

    // Simular código PIX (em produção usaria biblioteca específica)
    return `00020126580014BR.GOV.BCB.PIX0136${orderId}520400005303986540${payload.amount}5802BR5913${payload.merchant.name}6009${payload.merchant.city}62070503***6304${payload.crc}`
  }

  // Gerar código de barras do boleto simulado
  private generateBoletoBarCode(amount: number, orderId: string): string {
    const bank = "341" // Itaú (exemplo)
    const currency = "9"
    const dueDate = "9999" // Dias desde 07/10/1997
    const amountStr = amount.toFixed(2).replace(".", "").padStart(10, "0")
    const ourNumber = orderId.padStart(10, "0")

    return `${bank}${currency}${dueDate}${amountStr}${ourNumber}000000000000000000000000000`
  }

  // Verificar status do pagamento PIX
  async checkPixPayment(transactionId: string): Promise<{ paid: boolean; paidAt?: Date }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simular que alguns pagamentos são confirmados automaticamente após um tempo
    const random = Math.random()
    if (random < 0.3) {
      return { paid: true, paidAt: new Date() }
    }

    return { paid: false }
  }
}

export const paymentService = new PaymentService()
