const { expect } = require('chai');

const index = require('./index');

describe('module <%- @projectName %> : Index', () => {
  it('should have a function handler', () => {
    expect(typeof index.handler).to.equal('function');
  });
});
