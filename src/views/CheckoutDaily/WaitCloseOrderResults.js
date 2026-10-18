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
  IconButton,
  Collapse,
} from '@mui/material'
import TableCheckoutBar from 'components/TableCheckoutBar'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
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
    color: 'red',
    fontWeight: 'bold'
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  expand: css({
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }),
  expandOpen: css({
    transform: 'rotate(180deg)',
  }),
  gridContainer: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0 24px',
    padding: '8px 24px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  }),
  gridItem: css({
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    borderBottom: '1px solid rgb(var(--border))',
    '&:last-child': {
      borderBottom: 'none',
    },
  }),
  selectAllHeader: css({
    display: 'flex',
    alignItems: 'center',
    padding: '4px 24px',
    backgroundColor: 'rgb(var(--surface))',
    borderBottom: '1px solid rgb(var(--border))',
  }),
  orderAlertCompact: css({
    marginLeft: '8px',
    color: 'red',
    fontSize: '11px',
    fontWeight: 'bold'
  }),
  tableCell: css({
    padding: '4px 16px !important',
    height: 'auto !important',
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
  const [expanded, setExpanded] = React.useState(false)
  const pageRef = React.useRef(null)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

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
      <Card>
        <CardHeader
          css={styles.cardHeader}
          action={
            <IconButton
              css={[styles.expand, expanded && styles.expandOpen]}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>尚未日結紀錄</span>
              <Typography color="textSecondary" variant="body2">
                共 {results.length} 筆
              </Typography>
            </div>
          }
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <div css={styles.selectAllHeader}>
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
              size="small"
            />
            <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginLeft: '8px' }}>
              全選 / 營業日期
            </Typography>
          </div>
          <CardContent css={styles.content}>
            <div css={styles.gridContainer}>
              {results.map(result => (
                <div key={result.date} css={styles.gridItem}>
                  <Checkbox
                    color="primary"
                    onChange={() => handleSelectOne(result.date)}
                    checked={selectedOrders.indexOf(result.date) > -1}
                    disabled={checkoutStatus && result.pendingOrderCount > 0}
                    size="small"
                  />
                  <Typography variant="body2" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    {format(new Date(result.date), 'yyyy/MM/dd')}
                    {checkoutStatus && result.pendingOrderCount > 0 && (
                      <span css={styles.orderAlertCompact}>
                        ({result.pendingOrderCount}筆掛單未結)
                      </span>
                    )}
                  </Typography>
                </div>
              ))}
            </div>
          </CardContent>
          {/* <CardActions css={styles.actions}>
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
        </CardActions> */}
        </Collapse>
      </Card>
      <TableCheckoutBar
        selected={selectedOrders}
        onMarkPaid={handleMarkPaid}
        checkoutProcessing={checkoutProcessing}
      />
    </div >
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
