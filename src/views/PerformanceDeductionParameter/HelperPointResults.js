import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import clsx from 'clsx'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchDeleteMerchantPointValueSetting from 'hooks/useFetchDeleteMerchantPointValueSetting'
import { formatNumber } from 'ui/format'

function HelperPointResults({ className, merchantPointValueSettings, merchantPointValueData, ...rest }) {
  const [selected, setSelected] = useState([])
  const { deleteMerchantPointValueSetting } = useFetchDeleteMerchantPointValueSetting()
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? merchantPointValueData.map(d => d.id) : []
    setSelected(newSelected)
  }
  const handleSelectOne = id => {
    const newSelect = [...selected],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelected(newSelect)
  }
  const handleSelectedDelete = () => {
    deleteMerchantPointValueSetting(selected)
      .then(res => {
        if (res.data.deleteMerchantPointValueSetting) {
          setSelected([])
          openSnackbar({ message: '刪除成功', variant: 'success' })
          merchantPointValueSettings.refetch()
        } else {
          openSnackbar({ message: '刪除失敗', variant: 'warning' })
        }
      })
      .catch(error => {
        setSelected([])
        openSnackbar({ message: error.message, variant: 'error' })
      })
  }
  const retrievePointWay = type => {
    switch (type) {
      case 'FIXED':
        return '固定金額'
      case 'NONSEGMENTED':
        return '全段'
      case 'SEGMENTED':
        return '分段'
      default:
        break
    }
  }
  return (
    <div {...rest}>
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                aria-label="全選"
                checked={selected.length === merchantPointValueData.length && merchantPointValueData.length > 0}
                indeterminate={selected.length > 0 && selected.length < merchantPointValueData.length}
                onChange={handleSelectAll}
                disabled={merchantPointValueData.length === 0}
              />
            </TableHead>
            <TableHead style={{ width: '150px' }}>操作</TableHead>
            <TableHead>名稱</TableHead>
            <TableHead numeric>點數使用換算金額</TableHead>
            <TableHead>類型</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchantPointValueData.map((data, idx) => (
            <TableRow key={`${data.name}-${idx}`} data-testid="table-row" data-state={selected.indexOf(data.id) > -1 ? 'selected' : undefined}>
              <TableCell className="w-12">
                <Checkbox aria-label={`選取 ${data.name}`} onChange={() => handleSelectOne(data.id)} checked={selected.indexOf(data.id) > -1} />
              </TableCell>
              <TableCell>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/helper-point-setting-edit/${data.id}`} data-testid={`helper-point-setting-edit-${idx}`}>
                    編輯
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell>{data.name}</TableCell>
              <TableCell numeric>{formatNumber(data.paidFixed)}</TableCell>
              <TableCell>{retrievePointWay(data.retrievePointWay)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableEditBar selected={selected} onDelete={handleSelectedDelete} />
    </div>
  )
}

export default HelperPointResults
