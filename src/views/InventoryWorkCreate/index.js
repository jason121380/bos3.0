import Page from 'components/Page'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import useFetchSetCreateInventory from 'hooks/useFetchSetCreateInventory'
import { useFetchGetProductInventory, useFetchGetProductInventoryLazy } from 'hooks/useFetchGetProductInventoryList'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import sortData from 'helper/sortInventoryData'
import { RefreshCw } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import General from 'views/InventoryWorkShared/General'

function InventoryWorkCreate() {
  const history = useHistory()
  const products = useFetchGetProductInventory({ input: {} })
  const productCategories = useFetchProductCategoriesInCreatePicking()
  const { createInventory } = useFetchSetCreateInventory()
  const [getProductInventory, productInventoryData] = useFetchGetProductInventoryLazy()
  const [inventoryData, setInventoryData] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [sort, setSort] = useState('inventory')

  // 只在第一次載入時建立盤點清單（之後「更新即時庫存」會讓這支查詢也重新回應，原本會把已填的盤點數量全部蓋回庫存數）
  const loadedRef = useRef(false)
  useEffect(() => {
    if (!products.loading && !loadedRef.current) {
      // 查詢失敗時 data 為 undefined：當作沒有商品，不讓整頁拋錯
      const productsData = idx(products, _ => _.data.productInventoryList)
      if (!productsData) return
      loadedRef.current = true
      const data = productsData.map(({ productId, productNo, productName, count, productCategoryId }) => ({
        productId,
        productNo,
        productName,
        currentCount: count,
        productCategoryId,
        inventoryCount: count < 0 ? 0 : count,
      }))
      // 依目前選的排序（預設「庫存」）顯示，與排序鈕的選取狀態一致
      setInventoryData(sortData(data, sort))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [products.loading] 變動時執行；products、sort 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [products.loading])

  useEffect(() => {
    const resData = sortData(inventoryData, sort)
    setInventoryData(resData)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [sort] 變動時執行；inventoryData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [sort])

  useEffect(() => {
    if (!productInventoryData.loading && productInventoryData.data) {
      const newData = cloneDeep(inventoryData)
      // 以「更新即時庫存」查回的最新庫存更新目前庫存（已不在清單的商品維持原數字）
      const productsData = idx(productInventoryData, _ => _.data.productInventoryList) || []
      newData.forEach(({ productId }, index, arr) => {
        const findData = productsData.find(d => d.productId === productId)
        if (findData) arr[index].currentCount = findData.count
      })
      setInventoryData(newData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [productInventoryData.loading] 變動時執行；inventoryData、productInventoryData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [productInventoryData.loading])

  const handleCreateInventory = async (isDraft = true) => {
    setIsClick(true)
    const data = cloneDeep(inventoryData)
    const inventoryDetails = []

    if (!isDraft) {
      const checkNull = data.some(({ inventoryCount }) => inventoryCount === null)
      if (checkNull) {
        checkNull &&
          openSnackbar({
            variant: 'warning',
            message: '盤點數量不得為空',
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
          inventoryDetails,
        },
      })
      if (res.data.createInventory) {
        openSnackbar({
          variant: 'success',
          message: isDraft ? '儲存成功' : '新增成功',
        })
        history.push('/inventory-work')
      } else {
        setIsClick(false)
        openSnackbar({
          variant: 'warning',
          message: isDraft ? '儲存失敗' : '新增失敗',
        })
      }
    } catch (error) {
      setIsClick(false)
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
    }
  }

  return (
    <Page className="ui-root" title="新增盤點">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="新增盤點"
          actions={
            <Button onClick={() => getProductInventory()} variant="secondary" disabled={productInventoryData.loading}>
              <RefreshCw strokeWidth={1.75} />
              更新即時庫存
            </Button>
          }
        />
        {products.loading || productCategories.loading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        ) : (
          <General
            sort={sort}
            setSort={setSort}
            isClick={isClick}
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            handleCreateInventory={handleCreateInventory}
            categoriesData={idx(productCategories, _ => _.data.productCategories) || []}
          />
        )}
      </div>
    </Page>
  )
}

export default InventoryWorkCreate
