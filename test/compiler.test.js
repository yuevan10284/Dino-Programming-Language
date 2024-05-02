import assert from "assert/strict";
import util from "util";

import compile from "../src/compiler.js";
import optimize from "../src/optimizer.js";


const testProgram = 'rawr 0';

describe("The compiler", () => {
  it("throws err when the output type is unknown", (done) => {
    assert.throws(
      () => compile("rawr 0 ", "blah"),
      /Unknown output type/
    );
    done();
  });
  it("accepts the analyzed option", (done) => {
    const compiled = compile(testProgram, "analyzed");
    assert(compiled.kind === "Program");
    done();
  });
  it("accepts the optimized option", (done) => {
    const compiled = compile(testProgram, "optimized");
    assert(compiled.kind === "Program");
    done();
  });
  it("generates js code when given the js option", (done) => {
    const compiled = compile(testProgram, "js");
    assert(compiled.startsWith("console.log(0)"));
    done();
  });
});