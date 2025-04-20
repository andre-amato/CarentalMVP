export enum Season {
  PEAK = 'PEAK',
  MID = 'MID',
  OFF = 'OFF',
}

export class SeasonDeterminer {
  static getSeason(date: Date): Season {
    const month = date.getMonth(); // 0-11 (Jan-Dec)
    const day = date.getDate(); // 1-31

    // Peak season - 1st of June to 15th of September
    if (
      (month === 5 && day >= 1) || // June (month 5 = June)
      month === 6 || // July
      month === 7 || // August
      (month === 8 && day <= 15) // September 1-15
    ) {
      return Season.PEAK;
    }

    // Off-season - 1st of November to 28th/29th of February
    if (
      month === 10 || // November
      month === 11 || // December
      month === 0 || // January
      month === 1 // February
    ) {
      return Season.OFF;
    }

    // Mid season - 16th of September to 31st of October, 1st of March to 31st of May
    if (
      (month === 8 && day > 15) || // September 16–30
      month === 9 || // October
      month === 2 || // March
      month === 3 || // April
      month === 4 || // May
      (month === 5 && day === 0) // This checks for 0th day of June (which never happens)
    ) {
      return Season.MID;
    }

    // Default to MID for any dates not covered above
    // This helps catch the case where the original logic had gaps
    return Season.MID;
  }
}
