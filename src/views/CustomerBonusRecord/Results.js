/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { css } from '@emotion/react'

import styles from './styles/Results'

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
    <div {...rest} css={css(styles.root, className)}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        {recordData.length} 筆資料
      </Typography>
      <Card>
        <CardContent css={styles.content}>
          <TableContainer style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <Table>
              <TableHead>
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