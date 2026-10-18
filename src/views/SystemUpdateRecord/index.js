/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container, Grid, Button, Link } from '@mui/material'
import Page from 'components/Page'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import { useFetchIsWhiteList } from 'hooks/useFetchUser'
import idx from 'idx'
import { Link as RouterLink } from 'react-router-dom'
import PageTitle from 'components/PageTitle'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: {},
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  modal: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  paper: css({
    backgroundColor: theme.palette.background.paper,
    border: '2px solid rgb(var(--border-strong))',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  }),
}

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
      setRecord(idx(systemUpdateRecord, _ => _.data.systemUpdateRecord))
    }
  }, [systemUpdateRecord.loading])

  return (
    <Page css={styles.root} title="版本紀錄">
      <Container maxWidth={false} css={styles.container}>
        <Grid justifyContent='space-between' container>
          <PageTitle title='版本更新紀錄' subTitle='System Update Record' />
          {isWhiteList && <Grid item>
            <Link component={RouterLink} to="/system-update-record/create">
              <Button color="primary" variant="contained" data-testid="createSystemUpdate">
                新增
              </Button>
            </Link>
          </Grid>}
        </Grid>
        <Results data={record} systemUpdateRecord={systemUpdateRecord} isWhiteList={isWhiteList} />
      </Container>
    </Page>
  )
}

export default SystemUpdateRecord
