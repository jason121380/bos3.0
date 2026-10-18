/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead, TableRow, Typography, TableContainer, CardHeader, IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSetDeleteMerchantVendor from 'hooks/useFetchSetDeleteMerchantVendor'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const localStyles = {
  root: css({}),
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
    '&.Mui-selected': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
  }),
  actionButton: css({
    color: 'rgb(var(--text-tertiary))',
    padding: '4px',
    '&:hover': {
      color: 'rgb(var(--accent))',
      backgroundColor: 'rgba(26, 115, 232, 0.04)',
    },
  }),
}

function Results({ className, merchantVendor, merchantVendorList, ...rest }) {
  const [selectedVendor, setSelectedVendor] = useState([])
  const { deleteMerchantVendor } = useFetchSetDeleteMerchantVendor()

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked
      ? merchantVendor.map(payment => payment.uuid)
      : []
    setSelectedVendor(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedVendor], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedVendor(newSelect)
  }

  const handleDelete = () => {
    deleteMerchantVendor({
      merchantVendorUUIds: selectedVendor,
    }).then(res => {
      if (res.data.deleteMerchantVendor) {
        openSnackbar({ message: '刪除成功', variant: 'success' })
        merchantVendorList.refetch()
      } else {
        openSnackbar({ message: '刪除失敗', variant: 'error' })
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
    })
  }
  return (
    <div {...rest} css={localStyles.root}>
      <Card css={localStyles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
                所有廠商
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {merchantVendor.length} 筆資料
              </Typography>
            </div>
          }
        />
        <CardContent css={localStyles.content}>
          <TableContainer>
            <Table size="small">
              <TableHead css={localStyles.tableHead}>
                <TableRow>
                  <TableCell padding="checkbox" width={50}>
                    <Checkbox
                      checked={
                        selectedVendor.length === merchantVendor.length && merchantVendor.length > 0
                      }
                      color="primary"
                      indeterminate={
                        selectedVendor.length > 0 &&
                        selectedVendor.length < merchantVendor.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell width={80}>代號</TableCell>
                  <TableCell>廠商名稱</TableCell>
                  <TableCell>暱稱</TableCell>
                  <TableCell>備註</TableCell>
                  <TableCell align="right" width={60}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchantVendor.map(data => (
                  <TableRow
                    key={data.uuid}
                    css={localStyles.tableRow}
                    selected={selectedVendor.indexOf(data.uuid) > -1}
                  >
                    <TableCell padding="checkbox" width={50}>
                      <Checkbox
                        color="primary"
                        onChange={() => handleSelectOne(data.uuid)}
                        checked={selectedVendor.indexOf(data.uuid) > -1}
                      />
                    </TableCell>
                    <TableCell width={80}>{data.no}</TableCell>
                    <TableCell style={{ fontWeight: '500' }}>{data.name}</TableCell>
                    <TableCell>{data.nickname}</TableCell>
                    <TableCell>{data.remark}</TableCell>
                    <TableCell align="right" width={60}>
                      <IconButton
                        css={localStyles.actionButton}
                        component={RouterLink}
                        size="small"
                        to={`/merchant-vendor/edit/${data.uuid}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <TableEditBar selected={selectedVendor} onDelete={handleDelete} />
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
