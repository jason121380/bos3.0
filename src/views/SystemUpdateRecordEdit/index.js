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

  useEffect(() => {
    let cleanUp = true
    if (!systemUpdateRecord.loading && cleanUp) {
      const data = idx(systemUpdateRecord, _ =>
        _.data.systemUpdateRecord.filter(d => {
          return d.systemUpdateId === props.match.params.id
        })
      )
      setEditData({ ...editData, ...data[0] })
      setMdValue(data[0].content)
    }
    return () => (cleanUp = false)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [systemUpdateRecord.loading] 變動時執行；editData、props.match.params.id、systemUpdateRecord 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [systemUpdateRecord.loading])

  return (
    <Page className="ui-root" title="編輯版本紀錄">
      <div>
        <PageHeader title="編輯版本紀錄" />
        {!systemUpdateRecord.loading && <General editData={editData} setEditData={setEditData} mdValue={mdValue} setMdValue={setMdValue} />}
      </div>
    </Page>
  )
}

export default SystemUpdateRecordCreate
