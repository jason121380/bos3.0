import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteServiceCategories from 'hooks/useFetchDeleteServiceCategories'
import format from 'date-fns/format'
import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Edit as EditIcon } from 'ui/icons'
import idx from 'idx'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

function Results({ className, categories, refetchCategories, ...rest }) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const { delServiceCategories } = useFetchDeleteServiceCategories()
  // 只有啟用中的分類可勾選；全選框以可選取的筆數判斷
  const selectableCount = categories.filter(category => category.isUsing).length
  const handleSelectAll = event => {
    const selectedCategories = event.target.checked
      ? categories.filter(category => category.isUsing).map(category => category.id)
      : []
    setSelectedCategories(selectedCategories)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedCategories], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCategories(newSelect)
  }
  const handleDelete = async () => {
    try {
      await delServiceCategories({
        categories: selectedCategories,
      })
      openSnackbar({
        variant: 'success',
        message: '刪除成功',
      })
      refetchCategories()
      setSelectedCategories([])
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  return (
    <div {...rest}>
      <Card>
        <CardHeader>
          <div className="flex items-baseline gap-3">
            <CardTitle>
              所有服務類別
            </CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {categories.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5 pt-4">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectedCategories.length === selectableCount && selectableCount > 0}
                    indeterminate={
                      selectedCategories.length > 0 &&
                      selectedCategories.length < selectableCount
                    }
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16">操作</TableHead>
                <TableHead className="text-center">代號</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>歸屬</TableHead>
                <TableHead>備註</TableHead>
                <TableHead>變更者</TableHead>
                <TableHead>變更時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((data, idx) => (
                <TableRow
                  key={`service-categories-${idx}`}
                  data-state={selectedCategories.indexOf(data.id) !== -1 ? 'selected' : undefined}
                  aria-disabled={!data.isUsing || undefined}
                  data-testid="category-row"
                >
                  <TableCell className="w-12">
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      checked={selectedCategories.indexOf(data.id) !== -1}
                      value={selectedCategories.indexOf(data.id) !== -1}
                      onChange={() => handleSelectOne(data.id)}
                      disabled={!data.isUsing}
                      data-testid={`category-${data.name}-checkbox`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className={cn('h-8 w-8 text-text-secondary', !data.isUsing && 'pointer-events-none opacity-40')}
                    >
                      <RouterLink
                        aria-label={`編輯 ${data.name}`}
                        aria-disabled={!data.isUsing || undefined}
                        tabIndex={!data.isUsing ? -1 : undefined}
                        to={`/service/category/edit/${data.id}`}
                      >
                        <EditIcon fontSize="small" />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">{data.no}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{data.attribution}</TableCell>
                  <TableCell>{data.remark}</TableCell>
                  <TableCell>{data.creator.name}</TableCell>
                  <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selectedCategories} onDelete={handleDelete} />
    </div>
  )
}

export default Results
