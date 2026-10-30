import { useEffect, useState } from 'react'
import idx from 'idx'
import QRCode from 'qrcode'
import useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'

// 收據上方的店家 Logo／QR code／訊息（打帳單的明細彈窗與掛單詳細的列印原本各一份、逐字相同，2026/10/21 合併）。
// 三支設定查詢都回來後轉成列印用的圖片（data URL）；列印範本本身仍在各頁，讀這裡回傳的 detailInfo、qrcodeUrl、imgUrl。
// 三支查詢的 loading 也一併回傳（列印鈕在載入完成前停用、明細彈窗等載入完成才顯示）。
export default function useInvoiceDecorations() {
  const [detailInfo, setDetailInfo] = useState({
    logo: {
      isDisplay: false,
      imageUrl: null,
    },
    qrcode: {
      isDisplay: false,
      url: null,
      imageUrl: null,
    },
    message: {
      isDisplay: false,
      message: null,
    },
  })
  const [qrcodeUrl, setQrcodeUrl] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const getLogoDisplayOnInvoice = useFetchGetLogoDisplayOnInvoice()
  const getQrcodeDisplayOnInvoice = useFetchGetQrcodeDisplayOnInvoice()
  const getMessageDisplayOnInvoice = useFetchGetMessageDisplayOnInvoice()

  useEffect(() => {
    if (!getLogoDisplayOnInvoice.loading && !getQrcodeDisplayOnInvoice.loading && !getMessageDisplayOnInvoice.loading) {
      const logo = idx(getLogoDisplayOnInvoice, _ => _.data.getLogoDisplayOnInvoice)
      const qrcode = idx(getQrcodeDisplayOnInvoice, _ => _.data.getQrcodeDisplayOnInvoice)
      const message = idx(getMessageDisplayOnInvoice, _ => _.data.getMessageDisplayOnInvoice)
      setDetailInfo({
        logo: logo,
        qrcode: qrcode,
        message: message,
      })
      QRCode.toDataURL(qrcode.url, (err, string) => {
        !err && setQrcodeUrl(string)
      })
      // 沒啟用或沒有 logo 網址時 imageUrl 是 null；不要 fetch(null)（會打到 /null）
      if (logo && logo.imageUrl) {
        const getDataUrl = async () => {
          let blob = await fetch(logo.imageUrl).then(r => r.blob())
          let dataUrl = await new Promise(resolve => {
            let reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
          setImgUrl(dataUrl)
        }
        getDataUrl().catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getLogoDisplayOnInvoice.loading, getQrcodeDisplayOnInvoice.loading, getMessageDisplayOnInvoice.loading])

  return {
    detailInfo,
    qrcodeUrl,
    imgUrl,
    getLogoDisplayOnInvoice,
    getQrcodeDisplayOnInvoice,
    getMessageDisplayOnInvoice,
  }
}
