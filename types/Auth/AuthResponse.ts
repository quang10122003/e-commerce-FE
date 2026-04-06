export interface AuthResponse {
    userId: number
    email: string
    fullName: string
    role: string
    jwt: string
    accessToken: string
    refreshToken: string
    tokenType: string
}
