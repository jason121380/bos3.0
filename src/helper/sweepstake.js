const tidyConsumption = (data, range, attr, key) => {
  data[key].type = range
  data[key].belong = attr
}

const tidyDataObj = {
  PRODUCT: data => {
    data.product = true
  },
  MEMBERSHIP: data => {
    data.membershipCard = true
  },
  SERVICE: (data, range, attr) => tidyConsumption(data, range, attr, 'service'),
  TICKETSELLINPERFORMANCE: (data, range, attr) => tidyConsumption(data, range, attr, 'ticketSellInPerformance'),
  TICKETSELLNOTINPERFORMANCE: (data, range, attr) => tidyConsumption(data, range, attr, 'ticketSellNotInPerformance'),
  TICKETUSEPERFORMANCEENTERED: (data, range, attr) => tidyConsumption(data, range, attr, 'ticketUsePerformanceEntered'),
  TICKETUSEPERFORMANCENOTENTERED: (data, range, attr) => tidyConsumption(data, range, attr, 'ticketUsePerformanceNotEntered'),
}

export { tidyConsumption, tidyDataObj }
