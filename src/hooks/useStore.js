import { useContext, createContext } from 'react'

const store = createContext()

export const { Provider, Consumer } = store

const useStore = () => useContext(store)

export default useStore
