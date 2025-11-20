const { validate } = require("class-validator");
const { plainToInstance } = require("class-transformer");

async function validationPipe(dtoClass, req, res, next) {
  const dtoObj = plainToInstance(dtoClass, req.body);

  const errors = await validate(dtoObj);

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.map(err => ({
        field: err.property,
        constraints: err.constraints
      }))
    });
  }

  req.body = dtoObj; // validated & transformed
  next();
}

function createValidationMiddleware(dtoClass) {
  return (req, res, next) => validationPipe(dtoClass, req, res, next);
}

module.exports = createValidationMiddleware;
