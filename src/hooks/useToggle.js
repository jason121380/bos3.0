import { useState } from 'react'

export default function useToggle() {
  const [open, setOpen] = useState(false)
  return {
    open,
    toggle: () => setOpen(!open),
    setOpen: setOpen,
  }
}
