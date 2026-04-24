import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../../Truck-eu/src/main/resources/graphql/schema.graphqls',
  documents: ['src/features/**/api/*.ts', '!src/test/**', '!src/**/*.test.*'],
  ignoreNoDocuments: true,
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          Date: 'string',
          DateTime: 'string',
          BigDecimal: 'number',
          ID: 'string',
        },
        skipTypename: true,
        enumsAsTypes: true,
        avoidOptionals: false,
        maybeValue: 'T | null',
        // Skip validation for queries referencing future schema (dashboard)
        strictScalars: false,
      },
    },
  },
}

export default config
