import test from "node:test";
import assert from "node:assert/strict";
import {validateDataset,parseSrt,countGraphemes,evaluate,csvCell,reportCsv,percentile} from "../src/core.mjs";
import {DEMO} from "../src/demo.mjs";
const fixture=()=>structuredClone(DEMO);
const candidate=(data,id="a",settings={})=>evaluate(validateDataset(data),settings).find(r=>r.model.id===id);
test("demo qualifies two candidates and rejects a critical error",()=>{
  const rows=evaluate(validateDataset(DEMO));
  assert.equal(rows.filter(r=>r.eligible).length,2);
  assert.equal(rows[0].model.id,"a");
  assert.equal(rows.find(r=>r.model.id==="c").critical,1);
});
test("Devanagari graphemes, whitespace and supported markup",()=>assert.equal(countGraphemes("<i>कि</i>  a"),3));
test("SRT handles BOM, CRLF, multiline text and decimal separator",()=>{
  const cues=parseSrt("\uFEFF1\r\n00:00:00,100 --> 00:00:02.000\r\nHello\r\nworld\r\n");
  assert.deepEqual(cues,[{id:"1",startMs:100,endMs:2000,text:"Hello\nworld"}]);
});
test("SRT rejects duplicates and invalid timestamps",()=>{
  assert.throws(()=>parseSrt("1\n00:00:00,000 --> 00:00:01,000\nA\n\n1\n00:00:01,000 --> 00:00:02,000\nB"),/duplicate/);
  assert.throws(()=>parseSrt("1\n00:00:61,000 --> 00:00:02,000\nA"),/timestamp/);
  assert.throws(()=>parseSrt("1\n00:00:02,000 --> 00:00:01,000\nA"),/timing/);
});
test("schema rejects out-of-range ratings and duplicate candidates",()=>{
  const x=fixture();x.models[0].outputs[0].ratings.meaning=6;assert.throws(()=>validateDataset(x),/Ratings/);
  const y=fixture();y.models[1].id=y.models[0].id;assert.throws(()=>validateDataset(y),/unique/);
});
test("unknown fields are excluded",()=>{const x=fixture();x.unused="not exported";assert.equal(validateDataset(x).unused,undefined);});
test("incomplete review is not a pass",()=>{const x=fixture();x.models[0].outputs[0].ratings=null;const r=candidate(x);assert.equal(r.reviewCoverage,80);assert.equal(r.eligible,false);});
test("critical flag is required for review completion",()=>{const x=fixture();delete x.models[0].outputs[0].critical;assert.equal(candidate(x).reviewCoverage,80);});
test("extra, missing and blank cues prevent qualification",()=>{const x=fixture();x.models[0].outputs[0].id="extra";x.models[0].outputs[1].text=" ";const r=candidate(x);assert.equal(r.coverage,60);assert.equal(r.extras,1);assert.equal(r.eligible,false);});
test("exact timestamp mismatch prevents qualification",()=>{const x=fixture();x.models[0].outputs[0].endMs++;const r=candidate(x);assert.equal(r.timingErrors,1);assert.equal(r.eligible,false);});
test("pacing depends on duration and threshold",()=>{const r=candidate(fixture(),"a",{maxCps:1,minPace:100});assert.equal(r.eligible,false);assert.ok(r.pace<100);});
test("missing economics stay null",()=>{const x=fixture();x.models[0].economics=null;assert.equal(candidate(x).cost,null);});
test("cost scenario includes human review",()=>{const r=candidate(fixture(),"a",{hourlyRate:60,volume:10});assert.ok(Math.abs(r.cost.total-4.0054)<1e-8);assert.ok(Math.abs(r.cost.projected-40.054)<1e-8);});
test("invalid gate settings are rejected",()=>assert.throws(()=>evaluate(validateDataset(DEMO),{volume:0}),/settings/));
test("nearest-rank percentile",()=>{assert.equal(percentile([1,3,2,4],.95),4);assert.equal(percentile([],.95),null);});
test("CSV escapes spreadsheet formulas and delimiters",()=>{assert.equal(csvCell("=2+2"),"\"'=2+2\"");assert.equal(csvCell("a,b"),"\"a,b\"");assert.equal(csvCell(-2),"-2");assert.ok(reportCsv(evaluate(validateDataset(DEMO)),"USD").includes("decision_reasons"));});
