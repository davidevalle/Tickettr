import test from 'node:test';
import assert from 'node:assert/strict';

function transitionStatus(current, action) {
  if (action === 'CLOSE') return 'CLOSED';
  if (action === 'REOPEN') return 'OPEN';
  if (action === 'CLAIM' && current === 'OPEN') return 'CLAIMED';
  if (action === 'UNCLAIM' && current === 'CLAIMED') return 'OPEN';
  return current;
}

test('claims open ticket', () => {
  assert.equal(transitionStatus('OPEN', 'CLAIM'), 'CLAIMED');
});

test('unclaims claimed ticket', () => {
  assert.equal(transitionStatus('CLAIMED', 'UNCLAIM'), 'OPEN');
});
