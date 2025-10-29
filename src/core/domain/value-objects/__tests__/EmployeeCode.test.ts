import { describe, it, expect } from 'vitest';
import { EmployeeCode } from '../EmployeeCode';

describe('EmployeeCode Value Object', () => {
  describe('create', () => {
    it('should create valid employee code', () => {
      const code = EmployeeCode.create('EMP001');
      expect(code.value).toBe('EMP001');
    });

    it('should trim whitespace', () => {
      const code = EmployeeCode.create('  EMP001  ');
      expect(code.value).toBe('EMP001');
    });

    it('should throw error for empty code', () => {
      expect(() => EmployeeCode.create('')).toThrow('Employee code cannot be empty');
    });

    it('should throw error for whitespace-only code', () => {
      expect(() => EmployeeCode.create('   ')).toThrow('Employee code cannot be empty');
    });

    it('should throw error for code exceeding 50 characters', () => {
      const longCode = 'A'.repeat(51);
      expect(() => EmployeeCode.create(longCode)).toThrow('Employee code cannot exceed 50 characters');
    });

    it('should accept code with exactly 50 characters', () => {
      const code = 'A'.repeat(50);
      const employeeCode = EmployeeCode.create(code);
      expect(employeeCode.value).toBe(code);
    });
  });

  describe('equals', () => {
    it('should return true for equal codes', () => {
      const code1 = EmployeeCode.create('EMP001');
      const code2 = EmployeeCode.create('EMP001');
      expect(code1.equals(code2)).toBe(true);
    });

    it('should return false for different codes', () => {
      const code1 = EmployeeCode.create('EMP001');
      const code2 = EmployeeCode.create('EMP002');
      expect(code1.equals(code2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const code = EmployeeCode.create('EMP001');
      expect(code.toString()).toBe('EMP001');
    });
  });
});
