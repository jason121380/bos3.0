import { gql, useMutation } from '@apollo/client'
import { saveStoredUser } from 'lib/stored-user'

// userLoginForLine 回傳的是使用者本人（id、name、merchants…），不是 userLoginV2 那種
// { token, user, officialBrandMerchantId }。此 repo 的 selection set 沒有 token，
// 後端 schema 不在這裡，不能自行加欄位——加了不存在的欄位會讓整次登入 mutation 失敗。
// 若回應物件上已經帶了非空字串 token（目前這支查詢不會選到），才比照一般登入寫入；
// 沒有就不要寫 localStorage，避免存成 undefined 或空字串把既有憑證清掉。
export function persistLineLoginSession(payload) {
  if (!payload || typeof payload !== 'object') return false
  saveStoredUser(payload)
  if (typeof payload.token === 'string' && payload.token.length > 0) {
    localStorage.setItem('token', payload.token)
  }
  return true
}

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

export const LOGINFORLINE = gql`
  mutation LOGINFORLINE($input: UserLoginInput!) {
    userLoginForLine(input: $input) {
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

const useFetchLoginForLine = () => {
  const [loginForLine] = useMutation(LOGINFORLINE)
  return {
    loginForLine: ({ cellphone, password }) =>
      loginForLine({
        variables: {
          input: {
            cellphone,
            password,
          },
        },
      }),
  }
}

export default useFetchLoginForLine
