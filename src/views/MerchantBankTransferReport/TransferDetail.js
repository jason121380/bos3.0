import { Card } from 'ui/card'
import { Input } from 'ui/input'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

const transferTextClass = 'm-0 text-[16px] font-normal leading-6 text-text'

// 保留行內底線欄位的盒模型與聚焦底線，輸入行為交給正式 ui/input。
const inputWrapperClass = "relative -mt-[5px] inline-flex min-w-0 flex-col align-top before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:border-0 before:border-b before:border-solid before:border-[rgb(173,173,173)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:border-0 after:border-b-2 after:border-solid after:border-primary after:content-[''] after:scale-x-0 focus-within:after:scale-x-100"
const transferInputClass = '!block !box-content !h-[1.4375em] !rounded-none !border-0 !bg-transparent !p-[7px_0_2px] !text-[16px] !font-normal !leading-[1.4375em] !outline-none focus-visible:!ring-0 print:!text-[9px] print:!leading-[1.3em]'

function TransferDetail({ merchantBankSettings }) {
  return (
    <Card className="overflow-hidden text-text mb-6 rounded-[16px] border border-solid border-border bg-background p-6 [box-shadow:none]">
      <div className="box-border flex w-full flex-wrap justify-between">
        <div className='MerchantBankTransferReportTransferDetail' style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="m-0 text-[14px] font-medium leading-5 text-text">
              列印日期：{format(new Date(), 'yyyy/MM/dd')}
            </div>
          </div>
          <div className="TransferDetailpPrint TransferDetailDateInput" style={{ marginBottom: '8px' }}>
            <div className={transferTextClass}>
              本公司於
              <span style={{ width: 60 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} defaultValue={format(new Date(), 'yyyy')} /></span>
              年
              <span style={{ width: 40 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} defaultValue={format(new Date(), 'MM')} /></span>
              月
              <span style={{ width: 40 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} defaultValue={format(new Date(), 'dd')} /></span>日
            </div>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '8px' }}>
            <div className={transferTextClass}>
              指定由存款帳戶
              <span style={{ width: 200 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} value={merchantBankSettings.remitterBankAccount !== null ? merchantBankSettings.remitterBankAccount : " "} /></span> 提領
            </div>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '8px' }}>
            <div className={transferTextClass}>
              合計新台幣：
              <span style={{ width: 200 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false}
              /></span>
              元整
            </div>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '16px' }}>
            <div className={transferTextClass}>
              煩請依下列名冊悉數入該活存帳戶內
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div className={transferTextClass}>
              至此
            </div>
          </div>
          <div className="TransferDetailpPrint" style={{ marginBottom: '16px' }}>
            <div className={transferTextClass}>
              <span style={{ width: 120 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} value={merchantBankSettings.remitterBankName !== null ? merchantBankSettings.remitterBankName : ""} /></span> 銀行
              <span style={{ width: 120 }} className={inputWrapperClass}><Input className={transferInputClass} aria-invalid={false} value={merchantBankSettings.remitterBankBranchName !== null ? merchantBankSettings.remitterBankBranchName : ""} /></span>
              分行
            </div>
          </div>
          <div className="mt-6 flex gap-12">
            <div>
              <div className={transferTextClass} style={{ marginBottom: '8px' }}>
                簽章：
              </div>
              <div style={{ height: 60 }}></div>
            </div>
            <div>
              <div className={transferTextClass} style={{ marginBottom: '8px' }}>
                聯絡人：{merchantBankSettings.trustorName !== null ? merchantBankSettings.trustorName : ""}
              </div>
              <div className={transferTextClass}>
                電話：{merchantBankSettings.trustorPhone !== null ? merchantBankSettings.trustorPhone : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

TransferDetail.propTypes = {
  className: PropTypes.string,
}

export default TransferDetail
