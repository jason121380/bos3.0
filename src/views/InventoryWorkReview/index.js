/** @jsxImportSource @emotion/react */
// Container 與 PageTitle 保留：整頁會被 window.print() 列印，列印樣式依賴 .MuiContainer-root
import { Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchGetInventory } from 'hooks/useFetchGetInventorys'
import { useState, useEffect, Fragment } from 'react'
import format from 'date-fns/format'
import idx from 'idx'
import { Skeleton } from 'ui/skeleton'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  headerWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  })
}

function InventoryWorkEdit({ match }) {
  const getInventory = useFetchGetInventory({ inventoryId: match.params.id })
  const [inventoryData, setInventoryData] = useState([])
  const [CSVData, setCSVData] = useState([])
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!getInventory.loading) {
      const inventory = idx(getInventory, _ => _.data.getInventory)
      const { date, creatorName, details } = inventory
      setInventoryData(details)
      setInfo({ date, creatorName })

      const handleCheckCount = count => {
        if (count === 0) {
          return `0`
        } else if (count > 0) {
          return '+' + count
        } else {
          return '-' + count
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
    <Page css={styles.root} className='InventoryWorkReview' title="盤點紀錄">
      {info !== null && (
        <Fragment>
          <div className="merchantNamePrint" style={{ marginBottom: '4px', display: "none", justifyContent: "space-between" }}>
            <div className="merchantNamePrint">
              {JSON.parse(localStorage.getItem('userMerchant')).name + '   ' + '盤點紀錄'}
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
      <Container maxWidth="md">
        <PageTitle title='盤點紀錄' subTitle='Inventory Work review' />
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
      </Container>
    </Page>
  )
}

export default InventoryWorkEdit
