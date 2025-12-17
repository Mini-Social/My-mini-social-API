class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public status: string
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.status = `${statusCode}`.startsWith(`4`) ? `fail` : `error`
  }
}
export default AppError
