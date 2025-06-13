export class DateHelper {
  /**
   * Create expiration date after a number of days.
   * @param days Numbers day.
   */
  static addDays(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
