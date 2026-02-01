import { css } from '@emotion/react'

export default {
  service: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    rowGap: '10px',
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginLeft: '12px',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    padding: 0,
    width: '50px',
    display: 'flex',
    marginLeft: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  point: css({
    marginLeft: '12px',
  }),
  saveButton: css({
    backgroundColor: "#e53935",
    color: "white",
    "&:hover": {
      backgroundColor: "#b22e2b",
      color: "white",
    },
  }),
  deleteButton: css({
    marginLeft: '10px',
    width: '112px'
  }),
  deleteButtonWithCount: css({
    marginLeft: '10px',
  })
}