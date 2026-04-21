import { gql } from '@apollo/client'

export const GET_PAYROLLS_BY_MONTH = gql`
  query GetPayrollsByMonth($monthYear: String!) {
    payrollsByMonth(monthYear: $monthYear) {
      id
      driverId
      driverFirstName
      driverLastName
      monthYear
      baseSalaryRsd
      perDiemTotalRsd
      overtimeAmountRsd
      kmBonusRsd
      routeBonusRsd
      otherBonusRsd
      grossTotalRsd
      totalDeductionsRsd
      netSalaryRsd
      status
      totalRoutes
      totalKm
      totalDrivingHours
      daysOnRoad
      notes
      createdAt
    }
  }
`

export const GET_PAYROLL_SUMMARY = gql`
  query GetPayrollSummary($monthYear: String!) {
    payrollSummary(monthYear: $monthYear) {
      monthYear
      driverCount
      totalGrossRsd
      totalNetRsd
      totalDeductionsRsd
      totalPerDiemRsd
      totalRoutes
      payrollsDraft
      payrollsConfirmed
      payrollsPaid
    }
  }
`

export const GET_PAYROLL_HISTORY = gql`
  query GetPayrollHistory($driverId: ID!) {
    payrollHistory(driverId: $driverId) {
      id
      monthYear
      baseSalaryRsd
      grossTotalRsd
      netSalaryRsd
      status
      totalRoutes
      totalKm
      daysOnRoad
      createdAt
    }
  }
`

export const GET_DRIVER_ADVANCES = gql`
  query GetDriverAdvances($driverId: ID!, $from: Date!, $to: Date!) {
    driverAdvances(driverId: $driverId, from: $from, to: $to) {
      id
      driverId
      driverName
      amountRsd
      advanceDate
      advanceType
      description
      settled
      payrollId
      createdAt
    }
  }
`
