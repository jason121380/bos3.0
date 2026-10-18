/** @jsxImportSource @emotion/react */
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
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
          <ListItemIcon>
            <PrintIcon />
          </ListItemIcon>
          <ListItemText primary="報表匯出" />
        </MenuItem>
      </Menu>
    </>
  )
}

export default memo(GenericMoreButton)
