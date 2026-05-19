"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { RegisterOptions, useForm, useWatch } from "react-hook-form"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { backendApi, useLoginMutation, useSignupMutation } from "@/client/api/backend-api"
import { closeLogin } from "@/client/session/loginModalSlice"
import {
  clearPendingRedirectUrls,
  popPendingRedirectUrl,
} from "@/client/session/redirect-stack"
import { setAuthenticatedUser } from "@/client/session/sessionSlice"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { useNotification } from "@/components/ui/NotificationProvider"
import { cn } from "@/lib/utils"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { AuthResponse } from "@/types/Auth/AuthResponse"

type AuthMode = "login" | "register"

type AuthFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type FieldName = keyof AuthFormValues

type FieldConfig = {
  name: FieldName
  label: string
  placeholder: string
  type?: "text" | "email" | "password"
}

const FORM_COPY = {
  login: {
    submitLabel: "Đăng nhập",
    switchActionLabel: "Đăng ký",
    switchText: "Chưa có tài khoản?",
    title: "Đăng nhập",
  },
  register: {
    submitLabel: "Đăng ký",
    switchActionLabel: "Đăng nhập",
    switchText: "Đã có tài khoản?",
    title: "Tạo tài khoản mới",
  },
}

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

function getApiErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null
  ) {
    const apiResponse = error.data as ApiResponseType<AuthResponse>

    if (typeof apiResponse.message === "string" && apiResponse.message.trim()) {
      return apiResponse.message
    }
  }

  return "Không thể xử lý yêu cầu. Vui lòng thử lại."
}

export default function AuthModal() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const isOpen = useAppSelector((state) => state.login.isOpen)
  const [mode, setMode] = useState<AuthMode>("login")
  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation()
  const { showNotification } = useNotification()
  const isRegisterMode = mode === "register"
  const isSubmitting = isLoginLoading || isSignupLoading

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

  const password = useWatch({
    control,
    name: "password",
  })
  const formCopy = FORM_COPY[mode]
  const fields = isRegisterMode ? REGISTER_FIELDS : LOGIN_FIELDS

  if (!isOpen) {
    return null
  }

  function getFieldRules(name: FieldName): RegisterOptions<AuthFormValues, FieldName> {
    switch (name) {
      case "fullName":
        return {
          onChange: () => clearErrors("root"),
          validate: (value) =>
            !isRegisterMode || value.trim() ? true : "Vui lòng nhập họ và tên.",
        }
      case "email":
        return {
          onChange: () => clearErrors("root"),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email không đúng định dạng.",
          },
          required: "Vui lòng nhập email.",
        }
      case "password":
        return {
          onChange: () => clearErrors("root"),
          required: "Vui lòng nhập mật khẩu.",
        }
      case "confirmPassword":
        return {
          onChange: () => clearErrors("root"),
          validate: (value) => {
            if (!isRegisterMode) {
              return true
            }

            if (!value) {
              return "Vui lòng nhập lại mật khẩu."
            }

            return value === password ? true : "Mật khẩu nhập lại không khớp."
          },
        }
    }
  }

  function resetFormState(nextMode: AuthMode = "login") {
    setMode(nextMode)
    reset()
    clearErrors()
  }

  function handleCloseModal() {
    resetFormState()
    clearPendingRedirectUrls()
    dispatch(closeLogin())
  }

  async function handleSubmitForm(data: AuthFormValues) {
    try {
      clearErrors("root")

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

      if (!response.data) {
        throw new Error("Auth response is missing data.")
      }

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

      router.refresh()
    } catch (error) {
      setError("root", {
        type: "server",
        message: getApiErrorMessage(error),
      })
    }
  }

  function renderField({ name, label, placeholder, type = "text" }: FieldConfig) {
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
          className={cn(error && "border-[#efb4b4] focus-visible:border-[#dc2626] focus-visible:ring-[#fecaca]")}
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

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 sm:items-center">
      <button
        className="absolute inset-0 bg-slate-950/18"
        onClick={handleCloseModal}
        type="button"
        aria-label="Đóng biểu mẫu xác thực"
      />

      <div className="surface-overlay relative z-10 w-full max-w-md p-6 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Account</p>
            <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
              {formCopy.title}
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              Đăng nhập hoặc tạo tài khoản để tiếp tục trải nghiệm mua sắm.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="inline-flex size-10 items-center justify-center rounded-[12px] border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          {fields.map(renderField)}

          {errors.root?.message ? (
            <p className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm leading-6 text-[#b42318]">
              {errors.root.message}
            </p>
          ) : null}

          <MainButton type="submit" className="mt-1 h-12" disabled={isSubmitting} fullWidth>
            {formCopy.submitLabel}
          </MainButton>

          {!isRegisterMode ? (
            <button
              type="button"
              className="justify-self-end text-sm font-medium text-slate-500 transition hover:text-primary"
            >
              Quên mật khẩu?
            </button>
          ) : null}

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
      </div>
    </div>
  )
}
