"use client"

import { useState } from "react"
import { RegisterOptions, useForm, useWatch } from "react-hook-form"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { useNotification } from "@/components/ui/NotificationProvider"
import { setAuthenticatedUser } from "@/features/auth/authSlice"
import { setStoredAuth } from "@/features/auth/authStorage"
import { useLoginMutation, useSignupMutation } from "@/features/auth/loginApi"
import { closeLogin } from "@/features/auth/loginSlice"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { AuthResponse } from "@/types/Auth/AuthResponse"
import { cn } from "@/lib/utils"

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

      setStoredAuth({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })

      setAuthenticatedUser(dispatch, {
        userId: response.data.userId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
      })

      showNotification(isRegisterMode ? "Đăng ký thành công!" : "Đăng nhập thành công!", {
        variant: "success",
      })

      handleCloseModal()
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
          className={cn(
            "h-12 rounded-2xl",
            error &&
              "border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-100"
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...register(name, getFieldRules(name))}
        />
        {error?.message ? (
          <p id={errorId} className="text-sm leading-6 text-rose-600">
            {error.message}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 sm:items-center">
      <button
        className="absolute inset-0 bg-slate-950/55"
        onClick={handleCloseModal}
        type="button"
        aria-label="Đóng biểu mẫu xác thực"
      />

      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.4)] sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {formCopy.title}
          </h1>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          {fields.map(renderField)}

          {errors.root?.message ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {errors.root.message}
            </p>
          ) : null}

          <MainButton
            type="submit"
            className="mt-1 h-12 rounded-2xl"
            disabled={isSubmitting}
            fullWidth
          >
            {formCopy.submitLabel}
          </MainButton>

          {!isRegisterMode ? (
            <button
              type="button"
              className="justify-self-end text-sm text-slate-500 transition hover:text-slate-900"
            >
              Quên mật khẩu?
            </button>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
            <span>{formCopy.switchText}</span>
            <button
              type="button"
              className="font-semibold text-rose-600 transition hover:text-rose-700"
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
