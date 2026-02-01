/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material'
import MaiIcon from '@mui/icons-material/MailOutline'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({}),
  sendButton: css({
    marginTop: theme.spacing(2),
  }),
  mailIcon: css({
    marginRight: theme.spacing(1),
  }),
  table: css({
    marginTop: theme.spacing(2),
  }),
  cell: css({
    padding: theme.spacing(1),
  }),
}

const options = ['重新發送最後一張發票', '發送重設密碼信', '發送驗證信']

function SendEmails({ customer, className = {}, ...rest }) {
  const [option, setOption] = useState(options[0])

  const handleOnChange = event => {
    event.persist()
    setOption(event.target.value)
  }

  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="發送通知" />
      <Divider />
      <CardContent css={styles.content}>
        <TextField
          fullWidth
          name="option"
          onChange={handleOnChange}
          select
          SelectProps={{ native: true }}
          value={option}
          variant="outlined"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </TextField>
        <Button css={styles.sendButton} variant="contained">
          <MaiIcon css={styles.mailIcon} />
          發送
        </Button>
        <Table css={styles.table}>
          <TableBody>
            <TableRow>
              <TableCell css={styles.cell}>2019/01/01 01:01</TableCell>
              <TableCell css={styles.cell}>發送重設密碼</TableCell>
            </TableRow>
            <TableRow>
              <TableCell css={styles.cell}>2019/02/02 02:02</TableCell>
              <TableCell css={styles.cell}>發送驗證信</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

SendEmails.propTypes = {
  className: PropTypes.object,
  customer: PropTypes.object.isRequired,
}

export default SendEmails
