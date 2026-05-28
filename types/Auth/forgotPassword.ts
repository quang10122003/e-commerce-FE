export interface ForgotPasswordRequest {
    email: string;
    captchaToken: string;
}
export interface ResetPasswordRequest {
    token: string
    newPassword: string
}