import moment from "moment";
import Constants from "../config/constants.js";

class DateUtils {
  /**
   * Converts UTC date to a specific timezone and optionally formats it
   * @param {Date} date
   * @param {number} timeZone - offset in hours
   * @param {string|null} format - optional moment.js format
   * @returns {Date|string}
   */
  changeTimezoneFromUtc = (
    date,
    timeZone = Constants.TIME_ZONE,
    format = null
  ) => {
    const newDate = new Date(new Date(date).getTime() + 3600000 * timeZone);
    if (format) {
      return moment(newDate).utcOffset(0).format(format);
    }
    return newDate;
  };

  /**
   * Formats date+time with timezone offset for ISO-like strings
   * @param {string} date YYYY-MM-DD
   * @param {string} time HH:mm:ss
   * @param {number} tz timezone offset in hours
   */
  formattedTimeZone = (date, time, tz) => {
    let sign = tz < 0 ? "-" : "+";
    let totalMinutes = Math.abs(tz) * 60;
    let hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    let minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${date}T${time}${sign}${hours}${minutes}`;
  };

  /** Returns an array of previous `count` dates from a given date (or today if null) */
  getPrevDatesArrFromDate = (date = null, count = 1, timezone = 0) => {
    let curr = this.changeTimezoneFromUtc(
      date ? new Date(date) : new Date(),
      timezone
    );
    const dateArr = [];
    for (let i = 0; i < count; i++) {
      const temp = new Date(curr);
      temp.setDate(curr.getDate() - i);
      dateArr.push(moment(temp).format("YYYY-MM-DD"));
    }
    return dateArr.reverse();
  };

  /** Returns array of dates for the current week (Sunday-Saturday) in YYYY-MM-DD format */
  getWeeklyDates = (date = null, timezone = Constants.TIME_ZONE) => {
    let curr = this.changeTimezoneFromUtc(
      date ? new Date(date) : new Date(),
      timezone
    );
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - curr.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const temp = new Date(startOfWeek);
      temp.setDate(startOfWeek.getDate() + i);
      return moment(temp).format("YYYY-MM-DD");
    });
  };

  /** Get start and end datetime of a day in current timezone */
  getStartEndDates = (dT) => {
    const dateStr = this.changeTimezoneFromUtc(new Date(dT), 0, "YYYY-MM-DD");
    return {
      start: new Date(
        this.formattedTimeZone(dateStr, "00:00:00", Constants.TIME_ZONE)
      ),
      end: new Date(
        this.formattedTimeZone(dateStr, "23:59:59", Constants.TIME_ZONE)
      ),
    };
  };

  /**
   * Get start and end of current month
   */
  getMonthStartEnd(date = new Date(), timezone = Constants.TIME_ZONE) {
    const curr = this.changeTimezoneFromUtc(date, timezone, "YYYY-MM-DD");
    const start = new Date(
      this.formattedTimeZone(curr.split("T")[0], "00:00:00", timezone)
    );
    const end = new Date(
      this.formattedTimeZone(curr.split("T")[0], "23:59:59", timezone)
    );
    return { start, end };
  }

  /** Compare two dates (one in YYYY/MM/DD, another in DD/MM/YYYY format) */
  compareDate = (dateString1, dateString2) => {
    const dateObject1 = new Date(dateString1);
    const dateObject2 = (() => {
      const [day, month, year] = dateString2.split("/");
      return new Date(year, month - 1, day);
    })();
    return dateObject1 > dateObject2;
  };

  /** Returns difference in minutes between two Date objects */
  dateDiffInMinutes = (dt2, dt1) => Math.abs(Math.round((dt2 - dt1) / 60000));

  /** Returns difference in hours between two Date objects */
  diffInHours = (dt1, dt2) =>
    parseFloat((Math.abs(new Date(dt1) - new Date(dt2)) / 36e5).toFixed(2));

  /** Difference in minutes between two dates (alternative) */
  twoDatesDiff(start, end) {
    return Math.floor(Math.abs(new Date(end) - new Date(start)) / 60000);
  }

  /** Days difference between two dates */
  dateDaysDiff(date1, date2) {
    return Math.ceil(
      Math.abs(new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24)
    );
  }

  /** Round minutes to nearest 15/30/45/60 */
  getNearMinutes(minutes) {
    if (minutes === 0) return 0;
    if (minutes < 15) return 15;
    if (minutes < 30) return 30;
    if (minutes < 45) return 45;
    return 60;
  }

  /**
   * Check if a date is before another date
   */
  isDateLess(mainDate, refDate) {
    return new Date(mainDate) < new Date(refDate);
  }

  // Formatting Helpers

  /** Convert HH:mm to total minutes */
  getMinutesFromTime(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  /** Converts minutes to human-readable hours/minutes string */
  timeFromMinutes(duration) {
    if (duration >= 60) {
      const rhours = Math.floor(duration / 60);
      const rminutes = duration % 60;
      return rminutes === 0 ? `${rhours} hrs` : `${rhours}:${rminutes} hrs`;
    }
    return `${duration} min`;
  }

  /** Convert month number (MM/YYYY) to abbreviated string (e.g., "Jan-2024") */
  changeMonthNumbertoString = (inputDate) => {
    const [month, year] = inputDate.split("/").map(Number);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[month - 1]}-${year}`.toLowerCase();
  };

  /** Returns a human-readable "posted ago" string */
  postedAgo(createdAt, addText = "") {
    const diffMinutes = Math.round(
      Math.abs(new Date() - new Date(createdAt)) / 60000
    );
    if (diffMinutes < 1) return "Just Now";
    if (diffMinutes < 60) return `${diffMinutes} Mins ${addText}`;
    const hours = Math.round(diffMinutes / 60);
    if (hours < 24)
      return `${hours} ${hours < 2 ? "Hour" : "Hours"} ${addText}`;
    const days = Math.ceil(hours / 24);
    return `${days} ${days < 2 ? "Day" : "Days"} ${addText}`;
  }

  /** Uses moment.js for human-friendly "posted ago" string */
  postedAgoMoment(createdAt) {
    return moment(createdAt).fromNow();
  }

  /** Returns financial year string for a given date */
  getFinancialYear(date, timeZone = Constants.TIME_ZONE) {
    const newDate = this.changeTimezoneFromUtc(date, timeZone);
    return newDate.getMonth() + 1 <= 3
      ? `${newDate.getFullYear() - 1}-${newDate.getFullYear()}`
      : `${newDate.getFullYear()}-${newDate.getFullYear() + 1}`;
  }

  /** Calculate months difference between two dates */
  calculateMonths = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  };

  /** Get retirement date from DOB */
  getRetiringDate = (dobPr) => {
    const dob = new Date(dobPr);
    dob.setFullYear(dob.getFullYear() + Constants.DEFAULT_RETIRING_AGE);
    dob.setMonth(dob.getMonth() + 1, 0);
    return dob;
  };
}

export default new DateUtils();
