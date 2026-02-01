import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client'

const GET_SHORTCUTS = gql`
  query GET_SHORTCUTS {
    shortcuts {
      id
      name
      no
      createdAt
      updatedAt
      creator {
        name
      }
      editor {
        name
      }
      services {
        name
        no
        price
      }
      products {
        name
        no
        sellPrice
      }
      memberships {
        name
        no
        sellPrice
      }
      tickets {
        name
        no
        price
      }
    }
  }
`

const getShortcuts = () => {
  return useQuery(GET_SHORTCUTS, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_SHORTCUTS_FOR_ORDERCREATE = gql`
  query GET_SHORTCUTS_FOR_ORDERCREATE {
    shortcuts {
      id
      name
      services {
        id
      }
      products {
        id
      }
      tickets {
        id
      }
      memberships {
        uuid
      }
    }
  }
`

const getShortcutsForOrderCreate = () => {
  const [getShortcutFunc, shortcutData] = useLazyQuery(GET_SHORTCUTS_FOR_ORDERCREATE, {
    fetchPolicy: 'cache-and-network',
  })
  return [getShortcutFunc, shortcutData]
}

const GET_SHORTCUT = gql`
  query GET_SHORTCUT($shortcutId: ID!) {
    shortcut(id: $shortcutId) {
      no
      name
      services {
        id
      }
      products {
        id
      }
      tickets {
        id
      }
      memberships {
        uuid
      }
    }
  }
`

const getShortcut = (shortcutId) => {
  return useQuery(GET_SHORTCUT, {
    variables: {
      shortcutId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const CREATE_SHORTCUT = gql`
  mutation CREATE_SHORTCUT($input: CreateShortcutInput!) {
    createShortcut(input: $input)
  }
`

const createShortcutFunc = () => {
  const [createShort] = useMutation(CREATE_SHORTCUT)
  return {
    createShort: ({ input }) =>
      createShort({
        variables: {
          input,
        },
      }),
  }
}

const UPDATE_SHORTCUT = gql`
  mutation UPDATE_SHORTCUT($input: UpdateShortcutInput!) {
    updateShortcut(input: $input)
  }
`

const updateShortcutFunc = () => {
  const [updateShortcut] = useMutation(UPDATE_SHORTCUT)
  return {
    updateShortcut: ({ input }) =>
      updateShortcut({
        variables: {
          input,
        },
      }),
  }
}

const DELETE_SHORTCUT = gql`
  mutation DELETE_SHORTCUT($deleteShortcutId: ID!) {
    deleteShortcut(id: $deleteShortcutId)
  }
`

const deleteShortcutFunc = () => {
  const [deleteShortcut] = useMutation(DELETE_SHORTCUT)
  return {
    deleteShortcut: (deleteShortcutId) =>
      deleteShortcut({
        variables: {
          deleteShortcutId,
        },
      }),
  }
}


export {
  getShortcuts, getShortcut, createShortcutFunc, updateShortcutFunc, deleteShortcutFunc,
  getShortcutsForOrderCreate
}