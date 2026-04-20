import { gql } from '@apollo/client'

export const GET_TACHOGRAPH_ENTRIES = gql`
  query GetTachographEntries($driverId: ID!, $from: Date!, $to: Date!) {
    tachographEntries(driverId: $driverId, from: $from, to: $to) {
      id
      driverId
      driverFirstName
      driverLastName
      entryDate
      drivingMinutes
      restMinutes
      otherWorkMinutes
      availabilityMinutes
      startOdometerKm
      endOdometerKm
      notes
      source
      status
      violations {
        id
        violationType
        severity
        description
        violationDate
        drivingMinutesActual
        drivingMinutesLimit
        restMinutesActual
        restMinutesLimit
      }
      createdAt
    }
  }
`

export const GET_TACHOGRAPH_WEEKLY_SUMMARY = gql`
  query GetTachographWeeklySummary($driverId: ID!, $weekStart: Date!) {
    tachographWeeklySummary(driverId: $driverId, weekStart: $weekStart) {
      driverId
      driverName
      weekStart
      weekEnd
      totalDrivingMinutes
      totalRestMinutes
      totalOtherWorkMinutes
      daysWithEntries
      violationCount
      worstSeverity
      entries {
        id
        entryDate
        drivingMinutes
        restMinutes
        otherWorkMinutes
        availabilityMinutes
        status
        violations {
          id
          violationType
          severity
          description
        }
      }
      violations {
        id
        violationType
        severity
        description
        violationDate
      }
    }
  }
`

export const GET_TACHOGRAPH_DRIVER_STATUSES = gql`
  query GetTachographDriverStatuses {
    tachographDriverStatuses {
      driverId
      driverFirstName
      driverLastName
      lastEntryDate
      currentWeekDrivingMinutes
      currentWeekDrivingLimit
      currentWeekDrivingPercent
      fortnightDrivingMinutes
      fortnightDrivingLimit
      openViolationCount
      worstSeverity
      status
    }
  }
`

export const GET_TACHOGRAPH_VIOLATIONS = gql`
  query GetTachographViolations($driverId: ID!, $from: Date!, $to: Date!) {
    tachographViolations(driverId: $driverId, from: $from, to: $to) {
      id
      violationType
      severity
      description
      violationDate
      drivingMinutesActual
      drivingMinutesLimit
      restMinutesActual
      restMinutesLimit
    }
  }
`

export const GET_TACHOGRAPH_MONTHLY_SUMMARY = gql`
  query GetTachographMonthlySummary($from: Date!, $to: Date!) {
    tachographMonthlySummary(from: $from, to: $to) {
      driverId
      driverName
      month
      totalDrivingMinutes
      totalRestMinutes
      totalOtherWorkMinutes
      entryCount
      avgDailyDrivingMinutes
    }
  }
`

export const GET_TACHOGRAPH_COMPLIANCE = gql`
  query GetTachographCompliance($from: Date!, $to: Date!) {
    tachographCompliance(from: $from, to: $to) {
      totalEntries
      compliantEntries
      nonCompliantEntries
      compliancePercent
    }
  }
`

export const GET_TACHOGRAPH_TOP_VIOLATORS = gql`
  query GetTachographTopViolators($from: Date!, $to: Date!, $limit: Int) {
    tachographTopViolators(from: $from, to: $to, limit: $limit) {
      driverId
      driverName
      totalViolations
      seriousViolations
      warnings
    }
  }
`
