/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import useFetchGetMerchantParticipatingList from 'hooks/useFetchGetMerchantParticipatingList'
import { cloneDeep } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }),
  filterWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center'
  })
}

function MerchantParticipatingList() {
  const merchantParticipatingList = useFetchGetMerchantParticipatingList()
  const [events, setEvents] = useState([])
  const [selectIds, setSelectIds] = useState([])

  const handleSetCollapse = id => {
    const cloneIds = cloneDeep(selectIds)
    const idx = cloneIds.indexOf(id)
    if (idx > -1) {
      cloneIds.splice(idx, 1)
    } else {
      cloneIds.push(id)
    }
    setSelectIds(cloneIds)
  }

  useEffect(() => {
    if (!merchantParticipatingList.loading) {
      const data = idx(merchantParticipatingList, _ => _.data.merchantParticipatingList)
      setEvents(data)
    }
  }, [merchantParticipatingList.loading])

  return (
    <Fragment>
      <Page css={styles.root} title="活動店家參與列表">
        <Container maxWidth={false}>
          <PageTitle title='活動店家參與列表' subTitle='Merchant Participating List' />
          {merchantParticipatingList.loading ?
            <div style={{ textAlign: 'center', marginTop: 100 }}><CircularProgress /></div>
            : <Results
              events={events}
              setCollapse={handleSetCollapse}
              selectIds={selectIds}
            />
          }

        </Container>
      </Page>
    </Fragment>
  )
}

export default MerchantParticipatingList
