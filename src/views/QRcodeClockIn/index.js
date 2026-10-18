import Page from 'components/Page'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useSelector } from 'react-redux'
import useFetchGetQrcodeCheckinCode from 'hooks/useFetchGetQrcodeCheckinCode'
import { PageHeader } from 'ui/page-header'

import Results from './Results'

function QRcodeClockIn() {
  const getQrcodeCheckinCode = useFetchGetQrcodeCheckinCode()
  const keyFromStore = useSelector(state => state.QRcodeClockIn.key)
  const [clockInType, setClockInType] = useState('CLOCKIN')
  const [countDownTime, setCountDownTime] = useState(300000)
  const [key, setKey] = useState(null)
  const [url, setUrl] = useState('')

  const handleSetQRcodeData = () => {
    // const link = `http://192.168.0.180:8080/stylist/#/clock-in?key=${key}&status=${clockInType}&storeId=${JSON.parse(localStorage.getItem('userMerchant')).id}`
    const link = `https://m.meimate.com/stylist/#/clock-in?key=${key}&status=${clockInType}&storeId=${JSON.parse(localStorage.getItem('userMerchant')).id}`

    QRCode.toDataURL(link, (err, string) => {
      setUrl(string);
    })
  }

  useEffect(() => {
    handleSetQRcodeData()
  }, [key, clockInType])

  useEffect(() => {
    let timer
    if (!getQrcodeCheckinCode.loading) {
      setKey(getQrcodeCheckinCode.data.getQrcodeCheckinCode)
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
        <Results
          clockInType={clockInType}
          setClockInType={setClockInType}
          url={url}
          setUrl={setUrl}
          countDownTime={countDownTime}
          isLoading={getQrcodeCheckinCode.loading}
        />
      </Page>
    </>
  )
}

export default QRcodeClockIn
