/**
 * Smoke tests for category inference (source label → keywords → Other).
 * Usage: node scripts/test-job-category-classifier.js
 */
const assert = require('assert');
const { inferJobCategory } = require('../src/utils/jobCategoryClassifier');

function check(name, input, expected) {
  const got = inferJobCategory(input);
  assert.strictEqual(got, expected, `${name}: expected ${expected}, got ${got}`);
}

check('canonical source', { sourceCategory: 'Engineering' }, 'Engineering');
check('alias source', { sourceCategory: 'IT' }, 'Engineering');
check('department source', { sourceCategory: 'Human Resources' }, 'Human Resources');
check(
  'title keywords',
  { title: 'Senior Frontend Developer', description: 'React team' },
  'Engineering'
);
check(
  'description keywords',
  { title: 'Hiring', description: 'Digital marketing specialist SEO' },
  'Marketing'
);
check('no match', { title: 'General vacancy', description: 'Apply now' }, 'Other');
check(
  'source beats title',
  {
    sourceCategory: 'Finance',
    title: 'Software Engineer',
    description: '',
  },
  'Finance'
);

console.log('jobCategoryClassifier: all checks passed');