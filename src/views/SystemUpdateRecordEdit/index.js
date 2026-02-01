/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

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
  }, [systemUpdateRecord.loading])

  return (
    <Page css={styles.root} title="編輯版本紀錄">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='編輯版本紀錄' subTitle='System Update Record Edit' />
        {!systemUpdateRecord.loading && <General editData={editData} setEditData={setEditData} mdValue={mdValue} setMdValue={setMdValue} />}
      </Container>
    </Page>
  )
}

export default SystemUpdateRecordCreate
