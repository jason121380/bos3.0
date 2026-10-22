import { useState, useEffect } from 'react'
import Page from 'components/Page'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import { useFetchIsWhiteList } from 'hooks/useFetchUser'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import Results from './Results'

const SystemUpdateRecord = () => {
  const systemUpdateRecord = useFetchSystemUpdateRecord()
  const [record, setRecord] = useState([])
  const [isWhiteList, setIsWhiteList] = useState(false)
  const isWhiteListData = useFetchIsWhiteList({
    id: JSON.parse(localStorage.getItem('user')).id,
  })

  useEffect(() => {
    if (!isWhiteListData.loading) {
      setIsWhiteList(idx(isWhiteListData, _ => _.data.user.isWhiteList))
    }
  }, [isWhiteListData.loading])


  useEffect(() => {
    if (!systemUpdateRecord.loading) {
      // 查詢失敗時 data 為 undefined：以空清單帶過（提示由 errorLink 負責），原本 Results 讀 undefined.length 整頁錯誤
      setRecord(idx(systemUpdateRecord, _ => _.data.systemUpdateRecord) || [])
    }
  }, [systemUpdateRecord.loading])

  return (
    // 不在 Page 加 ui-root：Results 內的 Markdown 預覽需避開 ui-root 的基礎樣式（PageHeader 本身已帶 ui-root）
    <Page title="版本紀錄">
      <PageHeader
        title='版本更新紀錄'
        actions={isWhiteList && (
          <Button asChild variant="primary">
            <RouterLink to="/system-update-record/create" data-testid="createSystemUpdate">
              新增
            </RouterLink>
          </Button>
        )}
      />
      <Results data={record} systemUpdateRecord={systemUpdateRecord} isWhiteList={isWhiteList} />
    </Page>
  )
}

export default SystemUpdateRecord
