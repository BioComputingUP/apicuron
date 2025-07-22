import { InjectionToken } from "@angular/core";
import { LeaderboardDef } from "./interfaces/leaderboard-def.interface";
import { totalLeaderboardDef } from "./leaderboards/total-leaderboard/leaderboard-def";
import { leaderboardDef as WeeklyLeaderboardDef } from "./leaderboards/weekly-leaderboard/weekly-leaderboard-def";
import { leaderboardDef as MonthlyLeaderboardDef } from "./leaderboards/monthly-leaderboard";
import { AnySchema, SchemaObject } from "ajv";
import { environment } from "../../../../../src/environments/environment";
import * as _ from "lodash";
export const LeaderboardsToken = new InjectionToken<LeaderboardDef[]>(
  "LeaderboardsListToken"
);

export const leaderboardsAvailable: LeaderboardDef[] = [
  MonthlyLeaderboardDef,
  totalLeaderboardDef,
  WeeklyLeaderboardDef,
];

export const defaultLeaderboardOptions = [
  MonthlyLeaderboardDef.name,
  totalLeaderboardDef.name,
  WeeklyLeaderboardDef.name,
];

const leaderboardOptionSchema = (
  leaderboardDef: LeaderboardDef
): SchemaObject => {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: `${environment.ws}/schemas/${_.kebabCase(
      leaderboardDef.name
    )}-options.json`,
    type: "array",
    items: [
      { type: "string", const: leaderboardDef.name },
      {
        type: "array",
        items: {
          type: "string",
          enum: leaderboardDef.columns.map((column) => column.columnName),
        },
      },
    ],
    minItems: 2,
    maxItems: 2,
  };
};

export const OptionSchema: SchemaObject = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: `${environment.ws}/schemas/leaderboard-option.json`,
  oneOf: [
    { type: "string", enum: defaultLeaderboardOptions },
    ...leaderboardsAvailable.map(leaderboardOptionSchema),
  ],
};
export const OptionsSchema: SchemaObject = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: `${environment.ws}/schemas/leaderboard-options.json`,
  type: "array",
  items: OptionSchema,
};
