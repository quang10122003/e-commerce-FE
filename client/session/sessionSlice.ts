import { createSlice, type Dispatch, type UnknownAction } from "@reduxjs/toolkit"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"

interface SessionState {
  isAuthenticated: boolean
  isCheckingAuth: boolean
  currentUser: CurrentUserResponse | null
}

const initialState: SessionState = {
  isAuthenticated: false,
  isCheckingAuth: true,
  currentUser: null,
}

const sessionSlice = createSlice({
  initialState,
  name: "session",
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
    finishAuthCheck: (state) => {
      state.isCheckingAuth = false
    },
    setAuthenticated: (state) => {
      state.isAuthenticated = true
    },
    setCurrentUser: (state, action: { payload: CurrentUserResponse }) => {
      state.currentUser = action.payload
    },
    setUnauthenticated: (state) => {
      state.isAuthenticated = false
    },
    startAuthCheck: (state) => {
      state.isCheckingAuth = true
    },
  },
})

export const {
  clearCurrentUser,
  finishAuthCheck,
  setAuthenticated,
  setCurrentUser,
  setUnauthenticated,
  startAuthCheck,
} = sessionSlice.actions

type SessionDispatch = Dispatch<UnknownAction>

// hàm để set thông tin user vào store và set biến xác nhận Authenticated
export function setAuthenticatedUser(dispatch: SessionDispatch, user: CurrentUserResponse) {
  dispatch(setCurrentUser(user))
  dispatch(setAuthenticated())
}

// xóa thông tin user cũ trong store và set authcation về flase
export function clearAuthenticatedUser(dispatch: SessionDispatch) {
  dispatch(clearCurrentUser())
  dispatch(setUnauthenticated())
}

export default sessionSlice.reducer
