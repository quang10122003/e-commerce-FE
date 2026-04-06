import { createSlice, type Dispatch, type UnknownAction } from "@reduxjs/toolkit"
import { clearStoredAuth } from "@/features/auth/authStorage"
import { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"

interface AuthState {
    isAuthenticated: boolean
    isCheckingAuth: boolean
    currentUser: CurrentUserResponse | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    isCheckingAuth: true,
    currentUser: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthenticated: (state) => {
            state.isAuthenticated = true
        },
        setUnauthenticated: (state) => {
            state.isAuthenticated = false
        },
        startAuthCheck: (state) => {
            state.isCheckingAuth = true
        },
        finishAuthCheck: (state) => {
            state.isCheckingAuth = false
        },
        setCurrentUser: (state, action: { payload: CurrentUserResponse }) => {
            state.currentUser = action.payload
        },
        clearCurrentUser: (state) => {
            state.currentUser = null
        },
    },
})

export const {
    setAuthenticated,
    setUnauthenticated,
    startAuthCheck,
    finishAuthCheck,
    setCurrentUser,
    clearCurrentUser,
} = authSlice.actions

type AuthDispatch = Dispatch<UnknownAction>

// Gom luong "phien hop le" ve mot cho de UI va interceptor cap nhat Redux thong nhat.

// Gom luồng "phiên hợp lệ" về một chỗ để UI và interceptor cập nhật Redux thống nhất.
export function setAuthenticatedUser(
    dispatch: AuthDispatch,
    user: CurrentUserResponse
) {
    dispatch(setCurrentUser(user))
    dispatch(setAuthenticated())
}

// Chỉ xóa auth khi phiên thực sự không thể khôi phục được nữa.
// Chi xoa auth khi phien thuc su khong the khoi phuc duoc nua.
export function clearAuthenticatedUser(dispatch: AuthDispatch) {
    clearStoredAuth()
    dispatch(clearCurrentUser())
    dispatch(setUnauthenticated())
}

export default authSlice.reducer
