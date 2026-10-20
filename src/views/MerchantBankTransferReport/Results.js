/** @jsxImportSource @emotion/react */
import PropTypes from 'prop-types'
import { cloneDeep } from 'lodash'
import { useState, useEffect } from 'react'
import { theme } from '../../theme'
import { css } from '@emotion/react'
import { Card as UiCard, CardContent as UiCardContent } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Checkbox } from 'ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from 'ui/table'

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
    marginTop: '24px',
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
        <UiCard className="mt-6">
          <EmptyState title="無資料" />
        </UiCard>
      ) : (
        // 列印規則 .MerchantBankTransferReport .MerchantBankTransferReportTable 以本卡片 class 命中（不依賴 MUI class），className 原樣保留
        <UiCard css={localStyles.card} className="MerchantBankTransferReportTable">
          <UiCardContent style={{ padding: 0 }}>
            <div>
              <Table dense wrapperClassName="rounded-none border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="noprint w-10">
                      <Checkbox
                        aria-label="全選"
                        checked={selectedUser.length === salaryData.length}
                        indeterminate={
                          selectedUser.length > 0 && selectedUser.length < salaryData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>分行別</TableHead>
                    <TableHead>帳號</TableHead>
                    <TableHead>戶名</TableHead>
                    <TableHead>轉帳金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.map((user, index) => (
                    <TableRow
                      key={index}
                      data-state={selectedUser.indexOf(user.id) > -1 ? 'selected' : undefined}
                      className={
                        !selectedUser.find(userId => userId === user.id) ? 'salaryTransferNoDsiplay' : ''
                      }
                    >
                      <TableCell className="noprint w-10">
                        <Checkbox
                          aria-label="選取"
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
                  <TableRow className="font-bold">
                    <TableCell className="noprint" />
                    <TableCell />
                    <TableCell />
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell>{handleCountTotalPrice()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </UiCardContent>
        </UiCard>
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
