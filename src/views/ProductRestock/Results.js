/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, Divider, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, Drawer, Checkbox,
  Grid, Hidden, TableContainer
} from '@mui/material'
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

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: '0 0 20px 0',
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
      <div {...rest} css={styles.root}>
        <Typography color="textSecondary" gutterBottom variant="body2">
        </Typography>
        <Card>
          <Divider />
          <CardContent css={styles.content}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
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
                    <TableCell />
                    <TableCell>單號</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>廠商</TableCell>
                    <TableCell>進貨人</TableCell>
                    <TableCell>金額</TableCell>
                    <TableCell>異動日期</TableCell>
                    <TableCell>備註</TableCell>
                    <TableCell>入庫時間</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseRecords.map((data, index) => {
                    return (
                      <TableRow key={`${data.no}-${index}`}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            disabled={!!data.stockInDate}
                            checked={selectId.indexOf(data.uuid) > -1}
                            onChange={() => selectOne(data.uuid)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            color="primary"
                            component={RouterLink}
                            size="small"
                            to={`/product/restock/edit/${data.uuid}`}
                            variant="outlined"
                          >
                            {data.stockInDate ? '查看' : '編輯'}
                          </Button>
                        </TableCell>
                        <TableCell>{data.no}</TableCell>
                        <TableCell>{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{data.vendorName}</TableCell>
                        <TableCell>{data.operatorName}</TableCell>
                        <TableCell>{data.summary}</TableCell>
                        <TableCell>
                          {format(new Date(data.updatedAt), 'yyyy-MM-dd-HH:MM')}
                        </TableCell>
                        <TableCell>{data.remark}</TableCell>
                        <TableCell>{data.stockInDate && format(new Date(data.stockInDate), 'yyyy-MM-dd-HH:MM')}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleCheck(data)}
                            sx={{ wordBreak: 'keep-all' }} 
                            variant='contained'
                            color={data.stockInDate ? 'error' : 'success'}
                          >{data.stockInDate ? '取消入庫' : '入庫'}</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions css={styles.actions}>
          </CardActions>
        </Card>
      </div>
      <Drawer anchor="bottom" open={open} PaperProps={{ elevation: 1 }} variant="persistent">
        <div {...rest} css={styles.root}>
          <Grid alignItems="center" container style={{ padding: '16px' }}>
            <Hidden smDown>
              <Grid item md={4}>
                <Typography color="textSecondary" variant="subtitle1">
                  {selectId.length} selected
                </Typography>
              </Grid>
            </Hidden>
            <Grid item xs={4} container alignItems="center">
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
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
