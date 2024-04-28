import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import { program, variableDeclaration, variable, binary, floatType } from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["numeral declarations", "letdino egg = 1"],
  ["print statement", 'rawr "ROARR, dino angry. I hate comet"'],
  ["variable print", 'dinoconst j = "wow" rawr j'],
  ["variable reassignment", "letdino x = 2 x =3"],
  ["short return", "quest f() { hatch }"],
  ["long return", "quest f() { hatch hit }"],
  ["var declaration", "letdino x = hit"],
  ["const var declaration", "dinoconst ysaurus = miss"],
  ["arithmetic", "letdino x=1 rawr(2*x+5**(-3)/2-5%8)"],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  // ["non-int increment", "letdino x=missx++", /an integer/],
  // ["non-int decrement", "letdino x=[]x--", /an integer/],
  // ["undeclared id", "rawr(x)", /Identifier x not declared/],
  // [
  //   "redeclared id",
  //   "dinoconst x = 1dinoconst x = 1",
  //   /Identifier x already declared/,
  // ],
  // ["assign to const", "dinoconst x = 1 x = 2", /Cannot assign to constant/],
  // [
  //   "non-distinct fields",
  //   "dinoconst S {x: hit x: int}",
  //   /Fields must be distinct/,
  // ],
  // ["invalid function declaration", "quest x=1", /Invalid function declaration/],
  // [
  //   "invalid if condition",
  //   'if-rex(x=1) {rawr("Invalid")}',
  //   /Invalid condition/,
  // ],
  // ["invalid return statement", "hatch x", /Invalid return statement/],
  // ["invalid var declaration", "letdino x", /Invalid variable declaration/],
  // ["invalid const declaration", "dinoconst x", /Invalid constant declaration/],
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
  it("produces the expected representation for a trivial program", () => {
    assert.deepEqual(
      analyze(parse("letdino x = 1 + 2.2")),
      program([
        variableDeclaration(
          variable("x", false),
          binary("+", 1, 2.2, floatType)
        ),
      ])
    );
  });
});
