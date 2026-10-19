/** @jsxImportSource @emotion/react */
import { Avatar } from 'ui/avatar'
import PropTypes from 'prop-types'
import { useState } from 'react'
import TableEditBar from 'components/TableEditBar'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  content: css({
    padding: 0,
  }),
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
}

export default function Results({ className, employees, resignationList, setCreateResignedUser, ...rest }) {
  const [selectedDesigners, setSelectedDesigners] = useState([])

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? employees.map(employee => employee.id) : []
    setSelectedDesigners(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedDesigners], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedDesigners(newSelect)
  }
  const onReinstatement = () => {
    setCreateResignedUser({
      userIds: selectedDesigners
    }).then(d => {
      if (d.data.createResignedUser) {
        openSnackbar({
          message: '更改成功',
          variant: 'success'
        })
        resignationList.refetch()
      } else {
        openSnackbar({
          message: '更改失敗',
          variant: 'error'
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
      {/* 原 components/ManagementTable（MUI）改為 ui/card + ui/table；無分頁（原 hidePagination） */}
      <Card>
        <CardHeader className="items-center pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>離職員工</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">共 {employees.length} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedDesigners.length === employees.length && employees.length > 0
                    }
                    indeterminate={
                      selectedDesigners.length > 0 &&
                      selectedDesigners.length < employees.length
                    }
                    onChange={handleSelectAll}
                    disabled={employees.length === 0}
                  />
                </TableHead>
                <TableHead>姓名/電話</TableHead>
                <TableHead>設計師編號</TableHead>
                <TableHead>暱稱</TableHead>
                <TableHead>離職日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((data, idx) => (
                <TableRow key={`employee-item-${idx}`} data-state={selectedDesigners.indexOf(data.id) > -1 ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.lastName}${data.firstName}`}
                      checked={selectedDesigners.indexOf(data.id) > -1}
                      onChange={() => handleSelectOne(data.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="mr-2 h-[42px] w-[42px]" src={data.avatar} />
                      <div>
                        <div className="font-medium">
                          {data.lastName}
                          {data.firstName}
                        </div>
                        <div className="text-caption tabular-nums text-text-secondary">{data.cellphone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{data.designerNo}</TableCell>
                  <TableCell>{data.nickName}</TableCell>
                  <TableCell className="tabular-nums">{format(data.deletedAt, 'yyyy/MM/dd')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {employees.length === 0 && <EmptyState title="目前沒有離職員工" />}
        </div>
      </Card>
      <TableEditBar
        selected={selectedDesigners}
        onReinstatement={onReinstatement}
      />
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
