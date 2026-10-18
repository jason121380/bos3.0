import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Fragment, useState } from 'react'
import { cloneDeep } from 'lodash'
import format from 'date-fns/format'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function General({
  info, isClick, inventoryData, setInventoryData, categoriesData,
  handleCreateIventory, sort, setSort
}) {
  const [categorys, setCategorys] = useState([])

  const handleSecectVariant = id => {
    return categorys.includes(id) ? 'contained' : 'outlined'
  }

  const handleClickCategory = id => {
    const index = categorys.indexOf(id)
    const cloneData = cloneDeep(categorys)
    if (index === -1) {
      cloneData.push(id)
    } else {
      cloneData.splice(index, 1)
    }
    setCategorys(cloneData)
  }

  const handleCheckCount = count => {
    if (count === 0) {
      return 0
    } else if (count > 0) {
      return <span className="font-bold text-accent">{`+${count}`}</span>
    } else {
      return <span className="font-bold text-danger">{count}</span>
    }
  }

  const handleCheckRenderItrm = categoryId => {
    if (!categorys.length) return true
    return categorys.includes(categoryId)
  }

  const Buttons = ({ sortDisplay = false }) => (
    <Fragment>
      {sortDisplay &&
        <div className="flex items-center gap-2 text-body text-text-secondary">
          <span>排序：</span>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={sort}
            onChange={(e, value) => value && setSort(value)}
          >
            <ToggleButton value='inventory'>庫存</ToggleButton>
            <ToggleButton value='no'>代號</ToggleButton>
            <ToggleButton value='count'>差異</ToggleButton>
          </ToggleButtonGroup>
        </div>
      }
      <Button disabled={isClick} onClick={() => handleCreateIventory()} variant="secondary">
        儲存盤點
      </Button>
      <Button disabled={isClick} onClick={() => handleCreateIventory(false)} variant="primary">
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
                  {`建立時間:${format(info.date, 'yyyy/M/d HH:mm')}`}
                </span>
                <span className="whitespace-break-spaces text-caption text-text-secondary">
                  {`建立者:${info.creatorName}`}
                </span>
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
                  aria-pressed={handleSecectVariant(id) === 'contained'}
                  className={handleSecectVariant(id) === 'contained' ? 'bg-accent/8 text-accent hover:bg-accent/8' : undefined}
                >
                  {name}
                </Button>
              ))}
            </div>
            <div>
              <Button size="sm" onClick={() => setCategorys([])} variant="ghost">
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
                if (handleCheckRenderItrm(productCategoryId)) {
                  return (
                    <TableRow key={productId}>
                      <TableCell>{productName}</TableCell>
                      <TableCell className="tabular-nums">{productNo}</TableCell>
                      <TableCell numeric>{currentCount}</TableCell>
                      <TableCell>
                        <Input
                          className="w-[100px]"
                          aria-label={`${productName} 盤點數量`}
                          value={inventoryCount === null ? '' : inventoryCount}
                          placeholder=''
                          onChange={e => {
                            const newData = cloneDeep(inventoryData)
                            if (
                              e.target.value.match(/^[0-9]*$/) === null ||
                              e.target.value.match(/^[0-9]*$/)[0] === ''
                            ) {
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
