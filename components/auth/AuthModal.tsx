"use client"

import { useState } from "react"
import { X, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { RegisterOptions, useForm, useWatch } from "react-hook-form"
import { Turnstile } from "@marsidev/react-turnstile"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  backendApi,
  useForgotPasswordMutation,
  useLoginMutation,
  useSignupMutation,
} from "@/client/api/backend-api"
import { closeLogin } from "@/client/session/loginModalSlice"
import {
  clearPendingRedirectUrls,
  popPendingRedirectUrl,
} from "@/client/session/redirect-stack"
import { setAuthenticatedUser } from "@/client/session/sessionSlice"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { useNotification } from "@/components/ui/NotificationProvider"
import { cn } from "@/lib/cn"
import { extractErrorMessage } from "@/lib/error"

// ─── Types ────────────────────────────────────────────────────────────────────

/** 3 trạng thái giao diện của modal */
type AuthMode = "login" | "register" | "forgot"

/** Giá trị form dùng chung cho login & register */
type AuthFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

/** Giá trị form riêng cho quên mật khẩu */
type ForgotFormValues = {
  email: string
}

type FieldName = keyof AuthFormValues

type FieldConfig = {
  name: FieldName
  label: string
  placeholder: string
  type?: "text" | "email" | "password"
}

// ─── Hằng số copy text theo từng mode ─────────────────────────────────────────

const FORM_COPY = {
  login: {
    title: "Đăng nhập",
    subtitle: "Đăng nhập hoặc tạo tài khoản để tiếp tục trải nghiệm mua sắm.",
    submitLabel: "Đăng nhập",
    switchText: "Chưa có tài khoản?",
    switchActionLabel: "Đăng ký",
  },
  register: {
    title: "Tạo tài khoản mới",
    subtitle: "Đăng nhập hoặc tạo tài khoản để tiếp tục trải nghiệm mua sắm.",
    submitLabel: "Đăng ký",
    switchText: "Đã có tài khoản?",
    switchActionLabel: "Đăng nhập",
  },
  forgot: {
    title: "Quên mật khẩu",
    subtitle: "Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.",
    submitLabel: "Gửi yêu cầu",
    switchText: "Nhớ mật khẩu rồi?",
    switchActionLabel: "Đăng nhập",
  },
}

// ─── Cấu hình fields ───────────────────────────────────────────────────────────

const LOGIN_FIELDS: FieldConfig[] = [
  { name: "email", label: "Email", type: "email", placeholder: "Nhập email" },
  { name: "password", label: "Mật khẩu", type: "password", placeholder: "Nhập mật khẩu" },
]

const REGISTER_FIELDS: FieldConfig[] = [
  { name: "fullName", label: "Họ và tên", placeholder: "Nhập họ và tên" },
  ...LOGIN_FIELDS,
  {
    name: "confirmPassword",
    label: "Nhập lại mật khẩu",
    type: "password",
    placeholder: "Nhập lại mật khẩu",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthModal() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  /** Trạng thái mở/đóng modal từ Redux */
  const isOpen = useAppSelector((state) => state.login.isOpen)

  /** Trạng thái giao diện hiện tại: login | register | forgot */
  const [mode, setMode] = useState<AuthMode>("login")

  /** Token captcha Cloudflare Turnstile (chỉ dùng ở màn forgot) */
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  /** Hiển thị màn hình thành công sau khi gửi email quên mật khẩu */
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // ─── RTK Query mutations ───────────────────────────────────────────────────

  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation()
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation()

  const { showNotification } = useNotification()

  // ─── Derived state ─────────────────────────────────────────────────────────

  const isRegisterMode = mode === "register"
  const isForgotMode = mode === "forgot"
  const isLoginMode = mode === "login"

  /** Đang submit form login hoặc register */
  const isAuthSubmitting = isLoginLoading || isSignupLoading

  const formCopy = FORM_COPY[mode]

  /** Danh sách fields hiển thị tuỳ theo mode */
  const fields = isRegisterMode ? REGISTER_FIELDS : LOGIN_FIELDS

  // ─── Form: Login / Register ────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<AuthFormValues>({
    mode: "onTouched",
    defaultValues: {
      confirmPassword: "",
      email: "",
      fullName: "",
      password: "",
    },
  })

  /** Theo dõi giá trị password để validate confirmPassword */
  const password = useWatch({ control, name: "password" })
  const Url_Login_GG = process.env.NEXT_PUBLIC_URL_LOGIN_GG

  // ─── Form: Forgot Password ─────────────────────────────────────────────────

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    reset: resetForgot,
    clearErrors: clearForgotErrors,
    setError: setForgotError,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormValues>({
    mode: "onTouched",
    defaultValues: { email: "" },
  })

  // ─── Guard: không render khi modal đóng ───────────────────────────────────

  if (!isOpen) return null

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Trả về validation rules cho từng field của form login/register */
  function getFieldRules(name: FieldName): RegisterOptions<AuthFormValues, FieldName> {
    switch (name) {
      case "fullName":
        return {
          onChange: () => clearErrors("root"),
          validate: (value) => {
            if (!isRegisterMode) return true

            const trimmedValue = value.trim()

            if (!trimmedValue) return "Vui lòng nhập họ và tên."
            if (trimmedValue.length < 2) return "Họ và tên phải có ít nhất 2 ký tự."
            if (trimmedValue.length > 255) return "Họ và tên không được vượt quá 255 ký tự."

            return true
          },
        }
      case "email":
        return {
          onChange: () => clearErrors("root"),
          required: "Vui lòng nhập email.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email không đúng định dạng.",
          },
        }
      case "password":
        return {
          onChange: () => clearErrors("root"),
          required: "Vui lòng nhập mật khẩu.",
          ...(isRegisterMode
            ? {
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự.",
                },
                maxLength: {
                  value: 100,
                  message: "Mật khẩu không được vượt quá 100 ký tự.",
                },
              }
            : {}),
        }
      case "confirmPassword":
        return {
          onChange: () => clearErrors("root"),
          validate: (value) => {
            if (!isRegisterMode) return true
            if (!value) return "Vui lòng nhập lại mật khẩu."
            return value === password ? true : "Mật khẩu nhập lại không khớp."
          },
        }
    }
  }

  /** Reset toàn bộ form state và chuyển sang mode mới */
  function resetFormState(nextMode: AuthMode = "login") {
    setMode(nextMode)
    reset()
    resetForgot()
    clearErrors()
    clearForgotErrors()
    setCaptchaToken(null)
    setForgotSuccess(false)
  }

  /** Đóng modal và xoá redirect stack */
  function handleCloseModal() {
    resetFormState()
    clearPendingRedirectUrls()
    dispatch(closeLogin())
  }

  // ─── Submit handlers ───────────────────────────────────────────────────────

  /** Xử lý submit form login / register */
  async function handleSubmitAuthForm(data: AuthFormValues) {
    try {
      clearErrors("root")

      // Gọi API login hoặc signup tuỳ mode
      const response = isRegisterMode
        ? await signup({
          email: data.email,
          fullName: data.fullName,
          password: data.password,
        }).unwrap()
        : await login({
          email: data.email,
          password: data.password,
        }).unwrap()

      // response.data có thể null theo ApiResponseType — throw để rơi vào catch
      if (!response.data) {
        throw new Error("Auth response is missing data.")
      }

      // Lưu thông tin user vào Redux session
      setAuthenticatedUser(dispatch, {
        userId: response.data.userId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
      })

      showNotification(isRegisterMode ? "Đăng ký thành công" : "Đăng nhập thành công", {
        variant: "success",
      })

      const redirectUrl = popPendingRedirectUrl()
      dispatch(backendApi.util.resetApiState())
      handleCloseModal()

      if (redirectUrl) {
        router.replace(redirectUrl)
      }
    } catch (error) {
      console.log(error)
      setError("root", {
        type: "server",
        message: extractErrorMessage(error
        ),
      })
    }
  }

  /** Xử lý submit form quên mật khẩu */
  async function handleSubmitForgotForm(data: ForgotFormValues) {
    // Bắt buộc phải xác minh captcha trước khi gửi
    if (!captchaToken) {
      setForgotError("root", {
        type: "manual",
        message: "Vui lòng xác minh captcha.",
      })
      return
    }

    try {
      clearForgotErrors("root")

      // Gọi API quên mật khẩu — unwrap() sẽ tự throw nếu lỗi HTTP
      await forgotPassword({
        email: data.email,
        captchaToken,
      }).unwrap()

      // Không check response.data vì forgot password không trả data,
      // chỉ cần unwrap() không throw là thành công
      setForgotSuccess(true)
    } catch (error) {
      setForgotError("root", {
        type: "server",
        message: extractErrorMessage(
         error
        ),
      })
    }
  }
  // xử lý login google
  function handleLoginGG(){
    if(Url_Login_GG){
      router.push(Url_Login_GG)
    }else{
      setError("root",{
        type:"server",
        message:"lỗi đường dẫn đăng nhập gg"
      })
    }
    
  }

  // ─── Render helpers ────────────────────────────────────────────────────────

  /** Render một field input cho form login/register */
  function renderAuthField({ name, label, placeholder, type = "text" }: FieldConfig) {
    const error = errors[name]
    const errorId = `${name}-error`

    return (
      <div key={name} className="grid gap-2">
        <label htmlFor={name} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            error && "border-[#efb4b4] focus-visible:border-[#dc2626] focus-visible:ring-[#fecaca]"
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...register(name, getFieldRules(name))}
        />
        {error?.message ? (
          <p id={errorId} className="text-sm leading-6 text-[#b42318]">
            {error.message}
          </p>
        ) : null}
      </div>
    )
  }

  // ─── Giao diện: Màn hình thành công sau khi gửi email ─────────────────────

  function renderForgotSuccess() {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {/* Icon check xanh */}
        <CheckCircle2 className="size-14 text-emerald-500" strokeWidth={1.5} />

        {/* Thông báo thành công */}
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Yêu cầu đã được gửi!</p>
          <p className="text-sm text-slate-500">
            Vui lòng kiểm tra hộp thư email để đặt lại mật khẩu.
          </p>
        </div>

        {/* Nút quay lại đăng nhập */}
        <MainButton
          type="button"
          className="mt-2 h-12 w-full"
          onClick={() => resetFormState("login")}
        >
          Quay lại đăng nhập
        </MainButton>
      </div>
    )
  }

  // ─── Giao diện: Form quên mật khẩu ────────────────────────────────────────

  function renderForgotForm() {
    return (
      <form
        className="grid gap-4"
        onSubmit={handleSubmitForgot(handleSubmitForgotForm)}
        noValidate
      >
        {/* Field: Email */}
        <div className="grid gap-2">
          <label htmlFor="forgot-email" className="text-sm font-semibold text-slate-700">
            Email
          </label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="Nhập email đã đăng ký"
            className={cn(
              forgotErrors.email &&
              "border-[#efb4b4] focus-visible:border-[#dc2626] focus-visible:ring-[#fecaca]"
            )}
            aria-invalid={Boolean(forgotErrors.email)}
            aria-describedby={forgotErrors.email ? "forgot-email-error" : undefined}
            {...registerForgot("email", {
              onChange: () => clearForgotErrors("root"),
              required: "Vui lòng nhập email.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không đúng định dạng.",
              },
            })}
          />
          {forgotErrors.email?.message ? (
            <p id="forgot-email-error" className="text-sm leading-6 text-[#b42318]">
              {forgotErrors.email.message}
            </p>
          ) : null}
        </div>

        {/* Captcha Cloudflare Turnstile */}
        <div>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_SITE_KEY_CLOUDFLARE_TURNSTILE!}
            onSuccess={(token) => {
              setCaptchaToken(token)
            }}
          />
        </div>

        {/* Lỗi server — hiển thị trên nút submit */}
        {forgotErrors.root?.message ? (
          <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm leading-6 text-[#b42318]">
            {forgotErrors.root.message}
          </p>
        ) : null}

        {/* Nút submit */}
        <MainButton type="submit" className="mt-1 h-12" disabled={isForgotLoading} fullWidth>
          {isForgotLoading ? "Đang gửi..." : formCopy.submitLabel}
        </MainButton>

        {/* Chuyển về đăng nhập */}
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
          <span>{formCopy.switchText}</span>
          <button
            type="button"
            className="font-semibold text-primary transition hover:brightness-110"
            onClick={() => resetFormState("login")}
          >
            {formCopy.switchActionLabel}
          </button>
        </div>
      </form>
    )
  }

  // ─── Giao diện: Form login / register ─────────────────────────────────────

  function renderAuthForm() {
    return (
      <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitAuthForm)} noValidate>
        {/* Các fields tuỳ theo mode login/register */}
        {fields.map(renderAuthField)}

        {/* Lỗi server — hiển thị trên nút submit */}
        {errors.root?.message ? (
          <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm leading-6 text-[#b42318]">
            {errors.root.message}
          </p>
        ) : null}

        {/* Nút submit */}
        <MainButton type="submit" className="mt-1 h-12" disabled={isAuthSubmitting} fullWidth>
          {formCopy.submitLabel}
        </MainButton>

        {/* Nút đăng nhập bằng Google — chỉ giao diện, bạn có thể thêm logic vào onClick */}
        {isLoginMode ? (
          <button
            type="button"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            onClick={handleLoginGG}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
              <svg viewBox="0 0 46 46" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#4285F4" d="M23 9.5c3.3 0 6.1 1.1 8.1 3.1l6-6C33.2 3 28.5 1 23 1 14 1 6.5 5.6 2.5 12.7l7.4 5.7C11.7 12.5 17.7 9.5 23 9.5Z" />
                <path fill="#34A853" d="M44.5 23.5c0-1.5-.1-2.4-.4-3.5H23v7h12.3c-.5 3-2.3 5.4-5 7.1l7.7 6c4.5-4.1 7.5-10.2 7.5-16.6Z" />
                <path fill="#FBBC05" d="M10 27.3c-.7-2.1-1-4.3-1-6.6s.4-4.5 1-6.6L2.5 8.4C.9 11.4 0 14.9 0 18.7s.9 7.3 2.5 10.4l7.5-1.8Z" />
                <path fill="#EA4335" d="M23 44.5c5.5 0 10.2-1.8 13.6-5l-7.7-6c-2.1 1.4-4.7 2.2-7.9 2.2-5.3 0-11.3-3-13.1-7.5l-7.4 5.7C6.5 40.4 14 44.5 23 44.5Z" />
              </svg>
            </span>
            Đăng nhập bằng Google
          </button>
        ) : null}

        {/* Nút quên mật khẩu — chỉ hiện ở mode login */}
        {isLoginMode ? (
          <button
            type="button"
            className="justify-self-end text-sm font-medium text-slate-500 transition hover:text-primary"
            onClick={() => resetFormState("forgot")}
          >
            Quên mật khẩu?
          </button>
        ) : null}

        {/* Chuyển giữa login / register */}
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
          <span>{formCopy.switchText}</span>
          <button
            type="button"
            className="font-semibold text-primary transition hover:brightness-110"
            onClick={() => resetFormState(isRegisterMode ? "login" : "register")}
          >
            {formCopy.switchActionLabel}
          </button>
        </div>
      </form>
    )
  }

  // ─── Render chính ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-200 flex items-start justify-center px-4 py-6 sm:items-center">

      {/* Backdrop — click để đóng modal */}
      <button
        className="absolute inset-0 bg-slate-950/18"
        onClick={handleCloseModal}
        type="button"
        aria-label="Đóng biểu mẫu xác thực"
      />

      {/* Modal container */}
      <div className="surface-overlay relative z-10 w-full max-w-md p-6 sm:p-7">

        {/* ── Header: title + nút đóng ── */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Account</p>
            <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
              {formCopy.title}
            </h1>
            {/* Subtitle — ẩn khi màn hình thành công của forgot */}
            {!(isForgotMode && forgotSuccess) ? (
              <p className="text-sm leading-7 text-slate-600">{formCopy.subtitle}</p>
            ) : null}
          </div>

          {/* Nút đóng modal */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="inline-flex size-10 items-center justify-center rounded-[12px] border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Body: tuỳ theo mode ── */}

        {/* Forgot: màn hình thành công */}
        {isForgotMode && forgotSuccess ? renderForgotSuccess() : null}

        {/* Forgot: form nhập email + captcha */}
        {isForgotMode && !forgotSuccess ? renderForgotForm() : null}

        {/* Login / Register: form xác thực */}
        {!isForgotMode ? renderAuthForm() : null}

      </div>
    </div>
  )
}