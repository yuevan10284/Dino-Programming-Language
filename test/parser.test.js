import assert from "assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  ["all numeric literal forms", "rawr(8 * 89.123)"],
  ["complex expressions", "rawr(83 * ((((-((((13 / 21)))))))) + 1 - 0)"],
  ["all unary operators", "rawr (-3) rawr (!false)"],
  ["all binary operators", "rawr x && y || z * 1 / 2 ** 3 + 4 < 5"],
  ["all logical operators", "letdino x = true && false || (!false)"],
  [
    "all arithmetic operators",
    "letdino x = (!3) * 2 + 4 - (-7.3) * 8 ** 13 / 1",
  ],
  ["all relational operators", "letdino x = 1<(2<=(3==(4!=(5 >= (6>7)))))"],
  ["the conditional operator", "rawr x ? y : z"],
  ["comments with no text are ok", "rawr(1)cR\nrawr(0)cR"],
  ["end of program inside comment", "rawr(0) cR yay"],
  ["non-Latin letters in identifiers", "コンパ = 100"],
];

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["a missing right operand", "rawr(5 -", /Line 1, col 9/],
  ["an expression starting with a )", "x = )", /Line 1, col 5/],
  ["a non-operator", "rawr(7 * ((2 _ 3)", /Line 1, col 14/],
  ["a statement starting with expression", "x * 5", /Line 1, col 3/],
  ["an illegal statement on line 2", "rawr(5)\nx * 5", /Line 2, col 3/],
  ["a statement starting with a )", "rawr(5)\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71", /Line 1, col 5/],
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
