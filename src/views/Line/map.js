import Page from 'components/Page'
import GoogleMapReact from 'google-map-react'
import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import superagent from 'superagent'
import getQueryString from 'helper/getQueryString'

import LiffHelper from '../../helper/liffHelper'

const Mark = styled.img`
  width: 20px;
  position: relative;
  left: -20px;
  top: -30px;
`
const Button = styled.div`
  position: relative;
  text-align: center;
  display: inline-block;
  width: 40%;
  height: 40px;
  border: 1px solid #00114e;
  line-height: 40px;
  color: #00114e;
  left: 5%;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    opacity: 0.7;
  }
`
const Button2 = styled.div`
  text-align: center;
  display: inline-block;
  width: 40%;
  height: 40px;
  border: 1px solid #00114e;
  line-height: 40px;
  background-color: #00114e;
  color: #fff;
  position: relative;
  left: 10%;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    opacity: 0.7;
  }
`

const AnyReactComponent = ({ text }) => <Mark src="/images/been-here-marker.png" />

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
      .end((_err, res) => {
        res = JSON.parse(res.text)
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
              <Button onClick={getLocation}>取得位置</Button>
              <Button2 onClick={checkIn} className="my-4">
                確認打卡
              </Button2>
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
