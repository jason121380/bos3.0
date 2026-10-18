/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  IconButton
} from '@mui/material'
import EditIconSlot from '@mui/icons-material/Edit';
import TableEditBar from 'components/TableEditBar'
import useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
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
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  actionButton: css({
    padding: '4px !important',
    color: 'rgb(var(--text-tertiary)) !important',
    '&:hover': {
      color: 'rgb(var(--accent)) !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
}

function Results({ className, recordData, refetch, ...rest }) {
  const { deleteBonus } = useFetchDeleteBonusDeposit()
  const [selectedRecord, setSelectedRecord] = useState([])

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
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                紅利點數紀錄
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {recordData.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          <TableContainer style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <Table size="small">
              <TableHead css={styles.tableHead}>
                <TableRow css={styles.stickyRow}>
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
                    key={data.id}
                    css={styles.tableRow}
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
                      <IconButton
                        component={RouterLink}
                        css={styles.actionButton}
                        size="small"
                        to={`/customer-bonus-record/edit/${data.id}`}
                      >
                        <EditIconSlot fontSize="small" />
                      </IconButton>
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
          </TableContainer>
        </CardContent>
      </Card>
      <TableEditBar selected={selectedRecord} onDelete={handleDelete} />
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  categories: PropTypes.array,
}

Results.defaultProps = {
  categories: [],
}

export default Results