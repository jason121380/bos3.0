export default {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  CardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40
  },
  timeWrap: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  box: {
    width: 50,
    height: 50,
    minWidth: 'unset',
    maxWidth: 'unset',
    flexWrap: 'wrap',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    display: 'flex',
    flexGrow: 1,
    gap: 30,
    flexWrap: 'wrap',
    justifyContent: 'end',
    '& svg': {
      cursor: 'pointer'
    }
  },
  textField: {
    '& input': {
      padding: '6px 0 7px !important'
    }
  }
}