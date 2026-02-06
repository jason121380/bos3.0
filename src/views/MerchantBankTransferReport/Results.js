/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, Checkbox, Typography
} from '@mui/material'
import PropTypes from 'prop-types'
import { cloneDeep } from 'lodash'
import { useState, useEffect } from 'react'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: '24px',
  }),
  tableHead: css({
    backgroundColor: '#FFFFFF',
    '& .MuiTableCell-head': {
      backgroundColor: '#f8f9fa',
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
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px !important',
      color: '#333',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  totalRow: css({
    backgroundColor: '#FFFFFF !important',
    height: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      fontWeight: 'bold !important',
      color: '#212121 !important',
      borderBottom: '1px solid #f0f0f0',
    }
  }),
}

function Results({ salaryData }) {
  const [selectedUser, setSelectedUser] = useState([])

  const handleSelectOne = id => {
    const newSelect = cloneDeep(selectedUser), index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedUser(newSelect)
  }
  const handleSelectAll = event => {
    const newSelecteduser = event.target.checked ? salaryData.map(user => user.id) : []
    setSelectedUser(newSelecteduser)
  }

  const handleCountTotalPrice = () => (
    salaryData.reduce((a, { id, increaseItem, decreaseItem }) => {
      return selectedUser.includes(id) ? a + (increaseItem - decreaseItem) : a + 0
    }, 0)
  )

  useEffect(() => {
    const newSelecteduser = salaryData.map(user => user.id)
    setSelectedUser(newSelecteduser)
  }, [salaryData])
  return (
    <>
      {salaryData.length === 0 ? (
        <Typography style={{ marginTop: 50 }} align='center' component="h1" variant="h3">
          無資料
        </Typography>
      ) : (
        <Card css={localStyles.card} className="MerchantBankTransferReportTable">
          <CardContent style={{ padding: 0 }}>
            <div>
              <Table size="small">
                <TableHead css={localStyles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox" className="noprint">
                      <Checkbox
                        color="primary"
                        checked={selectedUser.length === salaryData.length}
                        indeterminate={
                          selectedUser.length > 0 && selectedUser.length < salaryData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>分行別</TableCell>
                    <TableCell>帳號</TableCell>
                    <TableCell>戶名</TableCell>
                    <TableCell>轉帳金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryData.map((user, index) => (
                    <TableRow
                      key={index}
                      css={localStyles.tableRow}
                      selected={selectedUser.indexOf(user.id) > -1}
                      className={
                        !selectedUser.find(userId => userId === user.id) ? 'salaryTransferNoDsiplay' : ''
                      }
                    >
                      <TableCell padding="checkbox" className="noprint">
                        <Checkbox
                          color="primary"
                          checked={selectedUser.indexOf(user.id) > -1}
                          onChange={() => handleSelectOne(user.id)}
                        />
                      </TableCell>
                      <TableCell>{user.bankBranchName}</TableCell>
                      <TableCell>{user.bankAccount}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        {user.increaseItem - user.decreaseItem}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow css={localStyles.totalRow}>
                    <TableCell className="noprint" />
                    <TableCell />
                    <TableCell />
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell>{handleCountTotalPrice()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
