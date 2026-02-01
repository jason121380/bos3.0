import { createContext } from 'react'

const useReservationContext = createContext()

export default useReservationContext
export const { Provider, Consumer } = useReservationContext
