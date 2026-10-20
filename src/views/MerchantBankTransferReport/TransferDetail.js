import { Grid } from 'ui/grid-compat'
import { Typography } from 'ui/display-compat'
import { Card } from 'ui/card-compat'
import { TextField } from 'ui/standard-input-compat'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

function TransferDetail({ merchantBankSettings }) {
  return (
    <Card className="mb-6 rounded-[16px] border border-solid border-border bg-background p-6 [box-shadow:none]">
      <Grid container className="flex justify-between">
        <div className='MerchantBankTransferReportTransferDetail' style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Typography variant="subtitle1" component="div">
              列印日期：{format(new Date(), 'yyyy/MM/dd')}
            </Typography>
          </div>
          <div className="TransferDetailpPrint TransferDetailDateInput" style={{ marginBottom: '8px' }}>
            <Typography variant="body1" component="div">
              本公司於
              <TextField variant="standard" size="small" style={{ width: 60 }} defaultValue={format(new Date(), 'yyyy')} />
              年
              <TextField variant="standard" size="small" style={{ width: 40 }} defaultValue={format(new Date(), 'MM')} />
              月
              <TextField variant="standard" size="small" style={{ width: 40 }} defaultValue={format(new Date(), 'dd')} />日
            </Typography>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '8px' }}>
            <Typography variant="body1" component="div">
              指定由存款帳戶
              <TextField variant="standard" size="small" style={{ width: 200 }} value={merchantBankSettings.remitterBankAccount !== null ? merchantBankSettings.remitterBankAccount : " "} /> 提領
            </Typography>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '8px' }}>
            <Typography variant="body1" component="div">
              合計新台幣：
              <TextField
                variant="standard"
                size="small"
                style={{ width: 200 }}
              />
              元整
            </Typography>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '16px' }}>
            <Typography variant="body1" component="div">
              煩請依下列名冊悉數入該活存帳戶內
            </Typography>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Typography variant="body1" component="div">
              至此
            </Typography>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '16px' }}>
            <Typography variant="body1" component="div">
              <TextField variant="standard" size="small" style={{ width: 120 }} value={merchantBankSettings.remitterBankName !== null ? merchantBankSettings.remitterBankName : ""} /> 銀行
              <TextField variant="standard" size="small" style={{ width: 120 }} value={merchantBankSettings.remitterBankBranchName !== null ? merchantBankSettings.remitterBankBranchName : ""} />
              分行
            </Typography>
          </div>
          <div className="mt-6 flex gap-12">
            <div>
              <Typography variant="body1" component="div" style={{ marginBottom: '8px' }}>
                簽章：
              </Typography>
              <div style={{ height: 60 }}></div>
            </div>
            <div>
              <Typography variant="body1" component="div" style={{ marginBottom: '8px' }}>
                聯絡人：{merchantBankSettings.trustorName !== null ? merchantBankSettings.trustorName : ""}
              </Typography>
              <Typography variant="body1" component="div">
                電話：{merchantBankSettings.trustorPhone !== null ? merchantBankSettings.trustorPhone : ""}
              </Typography>
            </div>
          </div>
        </div>
      </Grid>
    </Card>
  )
}

TransferDetail.propTypes = {
  className: PropTypes.string,
}

export default TransferDetail
