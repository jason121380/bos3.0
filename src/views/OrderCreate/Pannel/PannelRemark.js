/** @jsxImportSource @emotion/react */
import { Card, CardContent } from '@mui/material'
import Remark from 'views/OrderCreate/Remark'
import styles from 'views/OrderCreate/styles/PannelPayment'

export default function PannelRemark({ expanded }) {

  return (
    <Card>
      <CardContent>
        <p className="m-0" css={styles.heading} style={{ marginBottom: '12px', fontWeight: 'bold' }}>備註及來源</p>
        <div css={styles.fieldOutter}>
          <Remark expanded={expanded} />
        </div>
      </CardContent>
    </Card>
  )
}
