/** @jsxImportSource @emotion/react */
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
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
    <>
      <Tooltip title="More options">
        <IconButton onClick={handleMenuOpen} ref={moreRef} size="small">
          <MoreIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={moreRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        elevation={1}
        onClose={handleMenuClose}
        open={openMenu}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleMenuItem}>
          <span className="inline-flex w-9 shrink-0 items-center">
            <PrintIcon />
          </span>
          <span className="flex-1 text-body">報表匯出</span>
        </MenuItem>
      </Menu>
    </>
  )
}

export default memo(GenericMoreButton)
