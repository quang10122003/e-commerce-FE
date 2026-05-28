/**
 * Layout riêng cho route đặt lại mật khẩu.
 * Mục đích: tách biệt khỏi root layout để KHÔNG kế thừa
 * các thành phần global như Header, Footer, AuthModal, v.v.
 *
 * Đặt file này tại: app/reset-password/layout.tsx
 * (hoặc bất kỳ route segment nào chứa trang đặt lại mật khẩu)
 */

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
