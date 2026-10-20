import Page from 'components/Page'
import GoogleMapReact from 'google-map-react'
import React, { useEffect, useState } from 'react'
import superagent from 'superagent'
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
    superagent
      // .post('http://localhost:4849/api/attendance/record')
      .post('https://apibeautyos.mlgroup.vip/api/attendance/record')
      // .post('https://8c81db9b7039.ngrok.io/api/attendance/record')
      .send(data) // sends a JSON post body
      .set('accept', 'json')
      .end((err, res) => {
        // 原本不處理失敗：res 為 undefined 時 JSON.parse 拋錯，畫面永遠停在「努力提交中」
        if (err || !res) {
          setLoading(false)
          alert('打卡失敗，請檢查網路後再試一次')
          return
        }
        LiffHelper.sendMessages({
          type: 'text',
          text: `打卡${gps.lat},${gps.lng}`,
        })
        LiffHelper.closeWindow()
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
