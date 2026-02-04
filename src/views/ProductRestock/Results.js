/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, Drawer, Checkbox,
  TableContainer, IconButton, Grid, Hidden
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PropTypes from 'prop-types'
import { useState, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { openSnackbar } from 'elements/snackbars'
import _ from 'lodash'
import useFetchDeletePurchase from 'hooks/useFetchDeletePurchase'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { CardHeader } from '@mui/material'

const localStyles = {
  root: css({}),
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1300,
  }),
  tableHead: css({
    backgroundColor: '#FFFFFF',
    '& .MuiTableCell-head': {
      color: '#212121',
      fontWeight: 'bold',
      borderBottom: '1px solid #f0f0f0',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected': {
      backgroundColor: '#f9f9f9 !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: '#f9f9f9 !important',
    },
  }),
  actionButton: css({
    color: '#9e9e9e',
    padding: '4px',
    '&:hover': {
      color: '#1A73E8',
      backgroundColor: 'rgba(26, 115, 232, 0.04)',
    },
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '2px 12px !important',
    fontSize: '12px !important',
    boxShadow: 'none !important',
    minWidth: '70px',
  }),
}

function Results({
  purchaseRecordsData,
  purchaseRecords,
  setPurchaseRecords,
  pickingRecords,
  onPageChange,
  onRowsPerPageChange,
  handleSearch,
  handleCheck,
  selectAllRecords,
  ...rest
}) {
  const { deletePurchase } = useFetchDeletePurchase()
  const [selectId, setSelectId] = useState([])

  const selectAllData = event => {
    const newSelectedId = event.target.checked ? selectAllRecords : []
    setSelectId(newSelectedId)
  }

  const selectOne = id => {
    const selectedIndex = selectId.indexOf(id)
    const newSelected = _.cloneDeep(selectId)
    if (selectedIndex === -1) {
      newSelected.push(id)
    } else {
      newSelected.splice(selectedIndex, 1)
    }
    setSelectId(newSelected)
  }

  const open = selectId.length > 0
  const recordArr = []
  purchaseRecords.map(record => {
    recordArr.push(record.id)
  })

  const handleDelete = () => {
    deletePurchase({
      purchaseUUIds: selectId,
    })
      .then(res => {
        if (res.data.deletePurchase) {
          openSnackbar({ message: '刪除成功', variant: 'success' })
          handleSearch()
        }
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
      })
  }

  return (
    <Fragment>
      <div {...rest} css={localStyles.root}>
        <Card css={localStyles.card}>
          <CardHeader
            title={
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                  所有進貨單
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  共 {purchaseRecords.length} 筆資料
                </Typography>
              </div>
            }
          />
          <CardContent css={localStyles.content}>
            <TableContainer>
              <Table size="small">
                <TableHead css={localStyles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox" width={50}>
                      <Checkbox
                        checked={selectId.length === selectAllRecords.length && selectAllRecords.length > 0}
                        color="primary"
                        onChange={event => selectAllData(event)}
                        disabled={selectAllRecords.length === 0}
                        indeterminate={
                          selectId.length > 0 && selectId.length < selectAllRecords.length
                        }
                      />
                    </TableCell>
                    <TableCell width={140}>單號</TableCell>
                    <TableCell width={110}>日期</TableCell>
                    <TableCell width={180}>廠商</TableCell>
                    <TableCell width={100}>進貨人</TableCell>
                    <TableCell width={100}>金額</TableCell>
                    <TableCell width={150}>異動時間</TableCell>
                    <TableCell>備註</TableCell>
                    <TableCell width={150}>入庫時間</TableCell>
                    <TableCell align="center" width={110}>狀態處理</TableCell>
                    <TableCell align="right" width={60}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseRecords.map((data, index) => {
                    const isSelected = selectId.indexOf(data.uuid) > -1
                    return (
                      <TableRow
                        key={`${data.no}-${index}`}
                        css={localStyles.tableRow}
                        selected={isSelected}
                      >
                        <TableCell padding="checkbox" width={50}>
                          <Checkbox
                            color="primary"
                            disabled={!!data.stockInDate}
                            checked={isSelected}
                            onChange={() => selectOne(data.uuid)}
                          />
                        </TableCell>
                        <TableCell width={140} style={{ fontWeight: '500' }}>{data.no}</TableCell>
                        <TableCell width={110}>{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell width={180}>{data.vendorName}</TableCell>
                        <TableCell width={100}>{data.operatorName}</TableCell>
                        <TableCell width={100}>{data.summary}</TableCell>
                        <TableCell width={150}>
                          {format(new Date(data.updatedAt), 'yyyy/MM/dd HH:mm')}
                        </TableCell>
                        <TableCell>{data.remark}</TableCell>
                        <TableCell width={150}>{data.stockInDate && format(new Date(data.stockInDate), 'yyyy/MM/dd HH:mm')}</TableCell>
                        <TableCell align="center" width={110}>
                          <Button
                            onClick={() => handleCheck(data)}
                            css={localStyles.pillButton}
                            variant='contained'
                            color={data.stockInDate ? 'error' : 'success'}
                          >{data.stockInDate ? '取消入庫' : '確認入庫'}</Button>
                        </TableCell>
                        <TableCell align="right" width={60}>
                          <IconButton
                            css={localStyles.actionButton}
                            component={RouterLink}
                            size="small"
                            to={`/product/restock/edit/${data.uuid}`}
                          >
                            {data.stockInDate ? <VisibilityIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions css={localStyles.actions}>
          </CardActions>
        </Card>
      </div>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <div {...rest} css={localStyles.root}>
          <Grid alignItems="center" container style={{ padding: '16px' }}>
            <Hidden smDown>
              <Grid item md={4}>
                <Typography color="textSecondary" variant="subtitle1">
                  已選取 {selectId.length} 筆項目
                </Typography>
              </Grid>
            </Hidden>
            <Grid item xs={4} container alignItems="center">
              <div>
                <Button color="error" variant="contained" onClick={() => handleDelete()} css={localStyles.pillButton}>
                  <DeleteForeverIcon sx={{ mr: 1, fontSize: '18px' }} />
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
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
