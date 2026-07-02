"use client"

import { CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { useResetPasswordMutation } from "@/client/api/backend-api"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { cn } from "@/lib/cn"
import { getApiResponseMessage } from "@/lib/error"
import { useSearchParams } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

type ResetPasswordFormValues = {
  password: string
  confirmPassword: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  /** Hiện mật khẩu mới dạng text hay dạng ẩn */
  const [showPassword, setShowPassword] = useState(false)

  /** Hiện nhập lại mật khẩu dạng text hay dạng ẩn */
  const [showConfirm, setShowConfirm] = useState(false)

  /** Đặt lại mật khẩu thành công — chuyển sang màn hình thành công */
  const [resetSuccess, setResetSuccess] = useState(false)

  const token = useSearchParams().get("token")!
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  // ─── React Hook Form ─────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  /** Theo dõi giá trị password để validate confirmPassword */
  const password = useWatch({ control, name: "password" })

  // ─── Submit handler ──────────────────────────────────────────────────────

  async function handleSubmitForm(data: ResetPasswordFormValues) {
    try {
      clearErrors("root")

      await resetPassword({
        token,   
        newPassword: data.password,
      }).unwrap()

      setResetSuccess(true)
    } catch (error) {
      setError("root", {
        type: "server",
        message: getApiResponseMessage(
          typeof error === "object" && error !== null && "data" in error
            ? (error as { data?: unknown }).data
            : null,
          "Không thể xử lý yêu cầu. Vui lòng thử lại."
        ),
      })
    }
  }

  // ─── Giao diện: Màn hình thành công ─────────────────────────────────────

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="surface-overlay w-full max-w-md p-6 sm:p-8">

          {/* Header */}
          <div className="mb-6 space-y-1">
            <p className="section-kicker">Account</p>
            <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
              Đặt lại mật khẩu
            </h1>
          </div>

          {/* Nội dung thành công */}
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            {/* Icon check xanh */}
            <CheckCircle2 className="size-14 text-emerald-500" strokeWidth={1.5} />

            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Mật khẩu đã được cập nhật!</p>
              <p className="text-sm text-slate-500">
                Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
              </p>
            </div>

            {/* Nút về trang đăng nhập */}
            <MainButton
              type="button"
              className="mt-2 h-12 w-full"
              // TODO: điều hướng về trang chủ hoặc mở modal login
              onClick={() => { }}
            >
              Về trang đăng nhập
            </MainButton>
          </div>

        </div>
      </div>
    )
  }

  // ─── Giao diện: Form đặt lại mật khẩu ──────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-overlay w-full max-w-md p-6 sm:p-8">

        {/* ── Header ── */}
        <div className="mb-6 space-y-2">
          <p className="section-kicker">Account</p>
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
            Đặt lại mật khẩu
          </h1>
          <p className="text-sm leading-7 text-slate-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {/* ── Form ── */}
        <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitForm)} noValidate>

          {/* Field: Mật khẩu mới */}
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                className={cn(
                  "pr-10",
                  errors.password &&
                  "border-[#efb4b4] focus-visible:border-[#dc2626] focus-visible:ring-[#fecaca]"
                )}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password", {
                  onChange: () => clearErrors("root"),
                  required: "Vui lòng nhập mật khẩu mới.",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự.",
                  },
                  maxLength: {
                    value: 100,
                    message: "Mật khẩu không được vượt quá 100 ký tự.",
                  },
                })}
              />
              {/* Nút toggle hiện/ẩn mật khẩu */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password?.message ? (
              <p id="password-error" className="text-sm leading-6 text-[#b42318]">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {/* Field: Nhập lại mật khẩu */}
          <div className="grid gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                className={cn(
                  "pr-10",
                  errors.confirmPassword &&
                  "border-[#efb4b4] focus-visible:border-[#dc2626] focus-visible:ring-[#fecaca]"
                )}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                {...register("confirmPassword", {
                  onChange: () => clearErrors("root"),
                  validate: (value) => {
                    if (!value) return "Vui lòng nhập lại mật khẩu."
                    return value === password ? true : "Mật khẩu nhập lại không khớp."
                  },
                })}
              />
              {/* Nút toggle hiện/ẩn nhập lại mật khẩu */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword?.message ? (
              <p id="confirm-error" className="text-sm leading-6 text-[#b42318]">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {/* Lỗi server — hiển thị trên nút submit */}
          {errors.root?.message ? (
            <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm leading-6 text-[#b42318]">
              {errors.root.message}
            </p>
          ) : null}

          {/* Nút submit */}
          <MainButton type="submit" className="mt-1 h-12" disabled={isLoading} fullWidth>
            {isLoading ? "Đang xử lý..." : "Xác nhận mật khẩu mới"}
          </MainButton>

        </form>
      </div>
    </div>
  )
}
