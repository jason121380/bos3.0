/** @jsxImportSource @emotion/react */
import { Card, CardContent, Typography } from '@mui/material'
import Remark from 'views/OrderCreate/Remark'
import styles from 'views/OrderCreate/styles/PannelPayment'

export default function PannelRemark({ expanded }) {

  return (
    <Card>
      <CardContent>
        <Typography css={styles.heading} style={{ marginBottom: '12px', fontWeight: 'bold' }}>備註及來源</Typography>
        <div css={styles.fieldOutter}>
          <Remark expanded={expanded} />
        </div>
      </CardContent>
    </Card>
  )
}
