const { types, validate, createValidator } = require('../');

test('{ string: \'Hello\' } is valid against { string: types.string }', () => {
  expect(validate({ string: types.string }, { string: 'Hello' })).toBe(true);
});

test('{ num: 5 } is valid against { num: types.number }', () => {
  expect(validate({ num: types.number }, { num: 5 })).toBe(true);
});

test('{ string: 5 } is invalid against { string: types.string }', () => {
  expect(validate({ string: types.string }, { string: 5 })).toBe(false);
});

test('{ string: \'Hello\' } is valid against { string: types.string.isRequired }', () => {
  expect(validate({ string: types.string.isRequired })).toBe(false);
});

test('Empty object is invalid against { string: types.string.isRequired }', () => {
  expect(validate({ string: types.string.isRequired })).toBe(false);
});

test('{ array: [] } is valid against { array: types.array }', () => {
  expect(validate({ array: types.array }, { array: [] })).toBe(true);
});

test('{ boolean: false } is valid against { boolean: types.boolean }', () => {
  expect(validate({ boolean: types.boolean }, { boolean: false })).toBe(true);
});

test('{ boolean: false } is not a valid type model', () => {
  expect(validate({ boolean: false })).toBe(false);
});

test('{ func: () => {} } is valid against { func: types.function }', () => {
  expect(validate({ func: types.function }, { func: () => {} })).toBe(true);
});

test('{ func: () => {} } is not a valid type model', () => {
  const customValidator = createValidator(() => {}).isRequired;
  expect(validate({ func: customValidator })).toBe(false);
});

test('{ boolean: true, string: \'Hello\', number: 5 } is valid given a proper model', () => {
  const params = {
    boolean: true,
    string: 'Hello',
    number: 5,
  };
  const model = {
    boolean: types.boolean,
    string: types.string,
    number: types.number,
  };
  expect(validate(model, params)).toBe(true);
});

test('Optional and required params work within the same model and params', () => {
  const params = {
    boolean: true,
    string: 'Hello',
  };
  const model = {
    boolean: types.boolean.isRequired,
    string: types.string.isRequired,
    number: types.number,
  };
  expect(validate(model, params)).toBe(true);
});

test('Valid shapes work.', () => {
  const model = {
    boolean: types.boolean.isRequired,
    shape: types.shape({
      array: types.array.isRequired,
      nestedShape: types.shape({
        function: types.function.isRequired,
      }).isRequired,
    }).isRequired,
  };

  const params = {
    boolean: true,
    shape: {
      array: [],
      nestedShape: {
        function: () => {},
      },
    },
  };

  expect(validate(model, params)).toBe(true);
});

test('Invalid shapes work.', () => {
  const model = {
    boolean: types.boolean.isRequired,
    shape: types.shape({
      array: types.array.isRequired,
      missing: types.shape({}).isRequired,
      secondNestedShape: types.shape({
        boolean: types.boolean,
      }).isRequired,
    }).isRequired,
  };

  const params = {
    boolean: true,
    shape: {
      array: [],
      secondNestedShape: {},
    },
  };

  expect(validate(model, params)).toBe(false);
});

test('{ oneOf: \'foo\' } is valid against oneOf[\'foo\',\'bar\']', () => {
  expect(validate({ oneOf: types.oneOf(['foo', 'bar']).isRequired }, { oneOf: 'foo' })).toBe(true);
});

test('{ oneOf: \'baz\' } is invalid against oneOf[\'foo\',\'bar\']', () => {
  expect(validate({ oneOf: types.oneOf(['foo', 'bar']).isRequired }, { oneOf: 'baz' })).toBe(false);
});

test('{ oneOf: \'baz\' } is invalid against non-required oneOf[\'foo\',\'bar\']', () => {
  expect(validate({ oneOf: types.oneOf(['foo', 'bar']) }, { oneOf: 'baz' })).toBe(false);
});
