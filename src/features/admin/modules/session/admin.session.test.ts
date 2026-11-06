import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchesDemoCredentials } from './admin.session.ts';

/** Checks successful login and email normalization. No inputs. @returns Nothing. */
function acceptsDemoLogin(): void {
  assert.equal(matchesDemoCredentials('admin@shopboard.demo', 'Admin123!'), true);
  assert.equal(matchesDemoCredentials(' ADMIN@SHOPBOARD.DEMO ', 'Admin123!'), true);
}
test('accepts demo credentials and normalizes email only', acceptsDemoLogin);

/** Checks incorrect, blank, and altered passwords. No inputs. @returns Nothing. */
function rejectsInvalidLogin(): void {
  assert.equal(matchesDemoCredentials('user@shopboard.demo', 'Admin123!'), false);
  assert.equal(matchesDemoCredentials('admin@shopboard.demo', 'admin123!'), false);
  assert.equal(matchesDemoCredentials('admin@shopboard.demo', ' Admin123! '), false);
  assert.equal(matchesDemoCredentials('', ''), false);
}
test('rejects invalid demo credentials', rejectsInvalidLogin);
