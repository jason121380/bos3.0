/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
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
        <PageTitle title='座位開單' subTitle='SEAT ORDER MANAGE' />
        <Results displaySeats={display} />
      </Container>
    </Page>
  )
}

export default SeatOrderManagement
