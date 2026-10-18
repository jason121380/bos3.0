import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'

import General from './General'

// 不在 Page 加 ui-root：General 內的 Markdown 編輯器需避開 ui-root 的基礎樣式（見 General.js）
const SystemUpdateRecordCreate = () => {
  return (
    <Page title="新增版本更新紀錄">
      <PageHeader title='新增版本紀錄' />
      <General />
    </Page>
  )
}

export default SystemUpdateRecordCreate
