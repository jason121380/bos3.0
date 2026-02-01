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
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  TableContainer
} from '@mui/material'
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
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {employees.length} 筆
      </Typography>
      <Card>
        <CardHeader title="離職員工" />
        <Divider />
        <CardContent css={styles.content}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
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
                  <TableCell>姓名/電話</TableCell>
                  <TableCell>設計師編號</TableCell>
                  <TableCell>暱稱</TableCell>
                  <TableCell>離職日期</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((data, idx) => (
                  <TableRow key={`employee-item-${idx}`}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedDesigners.indexOf(data.id) > -1}
                        onChange={() => handleSelectOne(data.id)}
                      />
                    </TableCell>
                    <TableCell>
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
                    <TableCell>{data.designerNo}</TableCell>
                    <TableCell>{data.nickName}</TableCell>
                    <TableCell>{format(data.deletedAt, 'yyyy/MM/dd')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
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
