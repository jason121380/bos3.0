import { gql, useLazyQuery, useQuery } from '@apollo/client'

const FETCH_ME_PERMISSIONS = gql`
  query FETCH_THIRDPARTYS {
    me {
      id
      permissionActions {
        id
      }
    }
  }
`
export const useFetchMePermissions = date =>
  useQuery(FETCH_ME_PERMISSIONS, {
    fetchPolicy: 'cache-and-network',
  })

export const mockedProfile = {
  data: {
    me: {
      id: 'b69fb0d9-bfbf-4814-81c9-c9081f0390cc',
      uid: 'ZNE526321',
      email: null,
      status: 'ok',
      gender: 'MALE',
      avatar:
        'https://cdn1.iconfinder.com/data/icons/navigation-elements/512/user-login-man-human-body-mobile-person-512.png',
      address: null,
      nickName: ' ',
      birthday: -2208961440000,
      jobTitle: '專員',
      userCode: 'a64398dd-537d-405c-afc0-9afaec6e61b0',
      isStaff: false,
      notDesigner: true,
      lastName: 'John',
      firstName: 'Weng',
      cellphone: '0935061030',
      orders: {
        pageLimit: 10,
        pageOffset: 10,
        totalCount: 10,
        orders: [
          {
            id: 'id',
            date: 'date',
            customer: {
              id: 'id',
              name: 'name',
            },
            designer: {
              id: 'id',
              name: 'name',
            },
            previewItem: ['ㄌ'],
            serviceTotal: 1,
            sellTicketTotal: 0,
            productTotal: 0,
            payType: ['現金'],
          },
        ],
      },
      merchants: [
        {
          id: '9062b97d-09ee-4071-bb6f-168bebe376dc',
          name: 'PS9',
          pairId: '005002',
          solmateKey: null,
        },
        {
          id: '9ff4e2f2-efa4-4217-9f3d-20743cdbc72e',
          name: '上越汐止',
          pairId: '470984',
          solmateKey: null,
        },
        {
          id: '027edc96-118f-45d5-9d09-405ad2e80edd',
          name: 'AT29',
          pairId: '038065',
          solmateKey: null,
        },
        {
          id: 'fcad7dc9-45c6-426a-9aaf-aee6e627f85b',
          name: '上越職人',
          pairId: '396737',
          solmateKey: null,
        },
        {
          id: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
          name: 'Envy Studio',
          pairId: '695573',
          solmateKey: 'bWxncm91cF9hcGlAc29sbWF0ZS5jYzpzb2xtYXRlWG1sZ3JvdXA',
        },
        {
          id: '23a222fb-9d9b-4434-89d2-35e05fe5e5b9',
          name: 'Envy Studio 測試',
          pairId: '695575',
          solmateKey: null,
        },
      ],
      userGroup: '高層',
      userGroups: [
        {
          id: 1,
          name: '第一事業部',
          groups: [
            {
              id: 27,
              name: '張晉瑋區',
              merchants: [
                {
                  id: '3f33dbc7-0fd1-4504-9ab3-0c43a41ef603',
                  name: 'Envy Studio',
                },
                {
                  id: '23a222fb-9d9b-4434-89d2-35e05fe5e5b9',
                  name: 'Envy Studio 測試',
                },
              ],
            },
          ],
          merchants: [
            {
              id: '9062b97d-09ee-4071-bb6f-168bebe376dc',
              name: 'PS9',
            },
            {
              id: 'fcad7dc9-45c6-426a-9aaf-aee6e627f85b',
              name: '上越職人',
            },
          ],
        },
        {
          id: 4,
          name: '第四事業部',
          groups: [
            {
              id: 22,
              name: '吳國隆區',
              merchants: [
                {
                  id: '027edc96-118f-45d5-9d09-405ad2e80edd',
                  name: 'AT29',
                },
              ],
            },
          ],
          merchants: [],
        },
        {
          id: 9,
          name: '張英楷區',
          groups: [],
          merchants: [
            {
              id: '9ff4e2f2-efa4-4217-9f3d-20743cdbc72e',
              name: '上越汐止',
            },
          ],
        },
      ],
      groupCategory: '總部',
      isAdmin: true,
    },
  },
}

export const FETCH_PROFILE = gql`
  query PROFILE {
    me {
      id
      userCode
      name
      jobTitle
      firstName
      lastName
      email
      contactAddress
      address
      serialNumber
      birthday
      gender
      nickName
      designerNo
      cellphone
      status
      displayRate
      theme
      avatar
      selfIntroduction
      selfIntroductionLink
      merchantIdentity {
        authorityName
        authorityId
      }
      merchants {
        id
        name
        pairId
        solmateKey
        no
      }
      userGroups {
        id
        name
        no
        groups {
          id
          name
          no
          merchants {
            id
            name
            no
          }
        }
        merchants {
          id
          name
        }
      }
    }
  }
`
export default function useFetchProfile() {
  return useQuery(FETCH_PROFILE, {
    fetchPolicy: 'cache-and-network',
  })
}
export const FETCH_PROFILE_IDENDITY = gql`
  query FETCH_PROFILE_IDENDITY {
    me {
      id
      merchantIdentity {
        authorityName
        authorityId
      }
    }
  }
`
export function useFetchProfileIdentity() {
  return useQuery(FETCH_PROFILE_IDENDITY, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useLazyFetchProfile = function (params) {
  const orders = params && params.orders ? params.orders : {}
  const [fetchProfile, profile] = useLazyQuery(
    FETCH_PROFILE,
    {
      variables: {
        orders,
      },
    },
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return {
    fetchProfile,
    profile,
  }
}

const FETCH_PROFILE_ORDERS = gql`
  query FETCH_PROFILE_ORDERS($input: OrdersInput!) {
    me {
      id
      name
      orders(input: $input) {
        intervalSummary {
          bonusDecountForReport
        }
        orders {
          id
          date
          no
          isDesignate
          serviceFakeTotal
          serviceOrders {
            thirdPartyPayName
          }
          productFakeTotal
          useTicketTotal
          ticketOrders {
            price
          }
          walletPay
          amountByOtherPay
          cashTotal
          remark
          customer {
            name
            cellphone
          }
          designer {
            name
            designerNo
          }
          bonusDecount
        }
        pageLimit
        pageOffset
        totalCount
      }
    }
  }
`

export const useFetchProfileOrders = ({ input }) => {
  return useQuery(FETCH_PROFILE_ORDERS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export const useFetchProfileOrdersLazy = () => {
  const [fetchProfileOrdersLazy, profileOrdersLazyData] = useLazyQuery(FETCH_PROFILE_ORDERS, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchProfileOrdersLazy, profileOrdersLazyData }
}
