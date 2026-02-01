import { useContext, createContext } from 'react'

const store = createContext()

export const { Provider, Consumer } = store

 export default () => useContext(store)