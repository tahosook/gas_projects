import { getYesterday } from '../main';
import { describe, expect, test } from 'vitest';
test('adds 1 + 2 to equal 3', () => {
    expect(getYesterday()).toBe('2025-05-22');
    });