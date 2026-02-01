/** @jsxImportSource @emotion/react */
import { Grid, Typography, TextField, Button } from '@mui/material'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  gridContainer: css({
    margin: '12px auto',
    display: 'flex',
    justifyContent: 'space-between',
  }),
  div: css({
    width: '100%',
    textAlign: 'center',
    marginTop: '10px',
  }),
  sign: css({
    marginTop: '30px',
  }),
  printBtn: css({
    backgroundColor: '#3865AC',
  }),
}

function TransferDetail({ merchantBankSettings }) {
  return (
    <Grid css={styles.gridContainer}>
      <div className='MerchantBankTransferReportTransferDetail'>
        <div>
          <Typography variant="subtitle1" component="div">
            列印日期：{format(new Date(), 'yyyy/MM/dd')}
          </Typography>
        </div>
        <div className="TransferDetailpPrint TransferDetailDateInput">
          <Typography variant="subtitle1" component="div">
            本公司於
            <TextField variant="standard" type="text" defaultValue={format(new Date(), 'yyyy')}/>
            年
            <TextField variant="standard" type="text" defaultValue={format(new Date(), 'MM')}/>
            月
            <TextField variant="standard" type="text" defaultValue={format(new Date(), 'dd')}/>日
          </Typography>
        </div>
        <div className="TransferDetailpPrint">
          <Typography variant="subtitle1" component="div">
            指定由存款帳戶
            <TextField variant="standard" type="text" value={merchantBankSettings.remitterBankAccount !== null ? merchantBankSettings.remitterBankAccount : " "} /> 提領
          </Typography>
        </div>
        <div className="TransferDetailpPrint">
          <Typography variant="subtitle1" component="div">
            合計新台幣：
            <TextField
              variant="standard"
              type="text"
            />
            元整
          </Typography>
        </div>
        <div className="TransferDetailpPrint">
          <Typography variant="subtitle1" component="div">
            煩請依下列名冊悉數入該活存帳戶內
          </Typography>
        </div>
        <div>
          <Typography variant="subtitle1" component="div">
            至此
          </Typography>
        </div>
        <div className="TransferDetailpPrint">
          <Typography variant="subtitle1" component="div">
            <TextField variant="standard" type="text" value={merchantBankSettings.remitterBankName !== null ? merchantBankSettings.remitterBankName : ""} /> 銀行
            <TextField variant="standard" type="text" value={merchantBankSettings.remitterBankBranchName !== null ? merchantBankSettings.remitterBankBranchName : ""} />
            分行
          </Typography>
        </div>
        <div css={styles.sign}>
          <Typography variant="subtitle1" component="div">
            簽章：
          </Typography>
        </div>
        <div css={styles.sign}>
          <Typography variant="subtitle1" component="div">
            聯絡人：{merchantBankSettings.trustorName !== null ? merchantBankSettings.trustorName: ""}
          </Typography>
          <Typography variant="subtitle1" component="div">
            電話：{merchantBankSettings.trustorPhone !== null ? merchantBankSettings.trustorPhone : ""}
          </Typography>
        </div>
      </div>
      <div>
        <Button
          size="medium"
          variant="contained"
          color="primary"
          onClick={() => window.print()}
          css={styles.printBtn}
          className='noprint'
        >
          列印
        </Button>
      </div>
    </Grid>
  )
}

TransferDetail.propTypes = {
  className: PropTypes.string,
}

export default TransferDetail
