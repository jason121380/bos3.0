/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CardActions,
  Paper,
  Button,
} from '@mui/material'
import PropTypes from 'prop-types'
import { red, blue } from '@mui/material/colors'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white !important',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  closeAtTop: css({
    margin: '16px 24px',
  }),
}

function AccountingSubjectModal({
  openAccountingSubjectModal,
  accountingSubject,
  closeModal,
  inoutType,
  setAccountingSubjects,
  setInoutType,
}) {
  const handleSelectAccountingSubject = subject => {
    setAccountingSubjects(subject)
    setInoutType(inoutType)
    closeModal()
  }
  return (
    <Modal open={openAccountingSubjectModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title={inoutType === 'REVENUE' ? '收入科目' : '支出科目'} />
          <Button
            color="primary"
            variant="contained"
            onClick={closeModal}
            css={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <Divider />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Button />
                  </TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>名稱</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountingSubject.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={() => handleSelectAccountingSubject(subject)}
                        css={styles.addBtn}
                      >
                        選擇
                      </Button>
                    </TableCell>
                    <TableCell>{subject.number}</TableCell>
                    <TableCell>{subject.title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions css={styles.actions}>
          <Button color="primary" variant="contained" onClick={closeModal}>
            關閉
          </Button>
        </CardActions>
      </Card>
    </Modal>
  )
}

AccountingSubjectModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AccountingSubjectModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default AccountingSubjectModal
