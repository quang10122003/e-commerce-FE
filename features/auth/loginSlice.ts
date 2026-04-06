import { createSlice } from "@reduxjs/toolkit"

interface LoginState {
    isOpen: boolean
}

const initialState: LoginState = {
    isOpen: false,
}

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        openLogin: (state) => {
            state.isOpen = true
        },
        closeLogin: (state) => {
            state.isOpen = false
        },
        toggleLogin: (state) => {
            state.isOpen = !state.isOpen
        },
    },
})

export const { openLogin, closeLogin, toggleLogin } = loginSlice.actions
export default loginSlice.reducer
