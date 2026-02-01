import { gql, useMutation } from '@apollo/client'

export const mockedSuccessResp = {
  data: {
    userLoginV2: {
      id: 'id',
      cellphone: '0912345678',
      uid: 'uid',
      userCode: 'userCode',
      status: 'status',
      isNeedChangePassword: false,
      firstName: 'firstName',
      lastName: 'lastName',
      name: 'name',
      merchants: [
        {
          id: 'id',
          name: 'name',
          solmateKey: 'solmateKey',
        },
      ],
      isAdmin: false,
    },
  },
}

export const LOGINV2 = gql`
  mutation LOGINV2($input: UserLoginInput!) {
    userLoginV2(input: $input) {
      token
      user {
        id
        cellphone
        uid
        userCode
        status
        isNeedChangePassword
        firstName
        lastName
        name
        merchants {
          id
          name
          solmateKey
        }
        isAdmin
      }
      officialBrandMerchantId
      officialBrandMerchantName
    }
  }
`

const useFetchLoginV2 = () => {
  const [loginV2] = useMutation(LOGINV2)
  return {
    loginV2: ({ cellphone, password, isKeepLogin }) =>
      loginV2({
        variables: {
          input: {
            cellphone,
            password,
            isKeepLogin,
          },
        },
      }),
  }
}

export default useFetchLoginV2
