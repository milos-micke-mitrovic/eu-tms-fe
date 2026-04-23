/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Diagnostic assertion helpers for integration tests.
 * Provide clear, actionable error messages when BE endpoints fail.
 */

/**
 * Assert REST response is successful, with detailed error on failure.
 */
export function assertRestSuccess(
  result: { status: number; data: any },
  expectedStatuses: number[] = [200, 201],
  context: string = ''
) {
  if (!expectedStatuses.includes(result.status)) {
    const errorDetail = result.data
      ? JSON.stringify(
          {
            status: result.status,
            errorCode: result.data?.errorCode,
            message: result.data?.message,
            fieldErrors: result.data?.fieldErrors,
          },
          null,
          2
        )
      : `Status: ${result.status} (no response body)`

    throw new Error(
      `REST call failed${context ? ` [${context}]` : ''}:\n${errorDetail}`
    )
  }
}

/**
 * Assert GraphQL response has no errors, with detailed error on failure.
 */
export function assertGraphqlSuccess(
  result: { data?: any; errors?: any[] },
  queryName: string = ''
) {
  if (result.errors?.length) {
    const errorDetails = result.errors.map((e: any) => ({
      path: e.path?.join('.') ?? 'root',
      message: e.message,
      errorCode: e.extensions?.errorCode,
      classification: e.extensions?.classification,
    }))
    throw new Error(
      `GraphQL query failed${queryName ? ` [${queryName}]` : ''}:\n${JSON.stringify(errorDetails, null, 2)}`
    )
  }
}

/**
 * Assert GraphQL response has data for a specific field.
 */
export function assertGraphqlData<T = unknown>(
  result: { data?: any; errors?: any[] },
  fieldName: string,
  queryName: string = ''
): T {
  assertGraphqlSuccess(result, queryName || fieldName)
  if (!result.data?.[fieldName]) {
    throw new Error(
      `GraphQL query returned no data for "${fieldName}"${queryName ? ` [${queryName}]` : ''}`
    )
  }
  return result.data[fieldName]
}
