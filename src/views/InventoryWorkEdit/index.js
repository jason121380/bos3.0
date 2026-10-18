import Page from 'components/Page'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import { useFetchGetInventory } from 'hooks/useFetchGetInventorys'
import { useFetchGetProductInventory } from 'hooks/useFetchGetProductInventoryList'
import useFetchDeleteInventory from 'hooks/useFetchDeleteInventory'
import useFetchUpdateInventory from 'hooks/useFetchUpdateInventory'
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { useState, useEffect } from 'react'
import idx from 'idx'
import { cloneDeep } from 'lodash'
import sortData from 'helper/sortInventoryData'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import General from './General'

function InventoryWorkEdit({ match }) {
  const history = useHistory()
  const products = useFetchGetProductInventory({ input: {} })
  const getInventory = useFetchGetInventory({ inventoryId: match.params.id })
  const productCategories = useFetchProductCategoriesInCreatePicking()
  const { deleteInventory } = useFetchDeleteInventory()
  const { updateInventory } = useFetchUpdateInventory()
  const [inventoryData, setInventoryData] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [info, setInfo] = useState(null)
  const [sort, setSort] = useState('inventory')

  useEffect(() => {
    if (!products.loading & !getInventory.loading) {
      const productsData = idx(products, _ => _.data.productInventoryList)
      const inventory = idx(getInventory, _ => _.data.getInventory)
      const data = productsData.map(({ productId, productNo, productName, count, productCategoryId }) => ({
        productId, productNo, productName, currentCount: count, productCategoryId, inventoryCount: null
      }))
      const { date, creatorName } = inventory
      inventory.details.forEach(({ productId, currentCount, inventoryCount }) => {
        data.find((d, i) => {
          if (d.productId === productId) {
            data[i].currentCount = currentCount
            data[i].inventoryCount = inventoryCount
            return true
          } else {
            return false
          }
        })
      })
      setInventoryData(data)
      setInfo({ date, creatorName })
    }
  }, [products.loading, getInventory.loading])

  useEffect(() => {
    const resData = sortData(inventoryData, sort)
    setInventoryData(resData)
  }, [sort])

  const handleDeleteInventory = async () => {
    setIsClick(true)
    try {
      const res = await deleteInventory({ inventoryId: match.params.id })
      if (res.data.deleteInventory) {
        openSnackbar({
          variant: 'success',
          message: '刪除成功'
        })
        history.push('/inventory-work')
      } else {
        setIsClick(false)
        openSnackbar({
          variant: 'warning',
          message: '刪除失敗'
        })
      }
    } catch (error) {
      setIsClick(false)
      openSnackbar({
        variant: 'warning',
        message: '刪除失敗'
      })
    }
  }

  const handleCreateIventory = async (isDraft = true) => {
    setIsClick(true)
    const data = cloneDeep(inventoryData)
    const inventoryDetails = []

    if (!isDraft) {
      const checkNull = data.some(({ inventoryCount }) => inventoryCount === null)
      if (checkNull) {
        checkNull && openSnackbar({
          variant: 'warning',
          message: '盤點數量不得為空'
        })
        setIsClick(false)
        return
      }
    }

    data.forEach(({ productNo, productName, productCategoryId, ...rest }) => {
      if (rest.inventoryCount !== null) inventoryDetails.push(rest)
    })

    try {
      const res = await updateInventory({
        inventoryId: match.params.id,
        input: {
          date: new Date().getTime(),
          isDraft,
          inventoryDetails
        }
      })
      if (res.data.updateInventory) {
        openSnackbar({
          variant: 'success',
          message: isDraft ? '儲存成功' : '新增成功'
        })
        history.push('/inventory-work')
      } else {
        openSnackbar({
          variant: 'warning',
          message: isDraft ? '儲存失敗' : '新增失敗'
        })
      }
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setIsClick(false)
    }
  }

  return (
    <Page className="ui-root" title="編輯盤點">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="編輯盤點"
          actions={
            <Button
              variant="danger"
              disabled={isClick}
              onClick={() => {
                openSnackbar({
                  message: '確定要刪除此盤點紀錄草稿？',
                  variant: 'error',
                  disableHide: true,
                  resign: true,
                  deleteInventoryWork: true,
                  deleteInventoryWorkFunc: handleDeleteInventory
                })
              }}
            >
              刪除盤點
            </Button>
          }
        />
        {(products.loading || getInventory.loading || productCategories.loading) ?
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div> :
          <General
            sort={sort}
            setSort={setSort}
            info={info}
            isClick={isClick}
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            handleCreateIventory={handleCreateIventory}
            categoriesData={productCategories.data.productCategories}
          />
        }
      </div>
    </Page>
  )
}

export default InventoryWorkEdit
