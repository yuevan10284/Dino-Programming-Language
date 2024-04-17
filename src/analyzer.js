import * as core from "./core.js";

// Dino has static nested scopes.

// const FLOAT = core.Type.FLOAT;
// const INT = core.Type.INT;
// const BOOLEAN = core.Type.BOOLEAN;
// const STRING = core.Type.STRING;
// const VOID = core.Type.VOID;
// const ANY = core.Type.ANY;

function check(condition, message, node) {
  if (!condition) {
    throw new Error(`${message}`);
  }
}

class Context {
  constructor(parent = null) {
    this.parent = parent;
    this.inLoop = false;
    this.locals = new Map();
    this.function = null;
  }

  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
  get(name, expectedType, node) {
    let entity;
    for (let context = this; context; context = context.parent) {
      entity = context.locals.get(name);
      if (entity) break;
    }
    check(entity, `${name} not been declared`, node);
    check(
      entity.constructor === expectedType,
      `${name} was expected type ${expectedType.name}`,
      node
    );
    return entity;
  }
}

function mustHaveNumericOrStringType(e, at) {
  check([INT, FLOAT, STRING].includes(e.type), "Expected num or str", at);
}
function mustHaveNumericType(e, at) {
  check([INT, FLOAT].includes(e.type), "Expected a num", at);
}

function mustHaveBooleanType(e, at) {
  check(e.type === BOOLEAN, "Expected bool", at);
}
function mustHaveIntegerType(e, at) {
  check(e.type === INT, "Expected int", at);
}
function mustBeTheSameType(e1, e2, at) {
  check(equivalent(e1.type, e2.type), "Operands do not have same type", at);
}
function equivalent(t1, t2) {
  return (
    t1 === t2 ||
    (t1 instanceof core.OptionalType &&
      t2 instanceof core.OptionalType &&
      equivalent(t1.baseType, t2.baseType)) ||
    (t1 instanceof core.ArrayType &&
      t2 instanceof core.ArrayType &&
      equivalent(t1.baseType, t2.baseType)) ||
    (t1.constructor === core.FunctionType &&
      t2.constructor === core.FunctionType &&
      equivalent(t1.returnType, t2.returnType) &&
      t1.paramTypes.length === t2.paramTypes.length &&
      t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
  );
}
function mustNotBeReadOnly(e, at) {
  check(!e.readOnly, `Cannot assign to constant ${e.name}`, at);
}
function mustBeInLoop(context, at) {
  check(context.inLoop, "Break can only appear in loop", at);
}

function mustNotAlreadyBeDeclared(context, name, at) {
  //clarify if this..
  check(!context.lookup(name), `Identifier ${name} already declared`, at);
}
function mustBeInAFunction(context, at) {
  check(context.function, "Return can only appear in a function", at);
}

export default function analyze(match) {
  let context = new Context();

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(body) {
      return new core.program(body.children.map((s) => s.rep()));
    },
    Statement_vardec(modifier, id, _eq, initializer) {
      //VARIABLE DECLARATION
      const e = initializer.rep();
      const readOnly = modifier.sourceString === "dinoconst";
      const v = new core.Variable(id.sourceString, readOnly, e.type); //read

      mustNotAlreadyBeDeclared(context, id.sourceString, { at: id }); //not dec
      context.add(id.sourceString, v);
      return new core.VariableDeclaration(v, e);
    },
    Statement_fundec(_fun, id, _open, params, _close, body) {
      //FUNCTION DECLARATION: not sure if completely works atm. I don't think allows for recurs
      params = params.asIteration().children;
      const fun = new core.Function(id.sourceString, params.length, true);
      context.add(id.sourceString, fun, id);
      context = new Context(context);
      context.function = fun;
      const paramsRep = params.map((p) => {
        let variable = new core.Variable(p.sourceString, true);
        context.add(p.sourceString, variable, p);
        return variable;
      });
      const bodyRep = body.rep();
      context = context.parent;
      return new core.FunctionDeclaration(fun, paramsRep, bodyRep);
    },
    Statement_assign(id, _eq, expression) {
      //assign if not read only.
      const source = expression.rep();
      const target = id.rep();
      mustNotBeReadOnly(target);
      return new core.Assignment(target, source);
    },
    Statement_print(_print, argument) {
      //simple print
      return new core.printStatement(argument.rep());
    },
    Statement_return(_return, argument) {
      //RETURN: remember our return is "hatch", check that must be in a function.
      const e = argument.rep();
      const readOnly = _return.sourceString === "hatch";
      context.add(_return.sourceString, readOnly);
      mustBeInAFunction(context, readOnly);
      return new core.ReturnStatement(readOnly, e);
    },
    Statement_shortreturn(_return) {
      const readOnly = _return.sourceString === "hatch";
      context.add(_return.sourceString, readOnly);
      mustBeInAFunction(context);
      return new core.ShortReturnStatement(readOnly);
    },
    Statement_break(_break) {
      //readOnly line is not working for break.
      mustBeInLoop(context);
      return new core.BreakStatement();
    },
    IfStmt_long(_if, test, consequent, _else, alternate) {
      //IF, ELSE IF
      const testRep = test.rep();
      mustHaveBooleanType(testRep);
      const consequentRep = consequent.rep();
      const alternateRep = alternate.rep();
      return new core.IfStatement(testRep, consequentRep, alternateRep);
    },
    IfStmt_short(_if, test, consequent) {
      //short if statement, similar code. May need to touch up these ifs.
      const testRep = test.rep();
      mustHaveBooleanType(testRep, test);
      const consequentRep = consequent.rep();
      return new core.ShortIfStatement(testRep, consequentRep);
    },
    IfStmt_elsif(_if, test, consequent, _else, alternate) {
      //no new context.
      const testRep = test.rep();
      mustHaveBooleanType(testRep);
      const consequentRep = consequent.rep();
      const alternateRep = alternate.rep();
      return new core.IfStatement(testRep, consequentRep, alternateRep);
    },
    LoopStmt_while(_while, exp, block) {
      //WHILE, similar to carlos but different.
      const test = exp.rep();
      const body = block.rep();
      mustHaveBooleanType(test);
      context = new Context();
      context.inLoop = true;
      context = context.parent;
      return new core.WhileStatement(test, body);
    },
    /*
    LoopStmt_repeat(_repeat, count, body) { 
      const co = count.rep()
      mustHaveIntegerType(co)
      const bod = body.rep()
      return new core.RepeatStatement(co, bod)
    },
    */
    LoopStmt_range(_for, id, _in, low, op, high, body) {
      // from carlos.
      const [x, y] = [low.rep(), high.rep()];
      mustHaveIntegerType(x);
      mustHaveIntegerType(y);
      const iterator = new core.Variable(id.sourceString, true);
      context.add(id.sourceString, iterator);
      const b = body.rep();
      return new core.ForRangeStatement(iterator, x, op.rep(), y, b);
    },
    Block(_open, body, _close) {
      return body.rep();
    },
    Exp_unary(op, operand) {
      const [o, x] = [op.sourceString, operand.rep()];
      let type;
      if (o === "-") {
        mustHaveNumericType(x, { at: operand });
        type = x.type;
      } else if (o === "!") {
        mustHaveBooleanType(x, { at: operand });
        type = BOOLEAN;
      }
      return new core.UnaryExpression(o, x, type);
    },
    Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
      const x = test.rep();
      mustHaveBooleanType(x);
      const [y, z] = [consequent.rep(), alternate.rep()];
      mustBeTheSameType(y, z);
      return new core.Conditional(x, y, z);
    },
    Exp1_binary(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep(), right.rep()];
      mustHaveBooleanType(x);
      mustHaveBooleanType(y);
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },
    Exp2_binary(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep(), right.rep()];
      mustHaveBooleanType(x);
      mustHaveBooleanType(y);
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },
    Exp3_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      if (["<", "<=", ">", ">="].includes(op.sourceString))
        mustHaveNumericOrStringType(x);
      mustBeTheSameType(x, y);
      return new core.BinaryExpression(o, x, y, BOOLEAN);
    },
    Exp4_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      if (o === "+") {
        mustHaveNumericOrStringType(x);
      } else {
        mustHaveNumericType(x);
      }
      mustBeTheSameType(x, y);
      return new core.BinaryExpression(o, x, y, x.type);
    },
    Exp5_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      mustHaveNumericType(x);
      mustBeTheSameType(x, y);
      return new core.BinaryExpression(o, x, y, x.type);
    },
    Exp6_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      mustHaveNumericType(x);
      mustBeTheSameType(x, y);
      return new core.BinaryExpression(o, x, y, x.type);
    },
    Exp7_parens(_open, expression, _close) {
      return expression.rep();
    },
    Call(callee, left, args, _right) {
      const fun = context.get(callee.sourceString, core.Function, callee);
      const argsRep = args.asIteration().rep();
      check(
        argsRep.length === fun.paramCount,
        `Expected ${fun.paramCount} args, found ${argsRep.length}`,
        left
      );
      return new core.Call(fun, argsRep);
    },
    id(_first, _rest) {
      return context.get(this.sourceString, core.Variable, this);
    },
    true(_) {
      return true;
    },
    false(_) {
      return false;
    },
    floatlit(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },
    num(_digits) {
      return BigInt(this.sourceString);
    },
    /*
    _terminal() {
      return this.sourceString
    },
    */
    _iter(...children) {
      return children.map((child) => child.rep());
    },
    strlit(_open, chars, _close) {
      return chars.sourceString;
    },
  });

  // for (const [name, entity] of Object.entries(core.standardLibrary)) {
  //   context.locals.set(name, entity);
  // }
  return builder(match).rep();
}
