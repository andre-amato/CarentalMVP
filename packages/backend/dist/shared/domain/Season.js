export var Season;
(function (Season) {
    Season["PEAK"] = "PEAK";
    Season["MID"] = "MID";
    Season["OFF"] = "OFF";
})(Season || (Season = {}));
export class SeasonDeterminer {
    static getSeason(date) {
        const month = date.getMonth(); // 0-11 (Jan-Dec)
        const day = date.getDate(); // 1-31
        // Peak season - 1st of June to 15th of September
        if ((month === 5 && day >= 1) || // June
            month === 6 || // July
            month === 7 || // August
            (month === 8 && day <= 15)) {
            // September 1-15
            return Season.PEAK;
        }
        // Mid season - 15th of September to 31st of October, 1st of March to 1st of June
        if ((month === 8 && day > 15) || // September 16-30
            month === 9 || // October
            month === 2 || // March
            month === 3 || // April
            month === 4 || // May
            (month === 5 && day < 1)) {
            // Before June 1
            return Season.MID;
        }
        // Off-season - 1st of November to 1st of March
        return Season.OFF;
    }
}
