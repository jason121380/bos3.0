import { Fragment, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import format from 'date-fns/format'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

// 新增盤點／編輯盤點共用（2026/10/30 自兩頁合併，畫面與 handler 逐字保留）。
// info：編輯頁才傳（建立時間、建立者），新增頁不傳＝null，不顯示這一行。
function General({ info = null, isClick, inventoryData, setInventoryData, categoriesData, handleCreateInventory, sort, setSort }) {
  const [categories, setCategories] = useState([])

  const handleSelectVariant = id => {
    return categories.includes(id) ? 'contained' : 'outlined'
  }

  const handleClickCategory = id => {
    const index = categories.indexOf(id)
    const cloneData = cloneDeep(categories)
    if (index === -1) {
      cloneData.push(id)
    } else {
      cloneData.splice(index, 1)
    }
    setCategories(cloneData)
  }

  const handleCheckCount = count => {
    if (count === 0) {
      return 0
    } else if (count > 0) {
      return <span className="font-bold text-accent">{`+${formatNumber(count)}`}</span>
    } else {
      return <span className="font-bold text-danger">{formatNumber(count)}</span>
    }
  }

  const handleCheckRenderItem = categoryId => {
    if (!categories.length) return true
    return categories.includes(categoryId)
  }

  const Buttons = ({ sortDisplay = false }) => (
    <Fragment>
      {sortDisplay && (
        <div className="flex items-center gap-2 text-body text-text-secondary">
          <span>排序：</span>
          <ToggleGroup size="small" exclusive value={sort} onChange={(e, value) => value && setSort(value)}>
            <ToggleGroupItem value="inventory">庫存</ToggleGroupItem>
            <ToggleGroupItem value="no">代號</ToggleGroupItem>
            <ToggleGroupItem value="count">差異</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      <Button disabled={isClick} onClick={() => handleCreateInventory()} variant="secondary">
        儲存盤點
      </Button>
      <Button disabled={isClick} onClick={() => handleCreateInventory(false)} variant="primary">
        完成盤點
      </Button>
    </Fragment>
  )

  return (
    <Fragment>
      <Card className="whitespace-nowrap">
        <CardHeader
          className="flex-wrap items-center"
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <Buttons sortDisplay />
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <CardTitle>盤點列表</CardTitle>
            {info !== null && (
              <div className="flex flex-wrap items-center gap-2.5 self-end">
                <span className="whitespace-break-spaces text-caption tabular-nums text-text-secondary">
                  {`建立時間:${format(info.date, 'yyyy/MM/dd HH:mm')}`}
                </span>
                <span className="whitespace-break-spaces text-caption text-text-secondary">{`建立者:${info.creatorName}`}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between gap-5">
            <div className="flex flex-wrap gap-x-2.5 gap-y-1.5">
              {categoriesData.map(({ id, name }) => (
                <Button
                  key={id}
                  size="sm"
                  onClick={() => handleClickCategory(id)}
                  variant="secondary"
                  aria-pressed={handleSelectVariant(id) === 'contained'}
                  className={handleSelectVariant(id) === 'contained' ? 'bg-accent/8 text-accent hover:bg-accent/8' : undefined}
                >
                  {name}
                </Button>
              ))}
            </div>
            <div>
              <Button size="sm" onClick={() => setCategories([])} variant="ghost">
                清除篩選
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>商品名稱</TableHead>
                <TableHead>代號</TableHead>
                <TableHead numeric>當前庫存</TableHead>
                <TableHead>盤點數量</TableHead>
                <TableHead numeric>差異</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map(({ productId, productName, productNo, currentCount, inventoryCount, productCategoryId }, index) => {
                if (handleCheckRenderItem(productCategoryId)) {
                  return (
                    <TableRow key={productId}>
                      <TableCell>{productName}</TableCell>
                      <TableCell className="tabular-nums">{productNo}</TableCell>
                      <TableCell numeric>{formatNumber(currentCount)}</TableCell>
                      <TableCell>
                        <Input
                          className="w-[100px]"
                          aria-label={`${productName} 盤點數量`}
                          value={inventoryCount === null ? '' : inventoryCount}
                          placeholder=""
                          onChange={e => {
                            const newData = cloneDeep(inventoryData)
                            if (e.target.value.match(/^[0-9]*$/) === null || e.target.value.match(/^[0-9]*$/)[0] === '') {
                              newData[index].inventoryCount = null
                            } else {
                              newData[index].inventoryCount = Number(e.target.value)
                            }
                            setInventoryData(newData)
                          }}
                          min={0}
                          onWheel={() => document.activeElement.blur()}
                        />
                      </TableCell>
                      <TableCell numeric>{inventoryCount === null ? '' : handleCheckCount(inventoryCount - currentCount)}</TableCell>
                    </TableRow>
                  )
                }
                return undefined
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-wrap justify-between gap-2.5">
        <Buttons />
      </div>
    </Fragment>
  )
}
export default General
