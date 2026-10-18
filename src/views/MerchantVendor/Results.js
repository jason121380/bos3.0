import { Pencil } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSetDeleteMerchantVendor from 'hooks/useFetchSetDeleteMerchantVendor'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

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
    <div {...rest}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>所有廠商</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {merchantVendor.length} 筆資料
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedVendor.length === merchantVendor.length && merchantVendor.length > 0
                    }
                    indeterminate={
                      selectedVendor.length > 0 &&
                      selectedVendor.length < merchantVendor.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[80px]">代號</TableHead>
                <TableHead>廠商名稱</TableHead>
                <TableHead>暱稱</TableHead>
                <TableHead>備註</TableHead>
                <TableHead className="w-[60px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantVendor.map(data => (
                <TableRow
                  key={data.uuid}
                  data-state={selectedVendor.indexOf(data.uuid) > -1 ? 'selected' : undefined}
                >
                  <TableCell className="w-[50px]">
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      onChange={() => handleSelectOne(data.uuid)}
                      checked={selectedVendor.indexOf(data.uuid) > -1}
                    />
                  </TableCell>
                  <TableCell className="w-[80px] tabular-nums">{data.no}</TableCell>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell>{data.nickname}</TableCell>
                  <TableCell>{data.remark}</TableCell>
                  <TableCell className="w-[60px] text-right">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <RouterLink
                        aria-label="編輯廠商"
                        to={`/merchant-vendor/edit/${data.uuid}`}
                      >
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
