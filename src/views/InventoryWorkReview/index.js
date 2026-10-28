import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'
import { useFetchGetInventory } from 'hooks/useFetchGetInventorys'
import { useState, useEffect, Fragment } from 'react'
import { storedMerchantName } from 'lib/stored-merchant'
import format from 'date-fns/format'
import idx from 'idx'
import { Skeleton } from 'ui/skeleton'

import General from './General'

function InventoryWorkEdit({ match }) {
  const getInventory = useFetchGetInventory({ inventoryId: match.params.id })
  const [inventoryData, setInventoryData] = useState([])
  const [CSVData, setCSVData] = useState([])
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!getInventory.loading) {
      const inventory = idx(getInventory, _ => _.data.getInventory)
      // 查詢失敗或查無紀錄時沒有資料：不讓整頁拋錯
      if (!inventory) return
      const { date, creatorName, details } = inventory
      setInventoryData(details)
      setInfo({ date, creatorName })

      const handleCheckCount = count => {
        if (count === 0) {
          return `0`
        } else if (count > 0) {
          return '+' + count
        } else {
          // count 已是負數（原本再加一個「-」，匯出成「--3」）
          return String(count)
        }
      }

      const csv = details.map(({
        productName, productNo, currentCount, inventoryCount
      }) => ({
        商品名稱: productName,
        代號: productNo,
        目前庫存: currentCount,
        盤點數量: inventoryCount,
        差異: inventoryCount === null ? '' : handleCheckCount(inventoryCount - currentCount),
      }))
      setCSVData(csv)
    }
  }, [getInventory.loading])

  return (
    <Page className='InventoryWorkReview pb-[24px] pt-[24px]' title="盤點紀錄">
      {info !== null && (
        <Fragment>
          <div className="merchantNamePrint" style={{ marginBottom: '4px', display: "none", justifyContent: "space-between" }}>
            <div className="merchantNamePrint">
              {storedMerchantName() + '   ' + '盤點紀錄'}
            </div>
            <div className="merchantNamePrint">
              {'列印時間： ' +
                format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
            </div>
          </div>
          <div className="merchantNamePrint" style={{ whiteSpace: 'break-spaces', marginBottom: '10px' }}>
            {'建立時間:' + format(info.date, 'yyyy-MM-dd-HH:mm') + '    ' + '建立者:' + info.creatorName}
          </div>
        </Fragment>
      )}
      {/* 原 Container maxWidth="md"：置中、最大寬 900px、左右內距 16／24px；列印時依原 .InventoryWorkReview .MuiContainer-root 規則去掉外距、內距與寬度上限 */}
      <div className="mx-auto box-border block w-full px-4 min-[600px]:px-6 min-[900px]:max-w-[900px] print:m-0 print:max-w-none print:p-0">
        {/* 原 PageTitle：英文 subTitle 依 STYLE 不顯示；標題下方沒有外距（下方骨架自帶 mt-6），故 pb-0 */}
        <PageHeader title='盤點紀錄' className="pb-0" />
        {(getInventory.loading) ?
          <div className="ui-root noprint mt-6 flex flex-col gap-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div> :
          <General
            info={info}
            CSVData={CSVData}
            inventoryData={inventoryData}
          />
        }
      </div>
    </Page>
  )
}

export default InventoryWorkEdit
