declare global {
  export interface IAppError extends Error {
    statusCode: number
    isOperational: boolean
    status: string
  }
}
export {}
