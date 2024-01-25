import * as ohm from 'ohm-js';

const arithmeticGrammar = ohm.grammar(`Arithmetic {
  Exp = Term
  Term
    = Term "+" Factor  -- plus
    | Term "-" Factor  -- minus
    | Factor
  Factor
    = Factor "*" Primary  -- times
    | Factor "/" Primary  -- divide
    | Primary
  Primary
    = "-" Primary  -- neg
    | Power
  Power
    = Base "^" Primary  -- power
    | Base
  Base
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
  Factor_times(a, _, b) {
    return a.eval() * b.eval();
  },
  Factor_divide(a, _, b) {
    return a.eval() / b.eval();
  },
  Primary_neg(_, e) {
    return -e.eval();
  },
  Power_power(a, _, b) {
    return Math.pow(a.eval(), b.eval());
  },
  Base_paren(_, e, __) {
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
const result = evaluateExpression('-2^2');
console.log(result);  // Output should be -4
