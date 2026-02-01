/** @jsxImportSource @emotion/react */
import { Button, Drawer, Grid, Hidden, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import Employee from '@mui/icons-material/AssignmentIndRounded';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    padding: theme.spacing(2),
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    '& button': {
      color: '#263238 !important'
    }
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function TableEditBar({
  selected = [],
  className = {},
  onDelete,
  onCancel,
  onEdit,
  onEditDeduction,
  onEditSaleStatus,
  onEditProductsCategory,
  onEditRakeSetting,
  onDeleteCustomer,
  editBarOnClick,
  onEditMembershipCategory,
  onReinstatement,
  onEditPersonnelProfile,
  ...rest
}) {
  const open = selected.length > 0

  return (
    <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
      <div {...rest} css={css([styles.root, className])}>
        <Grid alignItems="center" container spacing={2}>
          <Hidden smDown>
            <Grid item md={3}>
              <Typography color="textSecondary" variant="subtitle1">
                {selected.length} selected
              </Typography>
            </Grid>
          </Hidden>
          {onReinstatement && (
            <Grid item md={6} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onReinstatement} data-testid="delete">
                  <Employee css={styles.buttonIcon} />
                  員工復職
                </Button>
              </div>
            </Grid>
          )}
          {onDelete && (
            <Grid item md={onDelete && onEdit && onEditDeduction ? 3 : 6} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onDelete} data-testid="delete">
                  <DeleteIcon css={styles.buttonIcon} />
                  刪除
                </Button>
              </div>
            </Grid>
          )}
          {onEditSaleStatus && (
            <Grid item md={2} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditSaleStatus} data-testid="edit">
                  <EditIcon css={styles.buttonIcon} />
                  編輯上架狀態
                </Button>
              </div>
            </Grid>
          )}
          {onEditDeduction && (
            <Grid item md={2} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditDeduction} data-testid="edit">
                  <EditIcon css={styles.buttonIcon} />
                  編輯項目扣項
                </Button>
              </div>
            </Grid>
          )}
          {onEdit && (
            <Grid item md={2} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEdit} data-testid="edit">
                  <EditIcon css={styles.buttonIcon} />
                  編輯互助點數
                </Button>
              </div>
            </Grid>
          )}
          {onCancel && (
            <Grid item md={6} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onCancel} data-testid="cancelOrder" disabled={editBarOnClick}>
                  <ClearIcon css={styles.buttonIcon} />
                  取消訂單(預約)
                </Button>
              </div>
            </Grid>
          )}
          {onEditProductsCategory && (
            <Grid item md={3} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditProductsCategory} data-testid="editProductsCategory">
                  <EditIcon css={styles.buttonIcon} />
                  編輯商品類別
                </Button>
              </div>
            </Grid>
          )}
          {onEditRakeSetting && (
            <Grid item md={3} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditRakeSetting} data-testid="editProductsCategory">
                  <EditIcon css={styles.buttonIcon} />
                  編輯設計師抽成
                </Button>
              </div>
            </Grid>
          )}
          {onEditRakeSetting && (
            <Grid item md={3} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditPersonnelProfile} data-testid="editProductsCategory">
                  <SimCardDownloadIcon css={styles.buttonIcon} />
                  由人員身分設定檔導入
                </Button>
              </div>
            </Grid>
          )}
          {onDeleteCustomer && (
            <Grid item md={6} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onDeleteCustomer} data-testid="editProductsCategory">
                  <EditIcon css={styles.buttonIcon} />
                  刪除客人
                </Button>
              </div>
            </Grid>
          )}
          {onEditMembershipCategory && (
            <Grid item md={3} xs={12}>
              <div css={styles.actions}>
                <Button onClick={onEditMembershipCategory} data-testid="onEditMembershipCategory">
                  <EditIcon css={styles.buttonIcon} />
                  編輯會員卡類別
                </Button>
              </div>
            </Grid>
          )}
        </Grid>
      </div>
    </Drawer>
  )
}

TableEditBar.propTypes = {
  className: PropTypes.object,
  onDelete: PropTypes.func,
  onMarkPaid: PropTypes.func,
  onMarkUnpaid: PropTypes.func,
  selected: PropTypes.array,
}

export default TableEditBar
