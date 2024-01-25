import * as ohm from 'ohm-js';

const arithmeticGrammar = ohm.grammar(`Arithmetic {
  Exp = Term
  Term
    = Term "+" Factor  -- plus
    | Term "-" Factor  -- minus
    | Factor
  Factor
    = Primary "^" Factor  -- power
    | UnaryExp
  UnaryExp
    = "-" Primary  -- neg
    | Primary
  Primary
    = "(" Exp ")"  -- paren
    | number
  number
    = digit+  -- whole
}`);

const arithmeticSemantics = arithmeticGrammar.createSemantics().addOperation('eval', {
  Exp(e) {
    return e.eval();
  },
  Term_plus(a, _, b) {
    return a.eval() + b.eval();
  },
  Term_minus(a, _, b) {
    return a.eval() - b.eval();
  },
  Factor_power(a, _, b) {
    return Math.pow(a.eval(), b.eval());
  },
  UnaryExp_neg(_, e) {
    return -e.eval();
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

// Test "-2^2"
const result = evaluateExpression('(-2)^2');
console.log(result);  // Output should be -4
