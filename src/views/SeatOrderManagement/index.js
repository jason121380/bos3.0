/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container, Card, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import useFetchSeatOrderDisplay from 'hooks/useFetchSeatOrderDisplay'
import useCheckDisablePendingOrder from 'hooks/useCheckDisablePendingOrder'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  grid: css({
    justifyContent: 'space-between',
  }),
}

const SeatOrderManagement = () => {
  const displaySeats = useFetchSeatOrderDisplay()
  const [display, setDisplay] = useState()
  const [editMode, setEditMode] = useState(false)
  useCheckDisablePendingOrder()

  useEffect(() => {
    if (!displaySeats.loading) {
      const display = idx(displaySeats, _ => _.data.seatNumberStatus)
      if (display != undefined) {
        setDisplay(display)
      }
    }
  }, [displaySeats.loading])

  return (
    <Page css={styles.root} title="座位開單">
      <Container maxWidth={false}>
        <Card
          css={css({
            display: 'flex',
            padding: '12px 24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#E8F0FE',
            borderRadius: '12px',
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: '12px',
          })}
        >
          <PageTitle title='座位開單' style={{ color: '#1A73E8' }} />
          <Button
            variant={editMode ? "contained" : "outlined"}
            color="primary"
            onClick={() => setEditMode(!editMode)}
            style={{ borderRadius: '8px', fontWeight: 'bold' }}
          >
            {editMode ? '完成編輯' : '編輯座位'}
          </Button>
        </Card>
        <Results displaySeats={idx(displaySeats, _ => _.data.seatNumberStatus)} editMode={editMode} />
      </Container>
    </Page>
  )
}

export default SeatOrderManagement
