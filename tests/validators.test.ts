import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  orderCreateSchema,
  contactSchema,
  passwordResetSubmitSchema,
} from '@/lib/validators';

describe('Zod Validation Schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const valid = {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: 'Password123!',
        phone: '9876543210',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const invalid = {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: '12345',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 8 characters');
      }
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        name: 'Aarav Sharma',
        email: 'not-an-email',
        password: 'StrongPassword1',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('orderCreateSchema', () => {
    it('rejects orders with empty items array', () => {
      const invalidOrder = {
        items: [],
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '9876543210',
          street: '12 Green Park',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
        },
        subtotal: 500,
        total: 500,
      };
      const result = orderCreateSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('rejects invalid pincodes (not 6 digits)', () => {
      const invalidOrder = {
        items: [
          {
            productId: 'prod-1',
            productName: 'Blue Tea',
            price: 499,
            quantity: 1,
          },
        ],
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '9876543210',
          street: '12 Green Park',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '1234', // invalid!
        },
        subtotal: 499,
        total: 499,
      };
      const result = orderCreateSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
    });

    it('accepts a fully valid order', () => {
      const validOrder = {
        items: [
          {
            productId: 'prod-1',
            productName: 'Blue Tea',
            price: 499,
            quantity: 1,
            weight: '30 Tea Bags',
          },
        ],
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '9876543210',
          street: '12 Green Park',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
          email: 'priya@example.com',
        },
        subtotal: 499,
        shippingFee: 70,
        tax: 25,
        total: 594,
      };
      const result = orderCreateSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });
  });

  describe('contactSchema', () => {
    it('rejects messages that exceed 2000 characters', () => {
      const result = contactSchema.safeParse({
        name: 'Tester',
        email: 'test@example.com',
        message: 'A'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid contact submission', () => {
      const result = contactSchema.safeParse({
        name: 'Tester',
        email: 'test@example.com',
        subject: 'Product question',
        message: 'Is the blue tea 100% caffeine free?',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('passwordResetSubmitSchema', () => {
    it('enforces 8 character minimum for reset passwords', () => {
      const result = passwordResetSubmitSchema.safeParse({
        token: 'valid-token',
        email: 'user@test.com',
        newPassword: 'short',
      });
      expect(result.success).toBe(false);
    });
  });
});
