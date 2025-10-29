/**
 * Entity: WorkInterval
 * Represents a continuous work or break period
 */
export class WorkInterval {
  constructor(
    private readonly _checkIn: Date,
    private readonly _checkOut: Date,
    private readonly _type: 'work' | 'break'
  ) {
    if (_checkOut <= _checkIn) {
      throw new Error('Check-out time must be after check-in time');
    }
  }

  get checkIn(): Date {
    return this._checkIn;
  }

  get checkOut(): Date {
    return this._checkOut;
  }

  get type(): 'work' | 'break' {
    return this._type;
  }

  getDurationInHours(): number {
    const diffMs = this._checkOut.getTime() - this._checkIn.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  getDurationFormatted(): string {
    const totalHours = this.getDurationInHours();
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  isWorkInterval(): boolean {
    return this._type === 'work';
  }

  isBreakInterval(): boolean {
    return this._type === 'break';
  }
}
