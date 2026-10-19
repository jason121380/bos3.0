/** @jsxImportSource @emotion/react */
import React from 'react'
import { Card } from 'ui/card'
import Page from 'components/Page'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  card: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  field: css({
    width: '100%',
    marginBottom: theme.spacing(2),
  }),
}

function Reservation({ match, location }) {
  const history = useHistory()
  React.useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const a = `/management/employee/${JSON.parse(user).id}/AttendanceRecord`

      history.push(a)
    }
  }, [])

  return (
    <Page css={styles.root} title="">
      <Card css={styles.card}></Card>
    </Page>
  )
}

export default React.memo(Reservation)
