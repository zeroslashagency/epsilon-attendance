/**
 * Value Object: DateRange
 * Represents a range of dates
 * Immutable and self-validating
 */
export class DateRange {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date
  ) {}

  static create(startDate: Date, endDate: Date): DateRange {
    if (endDate < startDate) {
      throw new Error('End date must be after start date');
    }

    return new DateRange(startDate, endDate);
  }

  static today(): DateRange {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return new DateRange(today, endOfDay);
  }

  static lastNDays(days: number): DateRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return new DateRange(start, end);
  }

  static currentMonth(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return new DateRange(start, end);
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  getDurationInDays(): number {
    const diffMs = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }
}
