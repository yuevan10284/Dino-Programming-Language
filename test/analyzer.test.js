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
  ["increment", 'letdino x=1 x = x+1'],
  ["while loops", 'roaring hit { rawr "hey" }'],
  ["return in nested if", "quest f() {if-rex hit {hatch}}"],
  ["comments", "letdino x = 5 🦖 comment"],
  ["long if", "if-rex miss {letdino x = miss} t-else {letdino y = hit}"],
  ["long if", "if-rex miss {letdino x = miss} t-else if-rex hit {letdino y = hit}"],
  ["loop", "roar x in 1 till 10 {}"],
  ["loop in function", "quest hungry(hunger) {roar hunger in 20 till 100 {hatch}}"],
  ["continue?", "roaring hit {keepStomping = hit}"],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["undeclared id", "rawr(x)", /Identifier x not declared/],
  ["numeral declarations", "letdino = 1", /Expected a letter/],
  ["variable print", 'dinoconst j = "wow" rawr i', /Identifier i not declared/],
  ["const var declaration", "dinoconst ysaurus = letdino", /keyword/],
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
