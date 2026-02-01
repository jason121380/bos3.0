import {
  Button, Card, CardContent, CardHeader, Checkbox, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, CardActions, TablePagination, Dialog, DialogTitle, DialogActions
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import format from 'date-fns/format'
import { useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchDeleteMembership from 'hooks/useFetchDeleteMembership'
import useFetchMultipleUpdateMembershipCategory from 'hooks/useFetchMultipleUpdateMembershipCategory'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1000,
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
}

import EditMemberCardRecordModal from './EditMemberCardRecordModal'

function Results({ className, memberships, setCategoryFilter, onPageChange, categories, ...rest }) {
  const { multipleUpdateMembershipCategory } = useFetchMultipleUpdateMembershipCategory()
  const { deleteMembership } = useFetchDeleteMembership()
  // 選會員卡
  const [selectedMembership, setSelectedMembership] = useState([])
  // 是否打開brawer的宣告
  const [openDialog, setOpenDialog] = useState(false)
  //是否打開批量改類別
  const [openEditMembershipsCategoryModal, setOpenEditMembershipsCategoryModal] = useState(false)
  //選類別的ID
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [excelData, setExcelData] = useState([])

  // 多選checkbox
  const handleSelectAll = event => {
    const newSelected = event.target.checked
      ? memberships.data.filter(d => d.isUsing).map(d => d.uuid)
      : []
    setSelectedMembership(newSelected)
  }

  // 單選checkbox
  const handleSelectOne = uuid => {
    const newSelect = [...selectedMembership], index = newSelect.indexOf(uuid)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(uuid)
    }
    setSelectedMembership(newSelect)
  }

  // 刪除會員卡
  const handleConfirmCancel = () => {
    deleteMembership(selectedMembership)
      .then(() => {
        setSelectedMembership([])
        setOpenDialog(false)
        openSnackbar({ message: '成功刪除會員卡', variant: 'success' })
        window.location.reload()
      })
      .catch(err => {
        setSelectedMembership([])
        setOpenDialog(false)
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
      })
  }

  // 換頁
  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
  }

  // 換一頁裡面呈現出來的筆數
  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
  }

  // 關閉批量修改的modal
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  //打開批量修改的modal
  const handleOpenEditMembershipCategoryModal = () => {
    setOpenEditMembershipsCategoryModal(true)
  }

  // 批量修改的modal 的 submit
  const handleUpdateMembershipsCategory = () => {
    const tmp = {
      membershipUUIDs: selectedMembership,
      membershipCategoryUUIDs: selectedCategoryId,
    }
    multipleUpdateMembershipCategory(tmp)
      .then(() => {
        setSelectedMembership([])
        setSelectedCategoryId('')
        setOpenEditMembershipsCategoryModal(false)
        openSnackbar({ message: '編輯會員類別成功', variant: 'success' })
        window.location.reload()
      })
      .catch(err => {
        setSelectedMembership([])
        setSelectedCategoryId('')
        setOpenEditMembershipsCategoryModal(false)
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
      })
  }

  // 匯出
  useEffect(() => {
    const excelData = []
    memberships.data.forEach(data => {
      excelData.push({
        代號: data.no,
        類別: data.membershipCategory === null ? '未分類' : data.membershipCategory.name,
        名稱: data.name,
        成本: data.cost,
        價格: data.sellPrice,
        變更者: data.creator !== null ? data.creator.name : '',
        變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
      })
    })
    setExcelData(excelData)
  }, [memberships])

  return (
    <div {...rest} css={css([styles.root, className])} className='MemberCardRecordResult'>
      <Card>
        <CardHeader
          css={styles.cardHeader}
          action={
            <CSVLink data={excelData} filename="會員卡列表.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>所有會員卡</span>
              <Typography color="textSecondary" variant="body2">
                共 {memberships.data.length} 筆
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedMembership.length === memberships.data.length &&
                          memberships.data.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedMembership.length > 0 &&
                          selectedMembership.length < memberships.data.length
                        }
                        onChange={handleSelectAll}
                        disabled={
                          memberships.data.length === 0 ||
                          memberships.data.filter(d => !d.isUsing).length ===
                          memberships.data.length
                        }
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>成本</TableCell>
                    <TableCell>價格</TableCell>
                    <TableCell>變更者</TableCell>
                    <TableCell>變更時間</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberships.data.map((data, idx) => (
                    <TableRow
                      key={`membership-${data.name}-${idx}`}
                      css={styles.tableRow}
                      selected={selectedMembership.indexOf(data.uuid) > -1 || !data.isUsing}
                      data-testid="membership-row"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedMembership.indexOf(data.uuid) > -1}
                          onChange={() => handleSelectOne(data.uuid)}
                          inputProps={{
                            'data-testid': `membership-${data.name}-checkbox`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/member-card/edit/${data.uuid}`}
                          variant="outlined"
                          disabled={!data.isUsing}
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{data.no}</TableCell>
                      <TableCell>
                        {data.membershipCategory === null ? '未分類' : data.membershipCategory.name}
                      </TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.cost}</TableCell>
                      <TableCell>{data.sellPrice}</TableCell>
                      <TableCell>{data.creator !== null ? data.creator.name : ''}</TableCell>
                      <TableCell>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          {/* <TablePagination
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={1}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={memberships.pageOffset}
            rowsPerPage={memberships.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          /> */}
        </CardActions>
      </Card>
      <TableEditBar
        selected={selectedMembership}
        onDelete={handleConfirmCancel}
        onEditMembershipCategory={handleOpenEditMembershipCategoryModal}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除會員卡'}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogActions>
      </Dialog>
      {openEditMembershipsCategoryModal && (
        <EditMemberCardRecordModal
          openEditMembershipsCategoryModal={openEditMembershipsCategoryModal}
          onClose={() => setOpenEditMembershipsCategoryModal(false)}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          handleUpdateMembershipsCategory={handleUpdateMembershipsCategory}
        />
      )}
    </div>
  )
}

export default Results
