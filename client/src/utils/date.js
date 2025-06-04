import moment from "moment/moment";

export const firstDayOfTheMonth = moment()
  .startOf("month")
  .format("YYYY-MM-DD");
export const lastDayOfTheMonth = moment().endOf("month").format("YYYY-MM-DD");
