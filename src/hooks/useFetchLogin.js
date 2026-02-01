import { gql, useMutation } from '@apollo/client'

export const mockedSuccessResp = {
  data: {
    userLogin: {
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

export const LOGIN = gql`
  mutation LOGIN($input: UserLoginInput!) {
    userLogin(input: $input) {
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
  }
`

const useFetchLogin = () => {
  const [login] = useMutation(LOGIN)
  return {
    login: ({ cellphone, password }) =>
      login({
        variables: {
          input: {
            cellphone,
            password,
          },
        },
      }),
  }
}

export default useFetchLogin
