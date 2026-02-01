import { gql, useQuery } from '@apollo/client'

const MONEY_ACCOUNT_DETAIL = gql`
  query MONEY_ACCOUNT_DETAIL($input: MoneyAccountDetailInput) {
    moneyAccountDetail(input: $input) {
      totalCount
      pageLimit
      pageOffset
      data {
        date
        # 材料貨款(員購)收入
        materialPaymentIncome
        # 包套卡收入
        packageCardRevenue
        # 集點卡兌換
        rendezvousCardExchange
        # 顧客還單
        customerReturn
        # 租金收入
        rentalIncome
        # 活動促銷贈品收入
        eventPromotionGiftIncome
        # 營業收入
        operatingIncome
        # 售貨收入
        salesRevenue
        # 入金卡收入
        depositCardIncome
        # 其他收入
        otherIncome
        # 髮券銷售
        voucherSales
        # 信用卡手續費
        creditCardFees
        # 信用卡收入
        creditCardIncome
        # 暫收款
        temporaryCollection
        # 音樂視訊費用
        musicVideoFee
        # 文具用品(匯影印)
        stationery
        # 活動廣告費(印刷、廣告)
        eventAdvertisingCosts
        # 折舊費(互助費)
        depreciationFee
        # 營業稅(稅捐)
        businessTax
        # 職工福利
        employeeBenefits
        # 活動促銷贈品支出
        eventPromotionGifts
        # 交通費
        transportation
        # 交際費(公關)
        communicationFees
        # 店用器材設備
        shopEquipment
        # 年度大項支出
        annualMajorExpenditure
        # 短溢金
        shortPremium
        # 紅利支出
        dividendPayout
        # 信用卡手續費(支出)
        creditCardFee
        # 髮片支出
        filmingExpenditure
        # 入金卡使用
        depositCardUse
        # 信用卡使用
        creditCardUse
        # 暫付款
        provisionalPayment
        # 包套卡支出
        packageCardExpenditure
        # 客戶欠單
        customerArrears
        # 現金禮券
        cashCoupon
        # 行政幹部薪資
        administrativeCadreSalary
        # 設計師薪資
        designerSalary
        # 助理薪資
        assistantSalary
        # 業績獎金
        performanceBonus
        # 員工借支
        employeeLoan
        # 員工獎勵
        employeeRewards
        # 伙食費
        foodExpenses
        # 髮券使用
        voucherUse
        # 房屋租金(租賃稅)
        houseRent
        # 勞健保勞退費
        laborHealthInsuranceLaborRefund
        # 教育訓練費
        educationAndTrainingFees
        # 總公司管理費
        headOfficeManagementFee
        # 材料貨款(員購)支出
        materialPurchase
        # 水費
        waterFee
        # 電費
        electricityFee
        # 瓦斯費
        wasfer
        # 電話費(網路)
        telephoneCharges
        # 修繕費
        repairFee
        # 店用耗材
        shopSupplies
        # 其他(雜項)支出
        otherExpenses
        # 清潔費用(毛巾清洗)
        cleaningFee
        # 書報雜誌費
        booksMagazinesAndFees
      }
    }
  }
`

export default function useFetchMoneyAccountDetail(input) {
  return useQuery(MONEY_ACCOUNT_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
