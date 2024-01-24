import * as ohm from 'ohm-js';

const arithmeticGrammar = ohm.grammar(`Arithmetic {
  Exp = AddExp
  AddExp
    = AddExp "+" MulExp  -- plus
    | AddExp "-" MulExp  -- minus
    | MulExp
  MulExp
    = MulExp "*" UnaryExp  -- times
    | MulExp "/" UnaryExp  -- divide
    | UnaryExp
  UnaryExp
    = NegativeExp
    | ExpExp
  NegativeExp
    = "-" "(" Exp ")"  -- negParen
    | "-" number       -- negNumber
  ExpExp
    = Primary "^" ExpExp  -- power
    | Primary
  Primary
    = number
    | "(" Exp ")"  -- paren
  number
    = digit+  -- whole
}`);

const arithmeticSemantics = arithmeticGrammar.createSemantics().addOperation('eval', {
  Exp(e) {
    return e.eval();
  },
  AddExp_plus(a, _, b) {
    return a.eval() + b.eval();
  },
  AddExp_minus(a, _, b) {
    return a.eval() - b.eval();
  },
  MulExp_times(a, _, b) {
    return a.eval() * b.eval();
  },
  MulExp_divide(a, _, b) {
    return a.eval() / b.eval();
  },
  UnaryExp_neg(_, e) {
    return -e.eval();
  },
  ExpExp_power(a, _, b) {
    return Math.pow(a.eval(), b.eval());
  },
  Primary_paren(_, e, __) {
    return e.eval();
  },
  number(n) {
    return parseInt(n.sourceString, 10);
  }
});

function evaluateExpression(expr) {
  const match = arithmeticGrammar.match(expr);
  if (match.succeeded()) {
    return arithmeticSemantics(match).eval();
  } else {
    throw new Error('Invalid expression: ' + match.message);
  }
}

// test cases
try {
  console.log(evaluateExpression('-2^2'));  // Should throw a syntax error
} catch (e) {
  console.log(e.message); 
}
console.log(evaluateExpression('(-2)^2')); // Output should be 4
console.log(evaluateExpression('-(2^2)')); // Output should be -4
