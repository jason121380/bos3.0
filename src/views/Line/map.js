import Page from 'components/Page'
import GoogleMapReact from 'google-map-react'
import React, { useEffect, useState } from 'react'
import getQueryString from 'helper/getQueryString'

import LiffHelper from '../../helper/liffHelper'

// 原 emotion styled 的 Mark／Button／Button2 改為一般元素＋Tailwind（數值逐一對應）
// 原為 styled.img（無 alt），維持相同輸出
const AnyReactComponent = ({ text }) => <img className="relative -left-[20px] -top-[30px] w-[20px]" src="/images/been-here-marker.png" />

function Map({ className, match, location, ...rest }) {
  const storeId = getQueryString({ key: 'storeId', location })
  const [loading, setLoading] = useState(false)
  const [gps, setGps] = useState({
    lat: 25.1426626,
    lng: 121.5078801,
  })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    LiffHelper.getProfile(match.params.id).then(profile => {
      setProfile({ profile })
    }).catch(() => {
      // LIFF 個人資料取不到時原本會在打卡時讀 null 而拋錯；這裡直接提示（errorLink 管不到 LIFF SDK）
      alert('無法取得 LINE 個人資料，請重新開啟此頁')
    })
    getLocation()
  }, [match.params.id])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(a => {
        setGps({
          lat: a.coords.latitude,
          lng: a.coords.longitude,
        })
      })
    }
  }
  const checkIn = () => {
    setLoading(true)
    const data = {
      storeId: storeId,
      lineAccountId: profile.profile.userId,
      location: {
        lat: gps.lat,
        lng: gps.lng,
      },
    }
    // 以 fetch 取代 superagent（唯一用到它的地方；移除套件順便去掉其 form-data／qs 的弱點）。
    // 網址維持原樣：打卡 REST 端點是否已搬到 api-base 的新網域需後端確認，前端不自行更換。
    // 非 2xx 視為失敗，與 superagent 的 err 行為相同。
    fetch('https://apibeautyos.mlgroup.vip/api/attendance/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'json' },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        LiffHelper.sendMessages({
          type: 'text',
          text: `打卡${gps.lat},${gps.lng}`,
        })
        LiffHelper.closeWindow()
      })
      .catch(() => {
        // 原本不處理失敗時畫面會永遠停在「努力提交中」
        setLoading(false)
        alert('打卡失敗，請檢查網路後再試一次')
      })
  }

  return (
    <Page title="打卡系統" style={{ width: '100vw', height: '70vh' }}>
      <p style={{ padding: '10px' }}>請確認地圖中您現在的位置：</p>
      {(() => {
        if (loading) {
          return <p className="text-center p-0 m-0 mt-0">努力提交中...</p>
        } else {
          return (
            <>
              <div className="relative inline-block h-[40px] w-[40%] cursor-pointer border border-solid border-[#00114e] text-center leading-[40px] [transition:all_0.3s] hover:opacity-70 left-[5%] text-[#00114e]" onClick={getLocation}>取得位置</div>
              <div onClick={checkIn} className="my-4 relative inline-block h-[40px] w-[40%] cursor-pointer border border-solid border-[#00114e] text-center leading-[40px] [transition:all_0.3s] hover:opacity-70 left-[10%] bg-[#00114e] text-[#fff]">
                確認打卡
              </div>
            </>
          )
        }
      })()}
      <br />
      <br />
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyAEyuPyJBkX5J0Z6P10Pb0i1A0-pnzQuaI' }}
        defaultCenter={gps}
        center={gps}
        defaultZoom={17}
      >
        <AnyReactComponent lat={gps.lat} lng={gps.lng} />
      </GoogleMapReact>
    </Page>
  )
}

export default Map
