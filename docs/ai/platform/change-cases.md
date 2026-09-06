# Change cases

**Purpose:** How to evolve data/APIs without Amplify GraphQL.

## Default

Implement in **petwell-api**. Do not edit `schema.graphql`. Do not `amplify push`.

## Cases

| Case | What | Amplify? |
|------|------|----------|
| A | New attribute, only HTTP reads it | No. `UpdateItem` |
| B | GraphQL must expose the field | Only if human asks. Prefer A |
| C | Query by a new field on an Amplify table | New `PetWell…` table, or `@index` + push |
| New table | New domain | Create `PetWell…` yourself. Never `@model` |
| Lambda bugfix | Code only | `amplify function push <name>` |

Do not add GSIs in the AWS console on `Model-{apiId}-{env}` tables.

Auth: Cognito JWT `sub`. Region: Dynamo `ap-southeast-1`, Vercel `sin1`.

Last updated: 2026-09-06 (UTC+8)
