/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Checkbox,
} from '@mui/material'
import ManagementTable from 'components/ManagementTable'
import PropTypes from 'prop-types'
import { useState } from 'react'
import TableEditBar from 'components/TableEditBar'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
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
      <ManagementTable
        title="離職員工"
        totalCount={employees.length}
        hidePagination={true}
        tableHead={
          <>
            <TableCell padding="checkbox" css={styles.compactCell}>
              <Checkbox
                checked={
                  selectedDesigners.length === employees.length && employees.length > 0
                }
                color="primary"
                indeterminate={
                  selectedDesigners.length > 0 &&
                  selectedDesigners.length < employees.length
                }
                onChange={handleSelectAll}
                disabled={employees.length === 0}
              />
            </TableCell>
            <TableCell css={styles.compactCell}>姓名/電話</TableCell>
            <TableCell css={styles.compactCell}>設計師編號</TableCell>
            <TableCell css={styles.compactCell}>暱稱</TableCell>
            <TableCell css={styles.compactCell}>離職日期</TableCell>
          </>
        }
      >
        <TableBody>
          {employees.map((data, idx) => (
            <TableRow key={`employee-item-${idx}`}>
              <TableCell padding="checkbox" css={styles.compactCell}>
                <Checkbox
                  color="primary"
                  checked={selectedDesigners.indexOf(data.id) > -1}
                  onChange={() => handleSelectOne(data.id)}
                />
              </TableCell>
              <TableCell css={styles.compactCell}>
                <div css={styles.nameCell}>
                  <Avatar css={styles.avatar} src={data.avatar} />
                  <div>
                    <div
                      className='MuiTypography-h6'
                      style={{ color: "inherit" }}
                    >
                      {data.lastName}
                      {data.firstName}
                    </div>
                    <div>{data.cellphone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>{data.designerNo}</TableCell>
              <TableCell css={styles.compactCell}>{data.nickName}</TableCell>
              <TableCell css={styles.compactCell}>{format(data.deletedAt, 'yyyy/MM/dd')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ManagementTable>
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
