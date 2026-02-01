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
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSetDeleteMerchantVendor from 'hooks/useFetchSetDeleteMerchantVendor'
import { css } from '@emotion/react'

import styles from './styles/Results'

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
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        {merchantVendor.length} 筆資料
      </Typography>
      <Card>
        <CardContent css={styles.content}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
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
                  <TableCell>操作</TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>廠商名稱</TableCell>
                  <TableCell>暱稱</TableCell>
                  <TableCell>備註</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchantVendor.map(data => (
                  <TableRow
                    hover
                    key={data.uuid}
                    selected={selectedVendor.indexOf(data.uuid) > -1}
                    data-testid="category-row"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        onChange={() => handleSelectOne(data.uuid)}
                        checked={selectedVendor.indexOf(data.uuid) > -1}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        color="primary"
                        component={RouterLink}
                        size="small"
                        to={`/merchant-vendor/edit/${data.uuid}`}
                        variant="outlined"
                      >
                        編輯
                      </Button>
                    </TableCell>
                    <TableCell>{data.no}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>{data.nickname}</TableCell>
                    <TableCell>{data.remark}</TableCell>
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
