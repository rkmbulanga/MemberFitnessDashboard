import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, type DataStore } from '../stores/dataStore.js';
import { recordCheckIn } from '../services/checkInService.js';
import { bookClass } from '../services/classService.js';
import { AppError } from '../services/errors.js';

describe('validation edge cases', () => {
  let s: DataStore;

  beforeEach(() => {
    s = createStore();
  });

  it('prevents duplicate check-ins within 1 hour (409)', () => {
    recordCheckIn(s, 'm-3', 'gym-1');
    try {
      recordCheckIn(s, 'm-3', 'gym-1');
      expect.unreachable('second check-in should throw');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(409);
    }
  });

  it('rejects booking a full class (409)', () => {
    try {
      bookClass(s, 'c-8', 'm-2');
      expect.unreachable('full class booking should throw');
    } catch (err) {
      expect((err as AppError).statusCode).toBe(409);
    }
  });

  it('rejects a double booking of the same class (409)', () => {
    try {
      bookClass(s, 'c-2', 'm-1');
      expect.unreachable('double booking should throw');
    } catch (err) {
      expect((err as AppError).statusCode).toBe(409);
    }
  });
});
