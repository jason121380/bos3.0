import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useFetchDeleteDeductionSetting } from 'hooks/useFetchSetDeductionSetting'

function DeductionResults({ className, deductionData, deduction, ...rest }) {
  const [selected, setSelected] = useState([])
  const { deleteDeductionSetting } = useFetchDeleteDeductionSetting()
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? deductionData.map(payment => payment.id) : []
    setSelected(newSelected)
  }
  const handleSelectOne = id => {
    const newSelect = [...selected], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelected(newSelect)
  }
  const handleSeletedDelete = () => {
    deleteDeductionSetting(selected)
      .then(() => {
        setSelected([])
        deduction.refetch()
        openSnackbar({ message: '刪除成功抽成方式設定', variant: 'success' })
      }).catch((error) => {
        setSelected([])
        openSnackbar({ message: error.message, variant: 'error' })
      })
  }
  return (
    <div {...rest}>
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        aria-label="全選"
                        checked={
                          selected.length === deductionData.length && deductionData.length > 0
                        }
                        indeterminate={
                          selected.length > 0 && selected.length < deductionData.length
                        }
                        onChange={handleSelectAll}
                        disabled={deductionData.length === 0}
                      />
                    </TableHead>
                    <TableHead style={{ width: '150px' }}>操作</TableHead>
                    <TableHead>編號</TableHead>
                    <TableHead>名稱</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductionData.map((data, idx) => (
                    <TableRow key={`${data.name}-${idx}`} data-testid="table-row" data-state={selected.indexOf(data.id) > -1 ? 'selected' : undefined}>
                      <TableCell className="w-12">
                        <Checkbox
                          aria-label={`選取 ${data.name}`}
                          onChange={() => handleSelectOne(data.id)}
                          checked={selected.indexOf(data.id) > -1}
                          data-testid={`update-deduction-setting-selector-${idx}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="secondary">
                          <RouterLink
                            to={`/update-deduction-setting/${data.id}`}
                            data-testid={`update-deduction-setting-${idx}`}
                          >
                            編輯
                          </RouterLink>
                        </Button>
                      </TableCell>
                      <TableCell>{data.no}</TableCell>
                      <TableCell data-testid={`update-deduction-setting-${data.name}`}>{data.name}</TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
      <TableEditBar selected={selected} onDelete={handleSeletedDelete} />
    </div>
  )
}

DeductionResults.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

DeductionResults.defaultProps = {
  customers: [],
}

export default DeductionResults
