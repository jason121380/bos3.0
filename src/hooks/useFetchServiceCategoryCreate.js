import { gql, useMutation } from '@apollo/client'

export const CREATE_SERVICE_CATEGORY = gql`
  mutation($input: CreateServiceCategoryinput!) {
    createServiceCategory(input: $input)
  }
`
const merchantId = window.localStorage.getItem('userMerchant') ? JSON.parse(window.localStorage.getItem('userMerchant')).id : null

export const mockServiceCreateRes = {
  data: {
    createServiceCategory: [
      {
        no: 'testNo',
        name: 'testName',
        attribution: '燙',
        remark: '',
        OfficialBrandMerchantId: merchantId,
      },
    ],
  },
}

export default function useFetchServiceCategoryCreate() {
  const [createServiceCategory] = useMutation(CREATE_SERVICE_CATEGORY)
  return {
    createServiceCategory: ({ no, name, attribution, remark, OfficialBrandMerchantId }) =>
      createServiceCategory({
        variables: {
          input: {
            no,
            name,
            attribution,
            remark,
            OfficialBrandMerchantId,
          },
        },
      }),
  }
}
