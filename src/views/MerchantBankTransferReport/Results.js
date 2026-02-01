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

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
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
        <Card className="MerchantBankTransferReportTable">
          <CardContent css={styles.content} style={{ paddingBottom: 0, paddingLeft: 0 }}>
            <div css={styles.inner}>
              <Table>
                <TableHead>
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
                      style={{ background: 'white' }}
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
                  <TableRow>
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
