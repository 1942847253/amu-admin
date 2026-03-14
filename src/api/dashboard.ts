import { requestGet } from './http'

export interface DashboardOverview {
  visits: number
  pendingTickets: number
  newUsers: number
}

export const fetchDashboardOverview = (silentError = false) => {
  return requestGet<DashboardOverview>({
    url: '/api/dashboard/overview',
    retry: 1,
    requestKey: 'dashboard-overview',
    cancelPrevious: true,
    silentError
  })
}
