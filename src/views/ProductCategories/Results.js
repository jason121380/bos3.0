/** @jsxImportSource @emotion/react */
import { Pencil } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteProductCategory from 'hooks/useFetchDeleteProductCategory'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ className, categories, refetchCategories, ...rest }) {
  const [selectedCategories, setSelectedCcategories] = useState([])
  const { deleteProductCategory } = useFetchDeleteProductCategory()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked
      ? categories.filter(d => d.isUsing).map(payment => payment.id)
      : []
    setSelectedCcategories(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedCategories], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCcategories(newSelect)
  }
  const handleDelete = async () => {
    try {
      await deleteProductCategory({
        itemIds: selectedCategories,
      })
      refetchCategories()
      setSelectedCcategories([])
      openSnackbar({ message: '成功刪除商品類別', variant: 'success' })
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  return (
    <div {...rest} css={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>所有商品類別</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {categories.length} 筆資料
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedCategories.length === categories.length && categories.length > 0
                    }
                    indeterminate={
                      selectedCategories.length > 0 &&
                      selectedCategories.length < categories.length
                    }
                    onChange={handleSelectAll}
                    disabled={
                      categories.length === 0 ||
                      categories.filter(d => !d.isUsing).length === categories.length
                    }
                  />
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>變更者</TableHead>
                <TableHead>變更時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((data, index) => {
                const isSelected = selectedCategories.indexOf(data.id) > -1
                return (
                  <TableRow
                    key={`${data.name}-${data.no}-${index}`}
                    data-state={isSelected || !data.isUsing ? 'selected' : undefined}
                    data-testid="category-row"
                  >
                    <TableCell className="w-12">
                      <Checkbox
                        aria-label={`選取 ${data.name}`}
                        onChange={() => handleSelectOne(data.id)}
                        checked={isSelected}
                        disabled={!data.isUsing}
                        data-testid={`category-${data.name}-checkbox`}
                      />
                    </TableCell>
                    <TableCell className="tabular-nums">{data.no}</TableCell>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell>{idx(data, _ => _.creator.name)}</TableCell>
                    <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                        <RouterLink
                          aria-label="編輯類別"
                          to={`/product/category/edit/${data.id}`}
                        >
                          <Pencil strokeWidth={1.75} />
                        </RouterLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selectedCategories} onDelete={handleDelete} />
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
