export const PriceStatusEnum = Object.freeze({
    WITHOUTHISTORY: "WITHOUTHISTORY",
    LOWESTPRICE: "LOWESTPRICE",
    MOREEXPENSIVE: "MOREEXPENSIVE",
    REASONABLEPRICE: "REASONABLEPRICE",
    VERYEXPENSIVE: "VERYEXPENSIVE",
    EXPENSIVE: "EXPENSIVE",
    BELOWAVERAGE: "BELOWAVERAGE",
    NOHISTORY: "NOHISTORY",
    NOOPINION: "NOOPINION"
});

export const PeriodEnum = Object.freeze({
    "ALL": 0,
    "365days": 365,
    "182days": 182,
    "90days": 90,
    "45days": 45,
    "30days": 30,
    "15days": 15,
    "10days": 10,
    "7days": 7,
    "3days": 3,
    "1days": 1,
});

export function isValidPeriod(periodEnum) {
    return !!(PeriodEnum.hasOwnProperty(periodEnum) && parseInt(PeriodEnum[periodEnum]) >= 0);
}
