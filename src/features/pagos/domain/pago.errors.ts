// domain/pago.errors.ts

export class PagoNotFoundError extends Error {
  constructor(id: string) {
    super(`Pago no encontrado: ${id}`)
    this.name = 'PagoNotFoundError'
  }
}

export class PagoDuplicadoError extends Error {
  constructor(key: string) {
    super(`Pago duplicado para: ${key}`)
    this.name = 'PagoDuplicadoError'
  }
}

export class PagoInvalidoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PagoInvalidoError'
  }
}
