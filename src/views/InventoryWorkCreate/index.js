import Page from 'components/Page'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import useFetchSetCreateInventory from 'hooks/useFetchSetCreateInventory'
import { useFetchGetProductInventory, useFetchGetProductInventoryLazy } from 'hooks/useFetchGetProductInventoryList'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import idx from 'idx'
import { cloneDeep } from 'lodash'
import sortData from 'helper/sortInventoryData'
import { RefreshCw } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import General from './General'

function InventoryWorkCreate() {
  const history = useHistory()
  const products = useFetchGetProductInventory({ input: {} })
  const productCategories = useFetchProductCategoriesInCreatePicking()
  const { createInventory } = useFetchSetCreateInventory()
  const [getProductInventory, productInventoryData] = useFetchGetProductInventoryLazy()
  const [inventoryData, setInventoryData] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [sort, setSort] = useState('inventory')

  useEffect(() => {
    if (!products.loading) {
      const productsData = idx(products, _ => _.data.productInventoryList)
      const data = productsData.map(({ productId, productNo, productName, count, productCategoryId }) => ({
        productId, productNo, productName, currentCount: count, productCategoryId, inventoryCount: count < 0 ? 0 : count
      }))
      setInventoryData(data)
    }
  }, [products.loading])

  useEffect(() => {
    const resData = sortData(inventoryData, sort)
    setInventoryData(resData)
  }, [sort])

  useEffect(() => {
    if (!productInventoryData.loading && productInventoryData.data) {
      const newData = cloneDeep(inventoryData)
      const productsData = idx(products, _ => _.data.productInventoryList)
      newData.forEach(({ productId }, index, arr) => {
        const findData = productsData.find(d => d.productId === productId)
        arr[index].currentCount = findData.count
      })
      setInventoryData(newData)
    }
  }, [productInventoryData.loading])

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
      const res = await createInventory({
        input: {
          date: new Date().getTime(),
          isDraft,
          inventoryDetails
        }
      })
      if (res.data.createInventory) {
        openSnackbar({
          variant: 'success',
          message: isDraft ? '儲存成功' : '新增成功'
        })
        history.push('/inventory-work')
      } else {
        setIsClick(false)
        openSnackbar({
          variant: 'warning',
          message: isDraft ? '儲存失敗' : '新增失敗'
        })
      }
    } catch (error) {
      setIsClick(false)
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    }
  }

  return (
    <Page className="ui-root" title="新增盤點">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="新增盤點"
          actions={
            <Button
              onClick={() => getProductInventory()}
              variant="secondary"
              disabled={productInventoryData.loading}
            >
              <RefreshCw strokeWidth={1.75} />
              更新即時庫存
            </Button>
          }
        />
        {(products.loading || productCategories.loading) ?
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div> :
          <General
            sort={sort}
            setSort={setSort}
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

export default InventoryWorkCreate
