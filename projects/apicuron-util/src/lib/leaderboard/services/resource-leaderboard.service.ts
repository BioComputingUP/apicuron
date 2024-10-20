import { Injectable } from "@angular/core";
import {
  LeaderboardOption,
  LeaderboardOptions,
  LeaderboardParsedOption,
} from "../interfaces/leaderboard-options";
import { leaderboardsAvailable } from "../constants";
import { LeaderboardDef } from "../interfaces/leaderboard-def.interface";

@Injectable()
export class ResourceLeaderboardService {
  availableLeaderboardNames = leaderboardsAvailable.map(
    (availableOption) => availableOption.name
  );
  getLeaderboardColumnNames(leaderboardDef: LeaderboardDef): string[] {
    return leaderboardDef.columns.map((column) => column.columnName);
  }

  getLeaderboardDef(leaderboardName: string): LeaderboardDef {
    const leaderboard = leaderboardsAvailable.find(
      (availableOption) => availableOption.name === leaderboardName
    );
    if (!leaderboard) {
      throw new Error(`Leaderboard ${leaderboardName} not available`);
    }
    return leaderboard;
  }
  parseOptions(options: LeaderboardOptions): LeaderboardParsedOption[] {
    if(!options){
      options = this.availableLeaderboardNames;
    }
    if (!(options instanceof Array)) {
      throw new Error("Leaderboard options must be an array");
    }

    const validatedOptions: LeaderboardOptions = options.filter((option) =>
      this.validateOption(option)
    );

    const processedOptions = validatedOptions.map((option) => {
      if (typeof option === "string") {
        const leaderboard = this.getLeaderboardDef(option);
        return {
          leaderboard: option,
          columns: this.getLeaderboardColumnNames(leaderboard),
          label: leaderboard.label,
        };
      }
      const leaderboard = this.getLeaderboardDef(option[0]);
      return {
        leaderboard: option[0],
        columns: option[1],
        label: leaderboard.label,
      };
    });

    return processedOptions;
  }

  leaderboardExists(leaderboardName: string): boolean {
    return this.availableLeaderboardNames.includes(leaderboardName);
  }

  validateOption(option: LeaderboardOption) {
    if (typeof option === "string") {
      if (!this.leaderboardExists(option)) {
        console.warn(
          `Leaderboard ${option} not available, available leaderboards are: ${this.availableLeaderboardNames}`
        );
        return false;
      }
      return true;
    }

    if (option instanceof Array) {
      if (option.length !== 2) {
        throw new Error("Leaderboard option must be an array of 2 elements");
      }

      if (typeof option[0] !== "string") {
        throw new Error("Leaderboard option name must be a string");
      }

      if (!(option[1] instanceof Array) || option[1].length === 0) {
        throw new Error("Leaderboard option columns must be a non empty array");
      }

      if (!this.leaderboardExists(option[0])) {
        console.warn(
          `Leaderboard ${option} not available, available leaderboards are: ${this.availableLeaderboardNames}`
        );
        return false;
      }

      return true;
    }

    console.warn("Invalid leaderboard option, received: ", option);
    return false;
  }
}
