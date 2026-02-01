/** @jsxImportSource @emotion/react */
import { CircularProgress } from '@mui/material'
import idx from 'idx'
import { Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

import RecordResults from './RecordResults'

const styles = {
  results: css({
    marginTop: theme.spacing(3)
  }),
}

export default function Bonus({ customer, customerBonusRecords }) {
  return (
    <Fragment>
      {!customerBonusRecords.loading ?
        <RecordResults
          className={styles.results}
          recordData={idx(customerBonusRecords, _ => _.data.customerBonusRecord)}
          refetch={() => customerBonusRecords.refetch()}
          customer={customer}
        /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
    </Fragment>
  )
}