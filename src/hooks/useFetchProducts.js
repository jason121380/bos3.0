import { gql, useQuery } from '@apollo/client'

export const GET_PRODUCT = gql`
  query($input: ProductsInput!) {
    products(input: $input) {
      pageLimit
      pageOffset
      totalCount
      data {
        id
        cost
        no
        name
        isUsing
        sellPrice
        updatedAt
        stockUnit
        employeePrice
        productCategory {
          id
          name
        }
        creator {
          id
          name
        }
        isLocked
        isAvailableForSale
      }
    }
  }
`

export const mockedProducts = {
  data: {
    products: [
      {
        id: '61ad4ad1-5bc7-4831-8d88-a8e1ea414fc6',
        no: 'J1',
        name: 'JuliArt 控油洗髮精',
        isUsing: true,
        sellPrice: 780,
        updatedAt: 1594113654448,
        stockUnit: '瓶',
        productCategory: {
          id: '871c18c2-2bda-459e-8a82-41e02ce5c4b4',
          name: 'JuliArt',
        },
        creator: {
          id: 'b8dfb9f4-fa87-4a50-9536-1521be4962fb',
          name: 'Jason ',
        },
      },
      {
        id: '0152a745-da35-44d0-b729-eaf15fc43158',
        no: 'N1',
        name: 'N系列乳油木保濕洗髮精 750ml',
        isUsing: true,
        sellPrice: 2200,
        updatedAt: 1594115427504,
        stockUnit: '瓶',
        productCategory: {
          id: '94fa7482-de4e-427f-b0d0-bda65a1c03e9',
          name: 'Napla',
        },
        creator: {
          id: 'b8dfb9f4-fa87-4a50-9536-1521be4962fb',
          name: 'Jason ',
        },
      },
      {
        id: '77a89aba-a5a7-47c9-985d-87c3fb840d6a',
        no: 'N2',
        name: 'N系列束感造型乳949',
        isUsing: true,
        sellPrice: 820,
        updatedAt: 1594115438374,
        stockUnit: '瓶',
        productCategory: {
          id: '94fa7482-de4e-427f-b0d0-bda65a1c03e9',
          name: 'Napla',
        },
        creator: {
          id: 'b8dfb9f4-fa87-4a50-9536-1521be4962fb',
          name: 'Jason ',
        },
      },
      {
        id: 'f8c03dd1-ad01-4580-a371-7d3c3f58652b',
        no: 'M1',
        name: 'Masumi 頭皮賦活精華水',
        isUsing: true,
        sellPrice: 700,
        updatedAt: 1594115448423,
        stockUnit: '瓶',
        productCategory: {
          id: 'b2902861-3047-4cd4-928a-48373e677f9e',
          name: 'Masumi',
        },
        creator: {
          id: 'b8dfb9f4-fa87-4a50-9536-1521be4962fb',
          name: 'Jason ',
        },
      },
      {
        id: '90293256-0e62-4b55-8330-08bdfe6c528a',
        no: 'N4',
        name: 'N系列炫彩護髮乳(藍紫色) 300g',
        isUsing: true,
        sellPrice: 920,
        updatedAt: 1594115462166,
        stockUnit: '瓶',
        productCategory: {
          id: '94fa7482-de4e-427f-b0d0-bda65a1c03e9',
          name: 'Napla',
        },
        creator: {
          id: 'b8dfb9f4-fa87-4a50-9536-1521be4962fb',
          name: 'Jason ',
        },
      },
    ],
  },
}

export default function useFetchProducts(input = {}) {
  const products = useQuery(GET_PRODUCT, {
    variables: {
      input,
    },
  })
  return products
}
const GET_PRODUCT_IN_AUTO_COMPLETE = gql`
  query GET_PRODUCT_IN_AUTO_COMPLETE ($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        no
        name
        isUsing
        sellPrice
        isLocked
      }
    }
  }
`

export function useFetchProductsInAutoComplete(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_AUTO_COMPLETE, {
    variables: {
      input,
    },
  })
  return products
}
const GET_PRODUCT_IN_EMPLOYEE_PICKING = gql`
  query($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        no
        name
        employeePrice
        cost
        stockUnit
        productCategory {
          id
          name
        }
      }
    }
  }
`

export function useFetchProductsInEmployeePicking(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_EMPLOYEE_PICKING, {
    variables: {
      input,
    },
  })
  return products
}

const GET_PRODUCT_IN_EMPLOYEE_PICKING_EDIT = gql`
  query($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        name
        no
        sellPrice
        isPublished
      }
    }
  }
`

export function useFetchProductsInEmployeePickingEdit(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_EMPLOYEE_PICKING_EDIT, {
    variables: {
      input,
    },
  })
  return products
}

const GET_PRODUCT_IN_PRODUCT_RESTOCK = gql`
  query GET_PRODUCT_IN_PRODUCT_RESTOCK ($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        no
        name
        cost
        remainingCount
        productCategory {
          id
          name
        }
        merchantVendor {
          merchantVendorUUId
          name
        }
      }
    }
  }
`

export function useFetchProductsInProductRestock(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_PRODUCT_RESTOCK, {
    variables: {
      input,
    },
  })
  return products
}

const GET_PRODUCT_IN_ORDER_DETAIL = gql`
  query($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        name
      }
    }
  }
`

export function useFetchProductsInOrderDetail(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_ORDER_DETAIL, {
    variables: {
      input,
    },
  })
  return products
}

const GET_PRODUCT_IN_TRANSFERLIST = gql`
  query GET_PRODUCT_IN_TRANSFERLIST ($input: ProductsInput!) {
    products(input: $input) {
      data {
        id
        no
        name
        sellPrice
      }
    }
  }
`

export function useFetchProductsInTransferList(input = {}) {
  const products = useQuery(GET_PRODUCT_IN_TRANSFERLIST, {
    variables: {
      input,
    },
  })
  return products
}