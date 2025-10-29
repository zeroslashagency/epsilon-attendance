/**
 * Entity: PunchLog
 * Represents a single punch (in/out/break) event
 */
export class PunchLog {
  constructor(
    private readonly _time: Date,
    private readonly _direction: 'in' | 'out' | 'break',
    private readonly _deviceId: string,
    private readonly _confidence: 'high' | 'medium' | 'low',
    private readonly _inferred: boolean = false
  ) {}

  get time(): Date {
    return this._time;
  }

  get direction(): 'in' | 'out' | 'break' {
    return this._direction;
  }

  get deviceId(): string {
    return this._deviceId;
  }

  get confidence(): 'high' | 'medium' | 'low' {
    return this._confidence;
  }

  get inferred(): boolean {
    return this._inferred;
  }

  getTimeFormatted(): string {
    return this._time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  isReliable(): boolean {
    return this._confidence === 'high' && !this._inferred;
  }
}
