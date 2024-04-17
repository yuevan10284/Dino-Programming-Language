export function program(statements) {
  return { kind: "Program", statements };
}

export function printStatement(argument) {
  return { kind: "PrintStatement", argument };
}
