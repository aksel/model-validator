const validate = (model, params = {}) => {
  const paramNames = Object.keys(model);

  const invalid = paramNames.map((paramName) => {
    const validator = model[paramName];

    if (typeof validator !== 'function') {
      return new Error(`Type validator for param ${paramName} is not a function`);
    }

    const isInvalid = validator(params, paramName);
    if (typeof isInvalid === 'undefined') {
      return new Error(`
      Validator for \`${paramName}\` returned undefined.
      Validators must return null, false, an error, or a truthy value.`);
    }

    return isInvalid;
  }).filter(Boolean);

  return invalid.length === 0;
};

/* eslint-disable no-use-before-define */
function createValidator(isValid) {
  function checkType(isRequired, params, paramName) {
    const param = params[paramName];
    if (!param) {
      if (isRequired) {
        return new Error(`Required param \`${paramName}\` missing`);
      }
      return null;
    }
    if (!isValid(params[paramName], params)) {
      return new Error(`Param \`${paramName}\` received incorrect type.`);
    }
    return null;
  }

  return chain(checkType);
}

function createShapeValidator(model) {
  function checkTypes(isRequired, params, paramName) {
    const shape = params[paramName];
    const type = typeof shape;

    if (type === 'undefined') {
      if (isRequired) {
        return new Error(`Required param \`${paramName}\` missing`);
      }
      return null;
    }

    if (type !== 'object') {
      return new Error(`Shape param \`${paramName}\` expects \`object\`, but got \`${type}\``);
    }

    return !validate(model, shape);
  }

  return chain(checkTypes);
}

function createOneOfValidator(array) {
  if (!Array.isArray(array)) {
    throw new Error(`OneOf validator expects \`array\`, but got \`${typeof array}\``);
  }
  function checkTypes(isRequired, params, paramName) {
    const param = params[paramName];

    if (typeof param === 'undefined') {
      if (isRequired) {
        return new Error(`Required param \`${paramName}\` missing`);
      }
      return null;
    }

    return !array.some(acceptable => param === acceptable);
  }

  return chain(checkTypes);
}

function chain(func) {
  const chained = func.bind(null, false);
  chained.isRequired = func.bind(null, true);
  return chained;
}

const types = {
  string: createValidator(p => typeof p === 'string'),
  number: createValidator(p => typeof p === 'number'),
  array: createValidator(Array.isArray),
  boolean: createValidator(p => typeof p === 'boolean'),
  function: createValidator(p => typeof p === 'function'),
  shape: createShapeValidator,
  oneOf: createOneOfValidator,
};

module.exports = {
  types,
  createValidator,
  validate,
};
