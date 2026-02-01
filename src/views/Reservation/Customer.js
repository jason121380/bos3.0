/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardHeader,
  TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  header: css({
    padding: theme.spacing(1),
    marginTop: theme.spacing(-2),
    marginBottom: theme.spacing(2),
  }),
  field: css({
    marginBottom: theme.spacing(2),
  }),
  bullet: css({
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  }),
  title: css({
    fontSize: 14,
  }),
  pos: css({
    marginBottom: 12,
  }),
  warning: css({
    color: 'red',
    paddingBottom: theme.spacing(2),
  }),
}

export default function Customer({
  onDelete,
  customer,
  friendsNumber,
  onCustomerChange,
  customerKey,
}) {
  const [serviceCategoryLabelWidth, setServiceCategoryLabelWidth] = React.useState(0)
  const serviceCategoryRef = React.useRef()
  let FN
  if (friendsNumber) {
    FN = friendsNumber
  } else {
    FN = 0
  }
  React.useEffect(() => {
    setServiceCategoryLabelWidth(
      serviceCategoryRef.current && serviceCategoryRef.current.offsetWidth
        ? serviceCategoryRef.current.offsetWidth
        : 0
    )
  }, [])

  return (
    <Card css={styles.root}>
      {customerKey !== 'main' ? (
        <CardHeader
          css={styles.header}
          title={`好友 ${friendsNumber}`}
          action={
            <Button onClick={onDelete} data-testid="remove-friend">
              <CloseIcon />
            </Button>
          }
        />
      ) : (
        ''
      )}
      <TextField
        value={customer.name}
        css={styles.field}
        placeholder="顧客姓名 *"
        fullWidth
        variant="outlined"
        onChange={e => {
          onCustomerChange({ value: e.target.value, customerKey: 'name' })
        }}
        required
        inputProps={{
          'data-testid': `customer-name-${FN}`,
        }}
      />

      <TextField
        type="tel"
        value={customer.cellphone}
        css={styles.field}
        placeholder="顧客電話 *"
        fullWidth
        variant="outlined"
        onChange={e => {
          onCustomerChange({ value: e.target.value, customerKey: 'cellphone' })
        }}
        required
        inputProps={{
          'data-testid': `customer-cellphone-${FN}`,
        }}
      />

      {customer.cellphoneErr ? <div css={styles.warning}>＊請輸入有效手機號碼</div> : ''}

    </Card>
  )
}
