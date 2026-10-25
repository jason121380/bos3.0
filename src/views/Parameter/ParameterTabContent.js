import idx from 'idx'

import AboutSalaryAddAndDeduction from './AboutSalaryAddAndDeduction'
import NonDesignationBookingLimitSetting from './NonDesignationBookingLimitSetting'
import PasswordSetting from './PasswordSetting'
import AboutMerchantFakePerformanceReference from './AboutMerchantFakePerformanceReference'
import AboutMerchantRakePerformanceRefer from './AboutMerchantRakePerformanceRefer'
import AboutPriceDisplayOnDailyReport from './AboutPriceDisplayOnDailyReport'
import AboutMonthCheckoutAddSalaryItems from './AboutMonthCheckoutAddSalaryItems'
import AboutMerchantBankSettings from './AboutMerchantBankSettings'
import IsReservationNeedReview from './IsReservationNeedReview'
import AboutOrderCreate from './AboutOrderCreate'
import AboutOrderDetail from './AboutOrderDetail'
import AboutOtherReport from './AboutOtherReport'
import AboutSettingFunction from './AboutSettingFunction'
import AboutEmployeeSchedule from './AboutEmployeeSchedule'
import BookingNotificationSetting from './BookingNotificationSetting'
import AboutCustomerSideSetting from './AboutCustomerSideSetting'
import AboutCustomerBooking from './AboutCustomerBooking'
import AboutDesignerSideExternalLink from './AboutDesignerSideExternalLink'
import MerchantReservationTimes from './MerchantReservationTimes'
import AboutCustomerTracking from './AboutCustomerTracking'
import AboutCustomerSideExternalLink from './AboutCustomerSideExternalLink.js'
import AboutCustomerSettingFunction from './AboutCustomerSettingFunction.js'
import AboutOrderSource from './AboutOrderSource.js'
import BookingNotificationLineAtSetting from './BookingNotificationLineAtSetting.js'
import BookingCheckInNotificationSetting from './BookingCheckInNotificationSetting.js'
import AttendanceEmployeeScheduleSetting from './AttendanceEmployeeScheduleSetting.js'
import ReservationSettingForStylist from './ReservationSettingForStylist.js'
import { requiredColumnOptions } from './parameterDefaults'

// 各分頁的設定區塊（自 Parameter.js 原樣搬出）：state、查詢與儲存仍在 Parameter.js，這裡只依 selectTab 顯示對應區塊

// 各分類裡的設定卡（細項）。id 與畫面區塊對應，供桌機 hover 選單捲到該卡；不影響儲存。
export const PARAMETER_SECTIONS = {
  orderCreate: [
    { id: 'parameter-order-create', label: '打帳單相關設定' },
    { id: 'parameter-order-detail', label: '帳單明細顯示設定' },
    { id: 'parameter-order-source', label: '帳單來源' },
  ],
  employeeSchedule: [
    { id: 'parameter-shift', label: '班別設定' },
    { id: 'parameter-attendance-schedule', label: '考勤排班總表設定' },
  ],
  salary: [
    { id: 'parameter-salary-increase', label: '薪資加項科目設定' },
    { id: 'parameter-salary-decrease', label: '薪資扣項科目設定' },
    { id: 'parameter-bank', label: '薪資轉帳設定' },
    { id: 'parameter-month-checkout', label: '薪資及月結設定' },
  ],
  report: [
    { id: 'parameter-daily-report', label: '日報表設定' },
    { id: 'parameter-other-report', label: '其他報表設定' },
  ],
  booking: [
    { id: 'parameter-booking-limit', label: '同時段預約人數上限' },
    { id: 'parameter-booking-review', label: '預約設定' },
    { id: 'parameter-booking-sms', label: '預約通知簡訊設定' },
    { id: 'parameter-booking-line', label: '預約通知LINE@設定' },
    { id: 'parameter-booking-checkin', label: '報到通知設定' },
    { id: 'parameter-booking-hours', label: '開放預約時段設定' },
  ],
  performanceRake: [
    { id: 'parameter-fake-performance', label: '虛業績依據設定' },
    { id: 'parameter-rake-threshold', label: '抽成門檻依據設定' },
  ],
  password: [
    { id: 'parameter-password', label: '密碼設定' },
  ],
  function: [
    { id: 'parameter-function', label: '功能設定' },
  ],
  customerTracking: [
    { id: 'parameter-tracking-hairProperties', label: '髮質屬性設定' },
    { id: 'parameter-tracking-scalpProperties', label: '頭皮屬性設定' },
    { id: 'parameter-tracking-permAppliance', label: '燙髮用具設定' },
    { id: 'parameter-tracking-permPotion', label: '燙髮藥水設定' },
    { id: 'parameter-tracking-hairColorCategory', label: '染髮類別設定' },
    { id: 'parameter-tracking-hairColor', label: '染髮色系設定' },
  ],
  customer: [
    { id: 'parameter-customer-page', label: '頁面顯示設定' },
    { id: 'parameter-customer-function', label: '顧客端功能設定' },
    { id: 'parameter-customer-booking', label: '顧客端預約設定' },
    { id: 'parameter-customer-link', label: '外部連結設定' },
  ],
  designer: [
    { id: 'parameter-designer-link', label: '外部連結設定' },
    { id: 'parameter-designer-booking', label: '預約設定' },
  ],
}

export default function ParameterTabContent({
  selectTab,
  orderCreateSetting,
  setOrderCreateSetting,
  inputEnable,
  uploadMerchantLogo,
  reference,
  setReference,
  isMerchantClockInSetting,
  setIsMerchantClockInSetting,
  merchantClockInSettingData,
  UESUsing,
  setUESUsing,
  service,
  handleServiceChange,
  merchantBankSettings,
  setDisplayNonBankAccountInBankTransferReport,
  displayNonBankAccountInBankTransferReport,
  handleMerchantBankSettings,
  checkoutAndSalaryItem,
  setCheckoutAndSalaryItem,
  aboutReport,
  setAboutReport,
  aboutBooking,
  setAboutBooking,
  bookingCusCheck,
  setBookingCusCheck,
  merchantBookingNotification,
  setMerchantBookingNotification,
  lineConnectedUser,
  NDBRecipients,
  setNDBRecipients,
  notificationDayCount,
  setNotificationDayCount,
  BookingLineNotify,
  setBookingLineNotify,
  checkinSettings,
  setCheckinSettings,
  bookingTypeForSocket,
  setBookingTypeForSocket,
  merchantReservation,
  setMerchantReservation,
  merchantFakePerformanceRefer,
  setMerchantFakePerformanceRefer,
  merchantRakeReferemce,
  setMerchantRakeReferemce,
  setPasswordSetting,
  passwordSetting,
  aboutSettingFunction,
  setAboutSettingFunction,
  setMerchantAvatar,
  merchantLogo,
  setMerchantLogo,
  aboutCustomer,
  setAboutCustomer,
  cusExternalLink,
  getMerchantCusExternalLink,
  externalLink,
  getMerchantExternalLink,
  CBRDStylist,
  setCBRDStylist,
  hairCondition,
  setHairCondition,
}) {
  return (
    <>
    {selectTab === 'orderCreate' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-order-create" className="scroll-mt-6">
        <AboutOrderCreate
          orderCreateSetting={orderCreateSetting}
          setOrderCreateSetting={setOrderCreateSetting}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-order-detail" className="scroll-mt-6">
        <AboutOrderDetail
          orderCreateSetting={orderCreateSetting}
          setOrderCreateSetting={setOrderCreateSetting}
          uploadMerchantLogo={uploadMerchantLogo}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-order-source" className="scroll-mt-6">
        <AboutOrderSource
          reference={reference}
          setReference={setReference}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'employeeSchedule' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-shift" className="scroll-mt-6">
        <AboutEmployeeSchedule
          isMerchantClockInSetting={isMerchantClockInSetting}
          setIsMerchantClockInSetting={setIsMerchantClockInSetting}
          loading={merchantClockInSettingData.loading}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-attendance-schedule" className="scroll-mt-6">
        <AttendanceEmployeeScheduleSetting
          UESUsing={UESUsing}
          setUESUsing={setUESUsing}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'salary' && (
      <div className="flex flex-col gap-6">
        <AboutSalaryAddAndDeduction
          service={service}
          onChange={handleServiceChange}
          inputEnable={inputEnable}
        />
        <div id="parameter-bank" className="scroll-mt-6">
        <AboutMerchantBankSettings
          merchantBankSettings={merchantBankSettings}
          setDisplayNonBankAccountInBankTransferReport={setDisplayNonBankAccountInBankTransferReport}
          displayNonBankAccountInBankTransferReport={displayNonBankAccountInBankTransferReport}
          onChange={handleMerchantBankSettings}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-month-checkout" className="scroll-mt-6">
        <AboutMonthCheckoutAddSalaryItems
          inputEnable={inputEnable}
          checkoutAndSalaryItem={checkoutAndSalaryItem}
          setCheckoutAndSalaryItem={setCheckoutAndSalaryItem}
        />
        </div>
      </div>
    )}
    {selectTab === 'report' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-daily-report" className="scroll-mt-6">
        <AboutPriceDisplayOnDailyReport
          aboutReport={aboutReport}
          setAboutReport={setAboutReport}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-other-report" className="scroll-mt-6">
        <AboutOtherReport
          inputEnable={inputEnable}
          aboutReport={aboutReport}
          setAboutReport={setAboutReport}
        />
        </div>
      </div>
    )}
    {selectTab === 'booking' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-booking-limit" className="scroll-mt-6">
        <NonDesignationBookingLimitSetting
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-booking-review" className="scroll-mt-6">
        <IsReservationNeedReview
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          bookingCusCheck={bookingCusCheck}
          setBookingCusCheck={setBookingCusCheck}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-booking-sms" className="scroll-mt-6">
        <BookingNotificationSetting
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          merchantBookingNotification={merchantBookingNotification}
          setMerchantBookingNotification={setMerchantBookingNotification}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-booking-line" className="scroll-mt-6">
        <BookingNotificationLineAtSetting
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          lineConnectedUser={(!lineConnectedUser.loading && idx(lineConnectedUser, _ => _.data.getLineConnectedUser)) || []}
          NDBRecipients={NDBRecipients}
          setNDBRecipients={setNDBRecipients}
          notificationDayCount={notificationDayCount}
          setNotificationDayCount={setNotificationDayCount}
          BookingLineNotify={BookingLineNotify}
          setBookingLineNotify={setBookingLineNotify}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-booking-checkin" className="scroll-mt-6">
        <BookingCheckInNotificationSetting
          checkinSettings={checkinSettings}
          setCheckinSettings={setCheckinSettings}
          bookingTypeForSocket={bookingTypeForSocket}
          setBookingTypeForSocket={setBookingTypeForSocket}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-booking-hours" className="scroll-mt-6">
        <MerchantReservationTimes
          inputEnable={inputEnable}
          merchantReservation={merchantReservation}
          setMerchantReservation={setMerchantReservation}
        />
        </div>
      </div>
    )}
    {selectTab === 'performanceRake' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-fake-performance" className="scroll-mt-6">
        <AboutMerchantFakePerformanceReference
          merchantFakePerformanceRefer={merchantFakePerformanceRefer}
          setMerchantFakePerformanceRefer={setMerchantFakePerformanceRefer}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-rake-threshold" className="scroll-mt-6">
        <AboutMerchantRakePerformanceRefer
          merchantRakeReferemce={merchantRakeReferemce}
          setMerchantRakeReferemce={setMerchantRakeReferemce}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'password' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-password" className="scroll-mt-6">
        <PasswordSetting
          setPasswordSetting={setPasswordSetting}
          passwordSetting={passwordSetting}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'function' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-function" className="scroll-mt-6">
        <AboutSettingFunction
          aboutSettingFunction={aboutSettingFunction}
          setAboutSettingFunction={setAboutSettingFunction}
          setMerchantAvatar={setMerchantAvatar}
          merchantLogo={merchantLogo}
          setMerchantLogo={setMerchantLogo}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'customer' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-customer-page" className="scroll-mt-6">
        <AboutCustomerSideSetting
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-customer-function" className="scroll-mt-6">
        <AboutCustomerSettingFunction
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          requiredColumnOptions={requiredColumnOptions}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-customer-booking" className="scroll-mt-6">
        <AboutCustomerBooking
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-customer-link" className="scroll-mt-6">
        <AboutCustomerSideExternalLink
          cusExternalLink={cusExternalLink}
          refetchLink={getMerchantCusExternalLink.refetch}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'designer' && (
      <div className="flex flex-col gap-6">
        <div id="parameter-designer-link" className="scroll-mt-6">
        <AboutDesignerSideExternalLink
          externalLink={externalLink}
          refetchLink={getMerchantExternalLink.refetch}
          inputEnable={inputEnable}
        />
        </div>
        <div id="parameter-designer-booking" className="scroll-mt-6">
        <ReservationSettingForStylist
          CBRDStylist={CBRDStylist}
          setCBRDStylist={setCBRDStylist}
          inputEnable={inputEnable}
        />
        </div>
      </div>
    )}
    {selectTab === 'customerTracking' && (
      <div className="flex flex-col gap-6">
        <AboutCustomerTracking
          hairCondition={hairCondition}
          setHairCondition={setHairCondition}
          inputEnable={inputEnable}
        />
      </div>
    )}
    </>
  )
}
