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
        <AboutOrderCreate
          orderCreateSetting={orderCreateSetting}
          setOrderCreateSetting={setOrderCreateSetting}
          inputEnable={inputEnable}
        />
        <AboutOrderDetail
          orderCreateSetting={orderCreateSetting}
          setOrderCreateSetting={setOrderCreateSetting}
          uploadMerchantLogo={uploadMerchantLogo}
          inputEnable={inputEnable}
        />
        <AboutOrderSource
          reference={reference}
          setReference={setReference}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'employeeSchedule' && (
      <div className="flex flex-col gap-6">
        <AboutEmployeeSchedule
          isMerchantClockInSetting={isMerchantClockInSetting}
          setIsMerchantClockInSetting={setIsMerchantClockInSetting}
          loading={merchantClockInSettingData.loading}
          inputEnable={inputEnable}
        />
        <AttendanceEmployeeScheduleSetting
          UESUsing={UESUsing}
          setUESUsing={setUESUsing}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'salary' && (
      <div className="flex flex-col gap-6">
        <AboutSalaryAddAndDeduction
          service={service}
          onChange={handleServiceChange}
          inputEnable={inputEnable}
        />
        <AboutMerchantBankSettings
          merchantBankSettings={merchantBankSettings}
          setDisplayNonBankAccountInBankTransferReport={setDisplayNonBankAccountInBankTransferReport}
          displayNonBankAccountInBankTransferReport={displayNonBankAccountInBankTransferReport}
          onChange={handleMerchantBankSettings}
          inputEnable={inputEnable}
        />
        <AboutMonthCheckoutAddSalaryItems
          inputEnable={inputEnable}
          checkoutAndSalaryItem={checkoutAndSalaryItem}
          setCheckoutAndSalaryItem={setCheckoutAndSalaryItem}
        />
      </div>
    )}
    {selectTab === 'report' && (
      <div className="flex flex-col gap-6">
        <AboutPriceDisplayOnDailyReport
          aboutReport={aboutReport}
          setAboutReport={setAboutReport}
          inputEnable={inputEnable}
        />
        <AboutOtherReport
          inputEnable={inputEnable}
          aboutReport={aboutReport}
          setAboutReport={setAboutReport}
        />
      </div>
    )}
    {selectTab === 'booking' && (
      <div className="flex flex-col gap-6">
        <NonDesignationBookingLimitSetting
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          inputEnable={inputEnable}
        />
        <IsReservationNeedReview
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          bookingCusCheck={bookingCusCheck}
          setBookingCusCheck={setBookingCusCheck}
          inputEnable={inputEnable}
        />
        <BookingNotificationSetting
          aboutBooking={aboutBooking}
          setAboutBooking={setAboutBooking}
          merchantBookingNotification={merchantBookingNotification}
          setMerchantBookingNotification={setMerchantBookingNotification}
          inputEnable={inputEnable}
        />
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
        <BookingCheckInNotificationSetting
          checkinSettings={checkinSettings}
          setCheckinSettings={setCheckinSettings}
          bookingTypeForSocket={bookingTypeForSocket}
          setBookingTypeForSocket={setBookingTypeForSocket}
          inputEnable={inputEnable}
        />
        <MerchantReservationTimes
          inputEnable={inputEnable}
          merchantReservation={merchantReservation}
          setMerchantReservation={setMerchantReservation}
        />
      </div>
    )}
    {selectTab === 'performanceRake' && (
      <div className="flex flex-col gap-6">
        <AboutMerchantFakePerformanceReference
          merchantFakePerformanceRefer={merchantFakePerformanceRefer}
          setMerchantFakePerformanceRefer={setMerchantFakePerformanceRefer}
          inputEnable={inputEnable}
        />
        <AboutMerchantRakePerformanceRefer
          merchantRakeReferemce={merchantRakeReferemce}
          setMerchantRakeReferemce={setMerchantRakeReferemce}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'password' && (
      <div className="flex flex-col gap-6">
        <PasswordSetting
          setPasswordSetting={setPasswordSetting}
          passwordSetting={passwordSetting}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'function' && (
      <div className="flex flex-col gap-6">
        <AboutSettingFunction
          aboutSettingFunction={aboutSettingFunction}
          setAboutSettingFunction={setAboutSettingFunction}
          setMerchantAvatar={setMerchantAvatar}
          merchantLogo={merchantLogo}
          setMerchantLogo={setMerchantLogo}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'customer' && (
      <div className="flex flex-col gap-6">
        <AboutCustomerSideSetting
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          inputEnable={inputEnable}
        />
        <AboutCustomerSettingFunction
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          requiredColumnOptions={requiredColumnOptions}
          inputEnable={inputEnable}
        />
        <AboutCustomerBooking
          aboutCustomer={aboutCustomer}
          setAboutCustomer={setAboutCustomer}
          inputEnable={inputEnable}
        />
        <AboutCustomerSideExternalLink
          cusExternalLink={cusExternalLink}
          refetchLink={getMerchantCusExternalLink.refetch}
          inputEnable={inputEnable}
        />
      </div>
    )}
    {selectTab === 'designer' && (
      <div className="flex flex-col gap-6">
        <AboutDesignerSideExternalLink
          externalLink={externalLink}
          refetchLink={getMerchantExternalLink.refetch}
          inputEnable={inputEnable}
        />
        <ReservationSettingForStylist
          CBRDStylist={CBRDStylist}
          setCBRDStylist={setCBRDStylist}
          inputEnable={inputEnable}
        />
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
