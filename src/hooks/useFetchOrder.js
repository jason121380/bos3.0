import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_ORDER = gql`
  query FETCH_ORDER($orderId: ID!) {
    order(orderId: $orderId) {
      id
      no
      date
      payType
      walletPay
      isReserved
      isDesignate
      previewItem
      isCloseAccount
      closeAccountDate
      amountByOtherPay
      status
      remark
      customer {
        id
        no
        name
        cellphone
      }
      designer {
        id
        name
        designerNo
      }
      serviceOrders {
        id
        name
        price
        thirdPartyPayName
        thirdPartyPayId
        service {
          id
          name
          no
          isLocked
          isNoCash
          isBindedThirdPartTicketLocked
        }
        helperList {
          id
          type
          isDesignate
          helperDeductionType
          helper {
            id
            designerNo
            lastName
            firstName
          }
        }
      }
      productOrders {
        id
        name
        count
        price
        thirdPartyPayId
        seller {
          id
          lastName
          firstName
          designerNo
        }
        product {
          id
          no
          name
          isLocked
        }
      }
      ticketOrders {
        id
        name
        price
        count
        availableCount
        remark
        service {
          id
          no
          name
          price
          isLocked
        }
        intoPerformanceWhileBuying
      }
      membershipOrders{
        expiryDate
        price
        thirdPartyPayId
        remark
        validDayCount
        seller{
          id
        }
        membership{
          uuid
          effecitveDay
        }
      }
      useTicketOrders {
        id
        name
        price
        pricePerCount
        service {
          id
          no
          name
          price
        }
        helperList {
          id
          type
          isDesignate
          helperDeductiontype
          helper {
            id
            firstName
            lastName
            designerNo
          }
        }
      }
      staticDetail {
        designerName
        serviceType
        itemName
        count
        price
        helperList {
          helperName
          helperType
          helperNo
        }
      }
      isServiceEditable
      isProductEditable
      isTicketSellingEditable
      isTicketUsageEditable
      seatNumber
      bonusDecount
      bonusDeposit
      bonusUsed
      source
      serialNumber
      raffleRecord {
        number
        ruleName
      }
    }
  }
`

const FETRCH_SERVICE_ORDER = gql`
  query FETRCH_SERVICE_ORDER($orderId: ID!) {
    order(orderId: $orderId) {
      id
      serviceOrders {
        id
        name
        price
        thirdPartyPayName
        thirdPartyPayId
        service {
          id
          name
          no
          isLocked
          isNoCash
          isBindedThirdPartTicketLocked
        }
        helperList {
          id
          type
          isDesignate
          helperDeductionType
          helper {
            id
            designerNo
            lastName
            firstName
          }
        }
      }
    }
  }
`

const FETCH_PRODUCT_ORDER = gql`
  query FETCH_PRODUCT_ORDER($orderId: ID!) {
    order(orderId: $orderId) {
      id
      productOrders {
        id
        name
        count
        price
        thirdPartyPayId
        seller {
          id
          lastName
          firstName
          designerNo
        }
        product {
          id
          no
          name
          isLocked
        }
      }
    }
  }
`

const FETCH_MEMBERSHIP_ORDER = gql`
  query FETCH_MEMBERSHIP_ORDER($orderId: ID!) {
    order(orderId: $orderId) {
      id
      membershipOrders{
        purchaseDate
        validDayCount
        expiryDate
        price
        thirdPartyPayId
        remark
        seller{
          id
        }
        membership{
          uuid
          isLocked
          effecitveDay
        }
      }
    }
  }
`

const FETCH_ORDER_FOR_PRINT = gql`
  query FETCH_ORDER_FOR_PRINT($orderId: ID!) {
    order(orderId: $orderId) {
      id
      no
      date
      walletUsedForDecount
      otherPayWayForDecount
      bonusDeposit
      bonusUsed
      bonusDecountForReport
      customerLeftBonus
      customerLeftWallet
      customer {
        name
      }
      designer {
        id
        name
        designerNo
      }
      serviceOrders {
        price
        thirdPartyPayName
      }
      productOrders {
        count
        price
        thirdPartyPayName
      }
      ticketOrders {
        id
        name
        price
        count
        availableCount
        remark
        service {
          id
          no
          name
          price
          isLocked
        }
        intoPerformanceWhileBuying
      }
      membershipOrders{
        price
        thirdPartyPayName
      }
      useTicketOrders {
        id
        name
        price
        pricePerCount
        service {
          id
          no
          name
          price
        }
        helperList {
          id
          type
          isDesignate
          helperDeductiontype
          helper {
            id
            firstName
            lastName
            designerNo
          }
        }
      }
      staticDetail {
        designerName
        serviceType
        itemName
        count
        price
        helperList {
          helperName
          helperType
          helperNo
        }
      }
    }
  }
`

export default function useFetchOrder({ id }) {
  return useQuery(FETCH_ORDER, {
    variables: {
      orderId: id,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useFetchServiceOrders = ({ id }) => {
  return useQuery(FETRCH_SERVICE_ORDER, {
    variables: {
      orderId: id,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useFetchProductOrder = ({ id }) => {
  return useQuery(FETCH_PRODUCT_ORDER, {
    variables: {
      orderId: id,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useFetchUseMembershipOrder = ({ id }) => {
  return useQuery(FETCH_MEMBERSHIP_ORDER, {
    variables: {
      orderId: id,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const useFetchOrderForPrint = () => {
  const [getOrderLazy, orderDataLazy] = useLazyQuery(FETCH_ORDER_FOR_PRINT, {
    fetchPolicy: 'cache-and-network',
  })
  return [getOrderLazy, orderDataLazy]
}
