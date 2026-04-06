"use client"

import { useState } from "react"
import { RegisterOptions, useForm, useWatch } from "react-hook-form"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useNotification } from "@/components/ui/NotificationProvider"
import { closeLogin } from "@/features/auth/loginSlice"
import { useLoginMutation, useSignupMutation } from "@/features/auth/loginApi"
import { setStoredAuth } from "@/features/auth/authStorage"
import { setAuthenticatedUser } from "@/features/auth/authSlice"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { AuthResponse } from "@/types/Auth/AuthResponse"
import styles from "@/styles/Login.module.css"

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
    // Goi bo tach message ve mot cho de phan UI submit chi xu ly luong thanh cong / that bai.
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
    // Theo doi password hien tai de rule confirmPassword co the validate theo thoi gian thuc.
    const password = useWatch({
        control,
        name: "password",
    })
    const formCopy = FORM_COPY[mode]
    // Cau hinh field duoc dieu khien boi mode, giup JSX form giu mot cau truc duy nhat.
    const fields = isRegisterMode ? REGISTER_FIELDS : LOGIN_FIELDS

    if (!isOpen) {
        return null
    }

    function getFieldRules(name: FieldName): RegisterOptions<AuthFormValues, FieldName> {
        // Gom validation ve mot noi de form login/register chia se cung mot renderer.
        switch (name) {
            case "fullName":
                return {
                    onChange: () => clearErrors("root"),
                    validate: (value) => !isRegisterMode || value.trim()
                        ? true
                        : "Vui lòng nhập họ và tên.",
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

                        return value === password
                            ? true
                            : "Mật khẩu nhập lại không khớp."
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

            // Lưu token trước để những request private kế tiếp dùng được ngay.
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

            if (isRegisterMode) {
                showNotification("Đăng ký thành công!", { variant: "success" })
            }

            if (!isRegisterMode) {
                showNotification("Đăng nhập thành công!", { variant: "success" })
            }

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
        // Moi field tu tao error id rieng de aria-describedby tro dung thong diep loi hien tai.
        const errorId = `${name}-error`

        return (
            <div key={name} className={styles.login__group}>
                <label htmlFor={name} className={styles.login__label}>
                    {label}
                </label>
                <input
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    className={`${styles.login__input} ${error ? styles.login__inputError : ""}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    {...register(name, getFieldRules(name))}
                />
                {error?.message ? (
                    <p id={errorId} className={styles.login__error}>
                        {error.message}
                    </p>
                ) : null}
            </div>
        )
    }

    return (
        <div className={styles.login}>
            <div className={styles.login__overlay} onClick={handleCloseModal} />

            <div className={styles.login__container}>
                <h1 className={styles.login__title}>{formCopy.title}</h1>

                <form className={styles.login__form} onSubmit={handleSubmit(handleSubmitForm)} noValidate>
                    {fields.map(renderField)}

                    {errors.root?.message ? (
                        <p className={styles.login__errorSummary}>{errors.root.message}</p>
                    ) : null}

                    <button
                        type="submit"
                        className={styles.login__submit}
                        disabled={isSubmitting}
                    >
                        {formCopy.submitLabel}
                    </button>

                    {!isRegisterMode ? (
                        <button type="button" className={styles.login__forgotButton}>
                            Quên mật khẩu?
                        </button>
                    ) : null}

                    <div className={styles.login__switch}>
                        <span className={styles.login__switchText}>{formCopy.switchText}</span>
                        <button
                            type="button"
                            className={styles.login__switchButton}
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
