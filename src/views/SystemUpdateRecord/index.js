import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'

import Results from './Results'
import { systemUpdateRecords } from './records'

// 清單來自前端靜態資料，不查 systemUpdateRecord，也不依白名單顯示新增／編輯／刪除。
// 新增與編輯頁仍留在路由上，這頁不再連過去，避免使用者以為還會寫進後端。
const SystemUpdateRecord = () => {
  return (
    // 不在 Page 加 ui-root：Results 內的 Markdown 預覽需避開 ui-root 的基礎樣式（PageHeader 本身已帶 ui-root）
    <Page title="版本紀錄">
      <PageHeader title="版本更新紀錄" />
      <Results data={systemUpdateRecords} />
    </Page>
  )
}

export default SystemUpdateRecord
