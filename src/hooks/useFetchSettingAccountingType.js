import { gql, useMutation } from '@apollo/client'

const SET_ACCOUNTING_TYPE = gql`
  mutation SET_ACCOUNTING_TYPE($typeList: [String]!) {
    setAccountingType(typeList: $typeList)
  }
`

export default function useFetchSettingAccountingType() {
  const [setAccountType] = useMutation(SET_ACCOUNTING_TYPE)
  return {
    setAccountType: ({ typeList }) =>
      setAccountType({
        variables: {
          typeList,
        },
      }),
  }
}
