/** @jsxImportSource @emotion/react */
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import TableCheckoutBar from 'components/TableCheckoutBar'
import { format, startOfDay } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  orderAlert: css({
    marginLeft: '20px',
    color: 'red',
    fontWeight: 'bold'
  }),
}

function Results({
  pageSetting,
  onPageChange,
  onRowsPerPageChange,
  waitCloseOrderResults,
  refetchDailyMoneyFlowReport,
  refetch,
  loading,
  checkoutStatus,
  pagenationLabel,
  ...rest
}) {
  const checkoutStaff = JSON.parse(localStorage.getItem('user'))

  const [results, setResults] = React.useState([])
  const [checkoutProcessing, setCheckoutProcessing] = React.useState(false)
  const [canCheckoutOrder, setCanCheckoutOrder] = React.useState(0)
  const pageRef = React.useRef(null)

  React.useEffect(() => {
    if (!loading) {
      const filterResults = waitCloseOrderResults.filter(d => d.date <= startOfDay(new Date()).getTime())
      setResults(filterResults)
      if (checkoutStatus) {
        const length = waitCloseOrderResults.filter(d => d.pendingOrderCount === 0).length
        setCanCheckoutOrder(length)
      } else {
        setCanCheckoutOrder(waitCloseOrderResults.length)
      }
    }
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [loading, pageRef.current])
  const [selectedOrders, setSelectedOrders] = React.useState([])
  const handleSelectAll = event => {
    if (checkoutStatus) {
      const newSelectedOrders = event.target.checked ? results.filter(d => d.pendingOrderCount === 0).map(d => d.date) : []
      setSelectedOrders(newSelectedOrders)
    } else {
      const newSelectedOrders = event.target.checked ? results.map(order => order.date) : []
      setSelectedOrders(newSelectedOrders)
    }
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }
  const handleMarkPaid = () => {
    openSnackbar({
      message: `是否確認要日結`,
      variant: 'error',
      disableHide: true,
      resign: true,
      isDailyCheckout: true,
      selectedOrders: selectedOrders,
      waitCloseOrderResults: waitCloseOrderResults,
      setSelectedOrders: setSelectedOrders,
      progressCount: 0,
      checkoutStaff: checkoutStaff,
    })
  }

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {pageSetting.pageOffset + 1} /{' '}
        {Math.ceil(results.length / pageSetting.pageLimit)}
      </Typography>
      <Card>
        <CardHeader title="尚未日結紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selectedOrders.length > 0
                          ? selectedOrders.length === canCheckoutOrder
                          : false
                      }
                      color="primary"
                      indeterminate={
                        selectedOrders.length > 0 && selectedOrders.length < canCheckoutOrder
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>營業日期</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map(result => (
                  <TableRow key={result.date}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        onChange={() => handleSelectOne(result.date)}
                        checked={selectedOrders.indexOf(result.date) > -1}
                        disabled={checkoutStatus && result.pendingOrderCount > 0}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(result.date), 'yyyy/MM/dd')}
                      {checkoutStatus && result.pendingOrderCount > 0 && <span css={styles.orderAlert}>尚有{result.pendingOrderCount}筆掛單未結帳，無法日結。</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={pageSetting.totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={pageSetting.pageOffset}
            rowsPerPage={pageSetting.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableCheckoutBar
        selected={selectedOrders}
        onMarkPaid={handleMarkPaid}
        checkoutProcessing={checkoutProcessing}
      />
    </div>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
