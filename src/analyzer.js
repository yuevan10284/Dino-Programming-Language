import * as core from "./core.js";

// dino is dynamic. Need to add loops.

class Context {
  constructor({ parent, locals = {}, fun = null }) {
    this.parent = parent;
    this.function = fun;
    this.locals = new Map(Object.entries(locals));
  }
  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  static root() {
    return new Context({
      locals: new Map(Object.entries(core.standardLibrary)),
    });
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map(), fun: this.function });
  }
}

export default function analyze(match) {
  let context = new Context({ locals: core.standardLibrary });

  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage();
      throw new Error(`${prefix}${message}`);
    }
  }

  // function mustHaveBooleanType(e, at) {
  //   check(e.type === BOOLEAN, "Expected a boolean", at);
  // }
  // function mustHaveIntegerType(e, at) {
  //   check(e.type === INT, "Expected an integer", at);
  // }
  // function mustBeTheSameType(e1, e2, at) {
  //   check(
  //     equivalent(e1.type, e2.type),
  //     "Operands do not have the same type",
  //     at
  //   );
  // }
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

  function assignable(fromType, toType) {
    return (
      toType == ANY ||
      equivalent(fromType, toType) ||
      (fromType?.kind === "FunctionType" &&
        toType?.kind === "FunctionType" &&
        // covariant in return types
        assignable(fromType.returnType, toType.returnType) &&
        fromType.paramTypes.length === toType.paramTypes.length &&
        // contravariant in parameter types
        toType.paramTypes.every((t, i) => assignable(t, fromType.paramTypes[i])))
    )
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(e.type)} to a ${typeDescription(
      type
    )}`
    must(assignable(e.type, type), message, at)
  }

  function mustNotBeReadOnly(e, at) {
    must(!e.readOnly, `Cannot assign to constant ${e.name}`, at)
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(!context.locals.has(name), `Identifier ${name} already declared`, at);
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at);
  }

  function mustBeAVariable(entity, at) {
    must(entity?.kind === "Variable", `Functions can not appear here`, at);
  }

  function mustBeAFunction(entity, at) {
    must(entity?.kind === "Function", `${entity.name} is not a function`, at);
  }

  function mustNotBeReadOnly(entity, at) {
    must(!entity.readOnly, `${entity.name} is read only`, at);
  }

  function mustBeInLoop(at) {
    must(context.inLoop, "Break can only appear in a loop", at);
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear in a function", at);
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const equalCount = argCount === paramCount;
    must(
      equalCount,
      `${paramCount} argument(s) required but ${argCount} passed`,
      at
    );
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map((s) => s.rep()));
    },

    Statement_vardec(isLet, id, _eq, exp) {
      const initializer = exp.rep();
      let variable
      //checking let vs const

      if (isLet.sourceString === "dinoconst"){
        variable = core.variable(id.sourceString, true);
      } else {
        variable = core.variable(id.sourceString, false);
      }
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return core.variableDeclaration(variable, initializer);
    },

    Statement_fundec(_fun, id, parameters, exp) {
      const fun = core.fun(id.sourceString);
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, fun);

      context = new Context({ parent: context, fun });
      const params = parameters.rep();
      fun.paramCount = params.length;
      const body = exp.rep();
      context = context.parent;
      return core.functionDeclaration(fun, params, body);
    },

    Params(_open, idList, _close) {
      return idList.asIteration().children.map((id) => {
        const param = core.variable(id.sourceString, true);
        mustNotAlreadyBeDeclared(id.sourceString, { at: id });
        context.add(id.sourceString, param);
        return param;
      });
    },

    Statement_assign(id, _eq, exp) {
      const target = id.rep();
      const source = exp.rep();
      mustNotBeReadOnly(target, { at: id });
      return core.assignment(target, source);
    },

    // Statement_call(call) {
    //     return call.rep()
    // },

    Statement_break(breakKeyword) {
      mustBeInLoop({ at: breakKeyword });
      return core.breakStatement;
    },

    Statement_return(returnKeyword, exp) {
      mustBeInAFunction({ at: returnKeyword });
      const returnExpression = exp.rep();
      return core.returnStatement(returnExpression);
    },

    Statement_shortreturn(returnKeyword) {
      mustBeInAFunction({ at: returnKeyword });
      return core.shortReturnStatement();
    },

    IfStmt_long(_if, exp, block1, _else, block2) {
      const test = exp.rep();

      context = context.newChildContext();
      const consequent = block1.rep();
      context = context.parent;
      context = context.newChildContext();
      const alternate = block2.rep();
      context = context.parent;
      return core.ifStatement(test, consequent, alternate);
    },

    IfStmt_elsif(_if, exp, block, _else, trailingIfStatement) {
      const test = exp.rep();

      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      const alternate = trailingIfStatement.rep();
      return core.ifStatement(test, consequent, alternate);
    },

    IfStmt_short(_if, exp, block) {
      const test = exp.rep();

      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.shortIfStatement(test, consequent);
    },

    LoopStmt_while(_while, exp, block) {
      const test = exp.rep();

      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.whileStatement(test, body);
    },


    LoopStmt_range(_for, id, _in, exp1, op, exp2, block) {
      const [low, high] = [exp1.rep(), exp2.rep()];

      const iterator = core.variable(id.sourceString, true);
      context = context.newChildContext({ inLoop: true });
      context.add(id.sourceString, iterator);
      const body = block.rep();
      context = context.parent;
      return core.forRangeStatement(iterator, low, op.sourceString, high, body);
    },

    Statement_print(_print, exp) {
      return core.printStatement(exp.rep());
    },

    // Statement_while(_while, exp, block) {
    //   return core.whileStatement(exp.rep(), block.rep())
    // },

    Block(_open, statements, _close) {
      return statements.children.map((s) => s.rep());
    },

    /* //would like to add
    Exp_conditional(exp, _questionMark, exp1, colon, exp2) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      const [consequent, alternate] = [exp1.rep(), exp2.rep()]
      mustBothHaveTheSameType(consequent, alternate, { at: colon })
      return core.conditional(test, consequent, alternate, consequent.type)
    },

    Exp2_or(exp, _ops, exps) {
      let left = exp.rep()
      mustHaveBooleanType(left, { at: exp })
      for (let e of exps.children) {
        let right = e.rep()
        mustHaveBooleanType(right, { at: e })
        left = core.binary("||", left, right, BOOLEAN)
      }
      return left
    },

    Exp2_and(exp, _ops, exps) {
      let left = exp.rep()
      mustHaveBooleanType(left, { at: exp })
      for (let e of exps.children) {
        let right = e.rep()
        mustHaveBooleanType(right, { at: e })
        left = core.binary("&&", left, right, BOOLEAN)
      }
      return left
    },
    */

    //This is still the most confusing part of the class since we down-graded to dynamic how to change this... :( i cry
    Exp_unary(op, exp) {
      const [o, x] = [op.sourceString, exp.rep()];
      let type;
      if (o === "-") {

        type = x.type;
      } else if (o === "!") {

        type = BOOLEAN;
      }
      return new core.unary(o, x, type);
    },
    Exp_ternary(test, _questionMark, exp1, _colon, exp2) {
      const x = test.rep();

      const [y, z] = [exp1.rep(), exp2.rep()];

      return new core.conditional(x, y, z);
    },
    Exp1_binary(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep(), right.rep()];

      return new core.binary(o, x, y, BOOLEAN);
    },
    Exp2_binary(left, op, right) {
      let [x, o, y] = [left.rep(), op.rep(), right.rep()];

      return new core.binary(o, x, y, BOOLEAN);
    },
    Exp3_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];
      if (["<", "<=", ">", ">="].includes(op.sourceString))

      return new core.binary(o, x, y, BOOLEAN);
    },
    Exp4_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];

      return new core.binary(o, x, y, x.type);
    },
    Exp5_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];

      return new core.binary(o, x, y, x.type);
    },
    Exp6_binary(left, op, right) {
      const [x, o, y] = [left.rep(), op.sourceString, right.rep()];

      return new core.binary(o, x, y, x.type);
    },
    Exp7_parens(_open, expression, _close) {
      return expression.rep();
    },
    //Call
    // Exp7_call(id, _open, expList, _close) {
    //   const callee = context.lookup(id.sourceString)
    //   mustHaveBeenFound(callee, id.sourceString, { at: id })
    //   mustBeAFunction(callee, { at: id })
    //   const args = expList.asIteration().children.map(arg => arg.rep())
    //   mustHaveCorrectArgumentCount(args.length, callee.paramCount, { at: id })
    //   return core.call(callee, args)
    // },
    Exp7_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      mustBeAVariable(entity, { at: id });
      return entity;
    },

    true(_) {
      return true;
    },

    false(_) {
      return false;
    },

    id(_letter, _idchar) {
      return this.sourceString;
    },

    // intlit(_digits) {
    //     return BigInt(this.sourceString)
    // },
    // //?? aiya still a little lost but trying to make it come together.
    strlit(_openQuote, _chars, _closeQuote) {
      return this.sourceString;
    },

    floatlit(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },

    num(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },
  });

  return builder(match).rep();
}
