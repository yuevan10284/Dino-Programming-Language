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
    = "-" ExpExp  -- neg
    | ExpExp
  ExpExp
    = PriExp "^" UnaryExp  -- power
    | PriExp
  PriExp
    = "(" Exp ")"  -- paren
    | number
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
  PriExp_paren(_, e, __) {
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

// Test "-2**2"
const result = evaluateExpression('-2^2');
console.log(result);  // Output should be -4
