import { createSlice } from "@reduxjs/toolkit"

interface LoginModalState {
  isOpen: boolean
}

const initialState: LoginModalState = {
  isOpen: false,
}

const loginModalSlice = createSlice({
  initialState,
  name: "loginModal",
  reducers: {
    closeLogin: (state) => {
      state.isOpen = false
    },
    openLogin: (state) => {
      state.isOpen = true
    },
    toggleLogin: (state) => {
      state.isOpen = !state.isOpen
    },
  },
})

export const { closeLogin, openLogin, toggleLogin } = loginModalSlice.actions
export default loginModalSlice.reducer
