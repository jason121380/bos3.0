import React from 'react'
import { Helmet } from 'react-helmet'

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID

function GoogleAnalytics() {
  // 未設定 REACT_APP_GA_MEASUREMENT_ID 時不載入（原本會請求 gtag/js?id=undefined；站上的追蹤由 index.html 的 GTM 負責）
  if (!GA_MEASUREMENT_ID) return null
  return (
    <Helmet>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </script>
    </Helmet>
  )
}

export default GoogleAnalytics
