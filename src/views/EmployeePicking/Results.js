/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Drawer,
  IconButton,
  Checkbox,
  Grid,
  Hidden,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { CSVLink } from "react-csv";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import useFetchDeletePicking from 'hooks/useFetchDeletePicking'
import { openSnackbar } from 'elements/snackbars'
import pagenationLabel from './../../helper/pagenationLabel'
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
  inner: css({
    minWidth: 1300,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  actionsDrawer: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
  sticky1: css({
    position: 'sticky',
    left: 0,
    background: 'rgb(var(--background)) !important',
    zIndex: '99',
  }),
  sticky2: css({
    position: 'sticky',
    left: "52px",
    background: 'rgb(var(--background)) !important',
    zIndex: '99',
  }),
  sticky3: css({
    position: 'sticky',
    left: "104px", // Adjusted based on narrower Action column (52+52)
    background: 'rgb(var(--background)) !important',
    zIndex: '99',
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
  }),
  csvBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    textTransform: 'none !important',
    border: 'none !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
}

function Results({
  pageSetting,
  className,
  pickingRecords,
  onPageChange,
  onRowsPerPageChange,
  actionsBanned,
  ...rest
}) {
  const pageRef = useRef(null)
  const blockPicking = actionsBanned.includes('PICKING')
  const [excelData, setExcelData] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const open = selectedOrders.length > 0
  const recordArr = []
  const { deletePicking } = useFetchDeletePicking()

  pickingRecords.PickingRecord.map(record => {
    recordArr.push(record.id)
  })

  useEffect(() => {
    const excelData = []
    pickingRecords.PickingRecord.forEach(record => {
      excelData.push({
        日期: format(new Date(record.date), 'MM/dd/yyyy'),
        '商品代號/名稱':
          record.productNo === null || record.productNo === ''
            ? record.productName
            : record.productNo + ' / ' + record.productName,
        單價: record.price,
        數量: record.count,
        小計: record.total,
        領料人: `${record.Picker.name}${record.Picker.designerNo ? `/${record.Picker.designerNo}` : ''
          }`,
        用途: record.purpose,
        備註: record.remark,
      })
    })
    excelData.push({
      日期: '合計',
      數量: total('count'),
      小計: total('total'),
    })
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pickingRecords, pageRef.current])

  const total = key => {
    return pickingRecords.PickingRecord.reduce((accu, curVal) => accu + curVal[key], 0)
  }

  const handleSelectAll = event => {
    let newSelectedPayment = []
    if (blockPicking) {
      if (event.target.checked) {
        pickingRecords.PickingRecord.forEach(({ id, isClosed }) => {
          if (!isClosed) newSelectedPayment.push(id)
        })
      }
    } else {
      newSelectedPayment = event.target.checked ? recordArr : []
    }
    setSelectedOrders(newSelectedPayment)
  }

  const handleCheckedAll = () => {
    const selectableLength = (
      blockPicking ? pickingRecords.PickingRecord.filter(({ isClosed }) => !isClosed).length : recordArr.length
    )
    return selectedOrders.length === selectableLength && selectableLength > 0
  }

  const handlecheckIndeterminate = () => {
    const selectableLength = (
      blockPicking ? pickingRecords.PickingRecord.filter(({ isClosed }) => !isClosed).length : recordArr.length
    )
    return selectedOrders.length > 0 && selectedOrders.length < selectableLength
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

  const handleDelete = () => {
    deletePicking(selectedOrders).then(() => {
      openSnackbar({
        message: '刪除 員工領料/自購 成功',
        variant: 'success',
      })
      window.location.reload()
    })
  }
  return (
    <Fragment>
      <div {...rest} css={css([styles.root, className])}>
        <Card>
          <CardHeader
            css={styles.cardHeader}
            action={
              <CSVLink
                data={excelData}
                filename="材料自購登錄.csv"
              >
                <Button variant="contained" css={styles.csvBtn} size="small">
                  報表匯出
                </Button>
              </CSVLink>
            }
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>材料自購登錄列表</span>
                <Typography color="textSecondary" variant="body2">
                  共 {pickingRecords.totalCount} 筆
                </Typography>
              </div>
            }
          />
          <CardContent css={styles.content}>
            <PerfectScrollbar>
              <div css={styles.inner}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell css={styles.sticky1} padding="checkbox">
                        <Checkbox
                          checked={handleCheckedAll()}
                          color="primary"
                          indeterminate={handlecheckIndeterminate()}
                          onChange={handleSelectAll}
                          disabled={recordArr.length === 0}
                        />
                      </TableCell>
                      <TableCell css={styles.sticky2} style={{ width: '52px' }}>操作</TableCell>
                      <TableCell css={styles.sticky3} style={{ width: '120px' }}>日期</TableCell>
                      <TableCell>商品代號/名稱</TableCell>
                      <TableCell>單價</TableCell>
                      <TableCell>數量</TableCell>
                      <TableCell>小計</TableCell>
                      <TableCell>領料人</TableCell>
                      <TableCell>用途</TableCell>
                      <TableCell>備註</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pickingRecords.PickingRecord.map((record, index) => {
                      return (
                        <TableRow key={record.id} css={styles.tableRow}>
                          <TableCell css={styles.sticky1} padding="checkbox">
                            <Checkbox
                              color="primary"
                              disabled={blockPicking ? record.isClosed : false}
                              checked={selectedOrders.indexOf(record.id) > -1}
                              onChange={() => handleSelectOne(record.id)}
                              inputProps={{
                                'data-testid': `order-checkbox-${index}`,
                              }}
                            />
                          </TableCell>
                          <TableCell css={styles.sticky2}>
                            <IconButton
                              color="primary"
                              component={RouterLink}
                              size="small"
                              to={`/employee/picking/edit/${record.id}`}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell css={styles.sticky3}>{format(new Date(record.date), 'MM/dd/yyyy')}</TableCell>
                          <TableCell>
                            {record.productNo === null || record.productNo === ''
                              ? record.productName
                              : record.productNo + ' / ' + record.productName}
                          </TableCell>
                          <TableCell>{record.price}</TableCell>
                          <TableCell>{record.count}</TableCell>
                          <TableCell>{record.total}</TableCell>
                          <TableCell>
                            {record.Picker.name}
                            {record.Picker.designerNo ? `/${record.Picker.designerNo}` : ''}
                          </TableCell>
                          <TableCell>{record.purpose}</TableCell>
                          <TableCell>{record.remark}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow css={styles.tableRow}>
                      <TableCell css={styles.sticky1} />
                      <TableCell css={styles.sticky2} style={{ fontWeight: 'bold', width: '52px' }}>合計</TableCell>
                      <TableCell css={styles.sticky3} style={{ width: '120px' }} />
                      <TableCell />
                      <TableCell />
                      <TableCell>{total('count')}</TableCell>
                      <TableCell>{total('total')}</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </PerfectScrollbar>
          </CardContent>
          {/* <CardActions css={styles.actions}>
            <TablePagination
              ref={pageRef}
              labelRowsPerPage='每頁顯示數量'
              component="div"
              count={pickingRecords.totalCount}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              page={pickingRecords.pageOffset}
              rowsPerPage={pickingRecords.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50, 500, 1000]}
            />
          </CardActions> */}
        </Card>
      </div>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <div {...rest} css={css([styles.root, className])}>
          <Grid alignItems="center" container style={{ padding: '16px' }}>
            <Hidden smDown>
              <Grid item md={4}>
                <Typography color="textSecondary" variant="subtitle1">
                  {selectedOrders.length} selected
                </Typography>
              </Grid>
            </Hidden>
            <Grid item xs={4} >
              <div css={styles.actionsDrawer}>
                <Button onClick={() => handleDelete()}>
                  <DeleteForeverIcon css={styles.buttonIcon} />
                  刪除
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>
      </Drawer>
    </Fragment>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
