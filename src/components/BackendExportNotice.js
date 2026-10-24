// 只開啟伺服器檔案網址的匯出鈕。前端改不了檔案內容。
// 店家把「報表匯出客資遮碼」關掉（getCustomerDataMarkedDefault === false）時停用，並說明原因。
function BackendExportNotice({ settingOff }) {
  if (settingOff) {
    return (
      <p role="alert" className="mb-3 text-label text-danger">
        店家已關閉報表匯出客資遮罩。此按鈕只會開啟伺服器產生的檔案，前端無法遮罩客戶姓名與電話，因此停用下載。
      </p>
    )
  }
  return (
    <p role="note" className="mb-3 text-label text-text-secondary">
      此檔由伺服器產生，前端無法在下載前遮罩客戶資料。
    </p>
  )
}

export default BackendExportNotice
