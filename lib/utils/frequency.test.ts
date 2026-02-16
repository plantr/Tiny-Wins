import { buildCustomFrequency, parseCustomFrequency, DAYS_LIST } from './frequency';

describe('DAYS_LIST', () => {
  it('has length 7', () => {
    expect(DAYS_LIST).toHaveLength(7);
  });

  it('starts with Mon and ends with Sun', () => {
    expect(DAYS_LIST[0]).toBe('Mon');
    expect(DAYS_LIST[6]).toBe('Sun');
  });
});

describe('buildCustomFrequency', () => {
  describe('daily patterns', () => {
    it('returns "Daily" for interval 1, period days', () => {
      expect(buildCustomFrequency('1', 'days', [])).toBe('Daily');
    });

    it('returns "Every N days" for interval > 1', () => {
      expect(buildCustomFrequency('3', 'days', [])).toBe('Every 3 days');
      expect(buildCustomFrequency('7', 'days', [])).toBe('Every 7 days');
    });
  });

  describe('weekly patterns without specific days', () => {
    it('returns "Weekly" for interval 1, period weeks, no days', () => {
      expect(buildCustomFrequency('1', 'weeks', [])).toBe('Weekly');
    });

    it('returns "Every N weeks" for interval > 1, no days', () => {
      expect(buildCustomFrequency('2', 'weeks', [])).toBe('Every 2 weeks');
      expect(buildCustomFrequency('4', 'weeks', [])).toBe('Every 4 weeks');
    });
  });

  describe('weekly patterns with specific days', () => {
    it('returns "Weekly on [days]" for interval 1 with days', () => {
      expect(buildCustomFrequency('1', 'weeks', ['Mon', 'Wed', 'Fri'])).toBe('Weekly on Mon, Wed, Fri');
    });

    it('returns "Every N weeks on [days]" for interval > 1 with days', () => {
      expect(buildCustomFrequency('2', 'weeks', ['Tue', 'Thu'])).toBe('Every 2 weeks on Tue, Thu');
      expect(buildCustomFrequency('3', 'weeks', ['Mon', 'Wed', 'Fri'])).toBe('Every 3 weeks on Mon, Wed, Fri');
    });

    it('sorts days in canonical order (DAYS_LIST order)', () => {
      expect(buildCustomFrequency('1', 'weeks', ['Fri', 'Mon', 'Wed'])).toBe('Weekly on Mon, Wed, Fri');
      expect(buildCustomFrequency('2', 'weeks', ['Sun', 'Tue', 'Thu', 'Mon'])).toBe('Every 2 weeks on Mon, Tue, Thu, Sun');
    });
  });

  describe('edge cases', () => {
    it('defaults to 1 for invalid interval', () => {
      expect(buildCustomFrequency('abc', 'days', [])).toBe('Daily');
      expect(buildCustomFrequency('', 'weeks', [])).toBe('Weekly');
    });

    it('handles zero interval as 1', () => {
      expect(buildCustomFrequency('0', 'days', [])).toBe('Daily');
    });
  });
});

describe('parseCustomFrequency', () => {
  describe('weekly with days patterns', () => {
    it('parses "Weekly on [days]"', () => {
      expect(parseCustomFrequency('Weekly on Mon, Wed, Fri')).toEqual({
        interval: '1',
        period: 'weeks',
        days: ['Mon', 'Wed', 'Fri'],
      });
    });

    it('parses "Every N weeks on [days]"', () => {
      expect(parseCustomFrequency('Every 2 weeks on Tue, Thu')).toEqual({
        interval: '2',
        period: 'weeks',
        days: ['Tue', 'Thu'],
      });

      expect(parseCustomFrequency('Every 3 weeks on Mon, Wed, Fri')).toEqual({
        interval: '3',
        period: 'weeks',
        days: ['Mon', 'Wed', 'Fri'],
      });
    });
  });

  describe('day patterns', () => {
    it('parses "Every N days"', () => {
      expect(parseCustomFrequency('Every 3 days')).toEqual({
        interval: '3',
        period: 'days',
        days: [],
      });

      expect(parseCustomFrequency('Every 7 days')).toEqual({
        interval: '7',
        period: 'days',
        days: [],
      });
    });
  });

  describe('week patterns without days', () => {
    it('parses "Every N weeks" (no days)', () => {
      expect(parseCustomFrequency('Every 2 weeks')).toEqual({
        interval: '2',
        period: 'weeks',
        days: [],
      });
    });
  });

  describe('edge cases', () => {
    it('returns default for "Daily" (not parsed by current implementation)', () => {
      expect(parseCustomFrequency('Daily')).toEqual({
        interval: '1',
        period: 'weeks',
        days: [],
      });
    });

    it('returns default for empty string', () => {
      expect(parseCustomFrequency('')).toEqual({
        interval: '1',
        period: 'weeks',
        days: [],
      });
    });

    it('returns default for unrecognized patterns', () => {
      expect(parseCustomFrequency('Random text')).toEqual({
        interval: '1',
        period: 'weeks',
        days: [],
      });
    });
  });
});

describe('round-trip consistency', () => {
  it('round-trips weekly with days', () => {
    const result1 = parseCustomFrequency(buildCustomFrequency('1', 'weeks', ['Mon', 'Wed']));
    expect(result1).toEqual({ interval: '1', period: 'weeks', days: ['Mon', 'Wed'] });

    const result2 = parseCustomFrequency(buildCustomFrequency('2', 'weeks', ['Tue', 'Thu']));
    expect(result2).toEqual({ interval: '2', period: 'weeks', days: ['Tue', 'Thu'] });
  });

  it('round-trips "Every N days"', () => {
    const result = parseCustomFrequency(buildCustomFrequency('3', 'days', []));
    expect(result).toEqual({ interval: '3', period: 'days', days: [] });
  });

  it('round-trips "Every N weeks" without days', () => {
    const result = parseCustomFrequency(buildCustomFrequency('2', 'weeks', []));
    expect(result).toEqual({ interval: '2', period: 'weeks', days: [] });
  });
});
