import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'ui/dropdown-menu'
import { Button } from 'ui/button'
import { MoreVert as MoreIcon, Print as PrintIcon } from 'ui/icons'
import { memo, useRef, useState } from 'react'

function GenericMoreButton({ handleMenuItem }) {
  const moreRef = useRef(null)
  const [openMenu, setOpenMenu] = useState(false)

  const handleMenuOpen = () => {
    setOpenMenu(true)
  }

  const handleMenuClose = () => {
    setOpenMenu(false)
  }

  return (
    // 開關由 Radix 觸發鈕處理（onOpenChange 轉呼叫原 handleMenuOpen／handleMenuClose）；不在按鈕再掛 onClick，避免點觸發鈕關閉後又被重開
    <DropdownMenu open={openMenu} onOpenChange={o => (o ? handleMenuOpen() : handleMenuClose())}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="更多選項" title="更多選項" ref={moreRef}>
          <MoreIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleMenuItem}>
          <PrintIcon />
          <span className="flex-1 text-body">報表匯出</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default memo(GenericMoreButton)
