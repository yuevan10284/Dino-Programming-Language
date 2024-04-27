import { unary } from "./core.js"

export default function optimize(node) {
  return node
}

const optimizers = {
  program(p) {
    p.statements = p.statements.flatMap(optimize)
    return p
  },
  variableDeclaration(d) {
    d.initializer = optimize(d.initializer)
    return d
  },
  functionDeclaration(d) {
    d.body = optimize(d.body)
    return d
  },
  /*
  PrintStatement(s) {
    s.argument = optimize(s.argument)
    return s
  },
  */
  returnStatement(s) {
    s.expression = optimize(s.expression)
    return s
  },
}