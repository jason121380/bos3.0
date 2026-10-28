import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import useFetchDeleteMembershipCategory from 'hooks/useFetchDeleteMembershipCategory'
import { Pencil } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ className, categories, ...rest }) {
  // 被選的checkbox
  const [selectedCategories, setSelectedCcategories] = useState([])

  // 可勾選的分類（停用中的不能勾）：表頭全選以此判斷是否已全選（Jason 2026/10/22 授權修正：原本與含停用的總數比，有停用分類時永遠不會全選、再按也無法取消）
  const selectableCount = categories.filter(d => d.isUsing).length
  const isAllSelected = selectableCount > 0 && selectedCategories.length === selectableCount

  // 刪除會員卡的mutation
  const { deleteMembershipCategory } = useFetchDeleteMembershipCategory()

  // 全選checkbox
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? categories.filter(d => d.isUsing).map(d => d.uuid) : []
    setSelectedCcategories(newSelected)
  }

  // 單選checkbox
  const handleSelectOne = uuid => {
    const newSelect = [...selectedCategories], index = newSelect.indexOf(uuid)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(uuid)
    }
    setSelectedCcategories(newSelect)
  }

  // 刪除會員卡
  const handleDelete = () => {
    deleteMembershipCategory(selectedCategories)
      .then(() => {
        setSelectedCcategories([])
        openSnackbar({ message: '成功刪除會員卡類別', variant: 'success' })
        window.location.reload()
      })
      .catch(err => {
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      })
  }
  return (
    <div {...rest} className="mt-2">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>會員卡分類列表</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {categories.length} 筆
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
                    checked={isAllSelected}
                    indeterminate={selectedCategories.length > 0 && !isAllSelected}
                    onChange={handleSelectAll}
                    disabled={
                      categories.length === 0 ||
                      categories.filter(d => !d.isUsing).length === categories.length
                    }
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>代號</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>變更者</TableHead>
                <TableHead>變更時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((data, index) => (
                <TableRow
                  key={`${data.name}-${data.no}-${index}`}
                  data-state={selectedCategories.indexOf(data.uuid) > -1 || !data.isUsing ? 'selected' : undefined}
                  data-testid="category-row"
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      onChange={() => handleSelectOne(data.uuid)}
                      checked={selectedCategories.indexOf(data.uuid) > -1}
                      disabled={!data.isUsing}
                      data-testid={`category-${data.name}-checkbox`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="text-text-tertiary" aria-label="編輯分類">
                      <RouterLink to={`/member-card-category/edit/${data.uuid}`}>
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums">{data.no}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{idx(data, _ => _.creator.name)}</TableCell>
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

Results.propTypes = {
  className: PropTypes.object,
  categories: PropTypes.array,
}

Results.defaultProps = {
  categories: [],
}

export default Results
