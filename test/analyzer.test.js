import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import { program, variableDeclaration, variable, binary, floatType } from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["numeral declarations", "dinum egg = 1;"],
  ["string literal print statement", "rawr 'ROARR, dino angry. I hate comet';"],
  ["string print statement", "stegostring roar = 'wow'; rawr roar"],
  ["short return", "quest f() { hatch };"],
  ["long return", "quest f() { hatch egg };"],
  ["var declaration", "letdino xsaurus = hit;"],
  ["const var declaration", "dinoconst ysaurus = miss;"],
  ["bit operations", "rawr((1&2)|(9^3));"],
  ["relations", 'rawr(1<=2 && "x">"y" && 3.5<1.2);'],
  ["ok to == arrays", "rawr([1]==[5,8]);"],
  ["ok to != arrays", "rawr([1]!=[5,8]);"],
  ["shifts", "rawr(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "letdino x=1;rawr(2*x+5**-3/2-5%8);"],
  ["array length", "rawr(#[1,2,3]);"],
  ["optional types", "letdino x = no int; x = some 100;"],
  ["random with array literals, ints", "rawr(random [1,2,3]);"],
  ["random with array literals, strings", 'rawr(random ["a", "b"]);'],
  ["random on array variables", "letdino a=[hit, miss];rawr(random a);"],
  ["variables", "letdino x=[[[[1]]]]; rawr(x[0][0][0][0]+2);"],
  ["assigned functions", "quest f() {}; letdino g = f;g = f;"],
  ["call of assigned functions", "quest f(dinum x) {}; letdino g=f;g(1);"],
  [
        "call of assigned function in expression",
        `quest f(dinum x, boolean y): int {}
        letdino g = f;
        rawr(g(1, hit));
        f = g;`
  ],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["non-int increment", "dinolet x=miss;x++;", /an integer/],
  ["non-int decrement", 'dinolet x=[];x--;', /an integer/],
  ["undeclared id", "rawr(x);", /Identifier x not declared/],
  ["redeclared id", "dinoconst x = 1;dinoconst x = 1;", /Identifier x already declared/],
  ["assign to const", "dinoconst x = 1;x = 2;", /Cannot assign to constant/],
  ["non-distinct fields", "dinoconst S {x: hit x: int}", /Fields must be distinct/],
  ["invalid function declaration", 'quest x=1;', /Invalid function declaration/],
  ["invalid if condition", 'if-rex(x=1) {rawr("Invalid");}', /Invalid condition/],
  ["invalid return statement", 'hatch x;', /Invalid return statement/],
  ["invalid var declaration", 'letdino x;', /Invalid variable declaration/],
  ["invalid const declaration", 'dinoconst x;', /Invalid constant declaration/],
  
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
  it("produces the expected representation for a trivial program", () => {
    assert.deepEqual(
      analyze(parse("let x = π + 2.2;")),
      program([
        variableDeclaration(
          variable("x", false, floatType),
          binary("+", variable("π", true, floatType), 2.2, floatType)
        ),
      ])
    )
  })
})