import React from 'react'
import { Card } from 'ui/card'
import Page from 'components/Page'
import { useHistory } from 'react-router'

function Reservation({ match, location }) {
  const history = useHistory()
  React.useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const a = `/management/employee/${JSON.parse(user).id}/AttendanceRecord`

      history.push(a)
    }
  }, [history])

  return (
    <Page className="min-w-[275px] p-8 mt-6" title="">
      <Card className="min-w-[275px] p-8 mt-6"></Card>
    </Page>
  )
}

export default React.memo(Reservation)
