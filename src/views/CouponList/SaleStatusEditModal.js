/** @jsxImportSource @emotion/react */
import {
  Card, CardHeader, CardContent, Modal,
  Button, FormControl, Select, MenuItem,
} from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  closeAtTop: css({
    margin: '16px 24px !important',
  }),
  textField: css({
    marginLeft: theme.spacing(2),
    width: '5rem',
  }),
  saveAtBottom: css({
    margin: '16px 24px !important',
    float: 'right',
  }),
}

const SaleStatusEditModal = ({
  openEditSaleStatusModal,
  saleStatus,
  setSaleStatus,
  onClose,
  handleUpdateLaunchedStatus
}) => {
  return (
    <Modal open={openEditSaleStatusModal} onClose={onClose}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="卡券上架狀態設定" />
          <Button
            color="primary"
            variant="contained"
            css={styles.closeAtTop}
            onClick={onClose}
          >
            關閉
          </Button>
        </div>
        <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
          <FormControl variant="outlined" fullWidth>
            <Select fullWidth value={saleStatus} onChange={e => setSaleStatus(e.target.value)}>
              <MenuItem value={true}>上架</MenuItem>
              <MenuItem value={false}>下架</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
        <Button
          color="primary"
          variant="contained"
          css={styles.saveAtBottom}
          style={{ backgroundColor: 'red', color: 'white' }}
          onClick={handleUpdateLaunchedStatus}
        >
          儲存
        </Button>
      </Card>
    </Modal>
  )
}

SaleStatusEditModal.propTypes = {
  onClose: PropTypes.func,
  saleStatus: PropTypes.bool
}

SaleStatusEditModal.defaultProps = {
  onClose: () => { },
}

export default SaleStatusEditModal