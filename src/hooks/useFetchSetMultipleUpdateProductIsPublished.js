import { gql, useMutation } from '@apollo/client'

const SET_MULTIPLE_UPDATE_PRODUCT_IS_PUBLISHED = gql`
  mutation MultipleUpdateProductIsPublished($input: MultipleUpdateProductIsPublishedInput!) {
    multipleUpdateProductIsPublished(input: $input)
  }
`

export default function useFetchSetMultipleUpdateProductIsPublished() {
  const [setPublished] = useMutation(SET_MULTIPLE_UPDATE_PRODUCT_IS_PUBLISHED)
  return {
    setPublished: ({ input }) =>
      setPublished({
        variables: {
          input,
        },
      }),
  }
}
