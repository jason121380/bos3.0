import { useEffect } from 'react'

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID

// 原本以 react-helmet 把 gtag 的 <script> 寫進 <head>；改為掛載時直接插入（只插一次），行為相同、不再依賴 react-helmet
export function installGtag(id, doc = document) {
  if (!id || doc.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${id}"]`)) return
  const loader = doc.createElement('script')
  loader.async = true
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  doc.head.appendChild(loader)
  const inline = doc.createElement('script')
  inline.text = `
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());
          gtag('config', '${id}');
        `
  doc.head.appendChild(inline)
}

function GoogleAnalytics() {
  // 未設定 REACT_APP_GA_MEASUREMENT_ID 時不載入（原本會請求 gtag/js?id=undefined；站上的追蹤由 index.html 的 GTM 負責）
  useEffect(() => {
    installGtag(GA_MEASUREMENT_ID)
  }, [])
  return null
}

export default GoogleAnalytics
