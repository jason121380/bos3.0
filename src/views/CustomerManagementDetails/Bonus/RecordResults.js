/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Checkbox,
  TableRow,
  Typography,
  Grid,
} from '@mui/material'
import clsx from 'clsx'
import TableEditBar from 'components/TableEditBar'
import useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0
  }),
  inner: css({
    minWidth: 800,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  addWalletDiv: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  addWalletBtn: css({
    marginBottom: '10px',
  }),
  valueContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  item: css({
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      '&:not(:last-of-type)': {
        borderRight: `none`,
      },
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:last-of-type)': {
        borderBottom: `1px solid #424242`,
      },
    },
  }),
  balance: css({
    margin: theme.spacing(3, 0, 3, 0),
  }),
}

function Results({
  className,
  recordData,
  customer,
  refetch,
  ...rest
}) {
  const [selectedRecord, setSelectedRecord] = useState([])
  const { deleteBonus } = useFetchDeleteBonusDeposit()
  const handleSelectAll = event => {
    const newSelected = event.target.checked
      ? recordData.map(data => data.id)
      : []
    setSelectedRecord(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedRecord], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedRecord(newSelect)
  }

  const handleDelete = () => {
    deleteBonus({
      bonusId: selectedRecord
    }).then(res => {
      if (res.data.deleteBonusDeposit) {
        openSnackbar({
          message: '刪除成功',
          variant: 'success'
        })
        setSelectedRecord([])
        refetch()
      } else {
        openSnackbar({
          message: '刪除失敗',
          variant: 'warning'
        })
      }
    }).catch(error => {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    })
  }

  return (
    <div {...rest} css={clsx([styles.root, className])}>
      <Card css={styles.balance}>
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid css={styles.item} item md={12} sm={12} xs={12}>
            <Typography component="h2" gutterBottom variant="h6">
              紅利點數餘額
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{recordData.reduce((a, b) => a + b.bonus, 0)}</Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
      <div css={styles.addWalletDiv}>
        <Typography color="textSecondary" variant="body2">
          共 {recordData.length} 筆資料
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ backgroundColor: 'rgb(var(--accent))' }}
          component={RouterLink}
          css={styles.addWalletBtn}
          to={`/customer-bonus-record/create/${customer.id}`}
        >
          新增紅利點數
        </Button>
      </div>
      <Card>
        <CardHeader title="紅利點數紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedRecord.length === recordData.length && recordData.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedRecord.length > 0 &&
                          selectedRecord.length < recordData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>顧客代號</TableCell>
                    <TableCell>顧客名稱</TableCell>
                    <TableCell>點數</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recordData.map(data => (
                    <TableRow
                      hover
                      key={data.id}
                      selected={selectedRecord.indexOf(data.id) > -1}
                      data-testid="category-row"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedRecord.indexOf(data.id) > -1}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/customer-bonus-record/edit/${data.id}`}
                          variant="outlined"
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{data.customerNo}</TableCell>
                      <TableCell>{data.customerName}</TableCell>
                      <TableCell>{data.bonus}</TableCell>
                      <TableCell>{data.designerName}</TableCell>
                      <TableCell>{data.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
      <TableEditBar selected={selectedRecord} onDelete={handleDelete} />
    </div>
  )
}

export default Results