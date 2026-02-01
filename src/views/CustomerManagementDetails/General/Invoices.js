/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  colors,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import Label from 'elements/label'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  actions: css({
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > * + *': {
      marginLeft: 0,
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function Invoices({ customer, className = {}, ...rest }) {
  const handleEditOpen = () => { }

  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="信用卡資訊" />
      <Divider />
      <CardContent css={styles.content}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>信用卡號碼</TableCell>
              <TableCell>
                {customer.iban}
                <div>
                  <Label color={customer.autoCC ? colors.green[600] : colors.red[600]}>VISA</Label>
                </div>
              </TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell>有效日期</TableCell>
              <TableCell>12/16</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardActions css={styles.actions}>
        <Button onClick={handleEditOpen}>
          <EditIcon css={styles.buttonIcon} />
          編輯信用卡
        </Button>
      </CardActions>
    </Card>
  )
}

Invoices.propTypes = {
  className: PropTypes.object,
  customer: PropTypes.object.isRequired,
}

export default Invoices
