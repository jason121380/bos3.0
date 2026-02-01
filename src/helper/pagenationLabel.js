const pagenationLabel = ref => {
  const allEle = ref.querySelectorAll('.MuiTablePagination-displayedRows')
  if (allEle.length) {
    const last = allEle.length - 1
    let text = allEle[last].innerHTML
    if (text.indexOf("筆&nbsp;&nbsp;&nbsp;共") === -1) {
      text = '第&nbsp;' + text.replace('of', "筆&nbsp;&nbsp;&nbsp;共") + '&nbsp;筆'
      allEle[last].innerHTML = text
    }
  }
}

export default pagenationLabel