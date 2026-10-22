import { useState, useEffect } from 'react'
import Page from 'components/Page'
import { PageHeader } from 'ui/page-header'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import idx from 'idx'

import General from './General'

const SystemUpdateRecordCreate = props => {
  const systemUpdateRecord = useFetchSystemUpdateRecord()
  const [editData, setEditData] = useState({
    systemUpdateId: '',
    title: '',
    content: '',
    versionNo: '',
    updateTime: new Date().getTime(),
  })
  const [mdValue, setMdValue] = useState('')
  // 查詢失敗或清單裡沒有這筆：不顯示表單（原本讀 undefined[0] 整頁錯誤；也避免把空白表單存成這筆紀錄）
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!systemUpdateRecord.loading) {
      const record = (idx(systemUpdateRecord, _ => _.data.systemUpdateRecord) || []).find(
        d => d.systemUpdateId === props.match.params.id
      )
      setNotFound(!record)
      if (record) {
        setEditData({ ...editData, ...record })
        setMdValue(record.content)
      }
    }
  }, [systemUpdateRecord.loading])

  return (
    <Page className="ui-root" title="編輯版本紀錄">
      <div>
        <PageHeader title="編輯版本紀錄" />
        {!systemUpdateRecord.loading && notFound && <p className="text-body text-text-secondary">找不到這筆版本紀錄</p>}
        {!systemUpdateRecord.loading && !notFound && <General editData={editData} setEditData={setEditData} mdValue={mdValue} setMdValue={setMdValue} />}
      </div>
    </Page>
  )
}

export default SystemUpdateRecordCreate
