/** @jsxImportSource @emotion/react */
import {
  Button, Typography, Drawer, Grid, Hidden
} from '@mui/material'
import { Edit as EditIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'

import styles from './styles/Results'

const ProdudctDrawer = ({
  selectedProducts, disableDeleteProduct, handleCancel, handleConfirmCancel, setOpenPublishDialog,
  setOpenEditProductsCategoryModal, setOpenVendorDialog
}) => {
  return (
    <Drawer anchor="bottom" open={selectedProducts.length > 0} PaperProps={{ elevation: 1 }} variant="persistent">
      <div css={styles.root}>
        <Grid alignItems="center" justifyContent='space-between' container style={{ padding: '16px' }}>
          <Hidden smDown>
            <Grid item sm='auto'>
              <Typography color="textSecondary" variant="subtitle1">
                {selectedProducts.length} selected
              </Typography>
            </Grid>
          </Hidden>
          <Grid item xs={12} sm='auto' container justifyContent='center' alignItems="center">
            <Button sx={{ color: 'black !important', fontWeight: 400, display: 'flex', gap: '8px' }} onClick={disableDeleteProduct ? handleCancel : handleConfirmCancel}>
              <DeleteForeverIcon />
              刪除
            </Button>
          </Grid>
          <Grid item xs={12} sm='auto' container justifyContent='center' alignItems="center">
            <Button sx={{ color: 'black !important', fontWeight: 400, display: 'flex', gap: '8px' }} onClick={() => setOpenPublishDialog(true)}>
              <EditIcon />
              編輯上架狀態
            </Button>
          </Grid>
          <Grid item xs={12} sm='auto' container justifyContent='center' alignItems="center">
            <Button onClick={() => setOpenVendorDialog(true)} sx={{ color: 'black !important', fontWeight: 400, display: 'flex', gap: '8px' }}>
              <EditIcon />
              編輯廠商
            </Button>
          </Grid>
          <Grid item xs={12} sm='auto' container justifyContent='center' alignItems="center">
            <Button onClick={() => setOpenEditProductsCategoryModal(true)} sx={{ color: 'black !important', fontWeight: 400, display: 'flex', gap: '8px' }}>
              <EditIcon />
              編輯商品類別
            </Button>
          </Grid>
        </Grid>
      </div>
    </Drawer>
  )
}

export default ProdudctDrawer