import Page from 'components/Page'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import idx from 'idx'
import { useSelector } from 'react-redux'
import useFetchGetQrcodeCheckinCode from 'hooks/useFetchGetQrcodeCheckinCode'
import { storedMerchantId } from 'lib/stored-merchant'
import { PageHeader } from 'ui/page-header'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

function QRcodeClockIn() {
  const getQrcodeCheckinCode = useFetchGetQrcodeCheckinCode()
  const keyFromStore = useSelector(state => state.QRcodeClockIn.key)
  const [clockInType, setClockInType] = useState('CLOCKIN')
  const [countDownTime, setCountDownTime] = useState(300000)
  const [key, setKey] = useState(null)
  const [url, setUrl] = useState('')

  const handleSetQRcodeData = () => {
    // 打卡碼還沒查到（key 為 null）時不產出無效的 QR
    if (!key) return
    // const link = `http://192.168.0.180:8080/stylist/#/clock-in?key=${key}&status=${clockInType}&storeId=${JSON.parse(localStorage.getItem('userMerchant')).id}`
    const link = `https://m.meimate.com/stylist/#/clock-in?key=${key}&status=${clockInType}&storeId=${storedMerchantId()}`

    QRCode.toDataURL(link, (err, string) => {
      setUrl(string);
    })
  }

  useEffect(() => {
    handleSetQRcodeData()
  }, [key, clockInType])

  useEffect(() => {
    let timer
    // 查詢失敗時 data 為 undefined：不設 key、不啟動倒數，畫面維持載入前狀態而不是整頁拋錯
    const code = idx(getQrcodeCheckinCode, _ => _.data.getQrcodeCheckinCode)
    if (!getQrcodeCheckinCode.loading && code) {
      setKey(code)
      setCountDownTime(300000)
      timer = setInterval(() => {
        setCountDownTime(prev => prev - 1000)
      }, 1000);
    }
    return () => {
      clearInterval(timer)
    }
  }, [getQrcodeCheckinCode.loading])

  useEffect(() => {
    if (!countDownTime) {
      getQrcodeCheckinCode.refetch()
    }
  }, [countDownTime])

  useEffect(() => {
    if (keyFromStore && keyFromStore === key) {
      getQrcodeCheckinCode.refetch()
    }
  }, [keyFromStore])


  return (
    <>
      <Page className="ui-root" title="掃碼打卡">
        <PageHeader title="掃碼打卡" />
        {getQrcodeCheckinCode.error ? (
          <QueryFailed onRetry={() => getQrcodeCheckinCode.refetch()} />
        ) : (
          <Results
            clockInType={clockInType}
            setClockInType={setClockInType}
            url={url}
            setUrl={setUrl}
            countDownTime={countDownTime}
            isLoading={getQrcodeCheckinCode.loading}
          />
        )}
      </Page>
    </>
  )
}

export default QRcodeClockIn
