import {validateDataset,parseSrt,evaluate,reportCsv,KEYS,WEIGHTS,DEFAULTS} from "./core.mjs";
import {DEMO} from "./demo.mjs";

const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const names={meaning:"Meaning",grammar:"Grammar",register:"Register",pedagogy:"Pedagogy"};
const MAX_BYTES=5*1024*1024;
let dataset=validateDataset(DEMO),mode="Synthetic demonstration",rows=[],limit=25;
let options={...DEFAULTS};

function tell(message,error=false){const n=$("message");n.hidden=false;n.classList.toggle("error",error);n.textContent=message;}
function clearMessage(){$("message").hidden=true;}
const number=(v,d=1)=>v==null?"—":v.toLocaleString("en",{maximumFractionDigits:d,minimumFractionDigits:0});
const pct=v=>v==null?"—":number(v)+"%";
const money=v=>v==null?"—":v.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:4});
function cell(tr,text){const td=el("td",text);tr.append(td);return td;}
function stat(title,value,detail){const n=el("div",null,"stat");n.append(el("span",title),el("strong",value),el("span",detail));return n;}
function time(ms){const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return [h,m,s].map(v=>String(v).padStart(2,"0")).join(":")+"."+String(ms%1000).padStart(3,"0");}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=el("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function read(file){if(!file)throw new Error("Select the required file.");if(file.size>MAX_BYTES)throw new Error("Files must be at most 5 MB.");return file.text();}
function updateInputs(){for(const [id,key] of Object.entries({"max-cps":"maxCps","min-pace":"minPace","min-quality":"minQuality","hourly-rate":"hourlyRate","volume":"volume"}))$(id).value=options[key];}
function useData(next,nextMode){dataset=validateDataset(next);mode=nextMode;limit=25;render(true);}
function readOptions(){
  const map={"max-cps":"maxCps","min-pace":"minPace","min-quality":"minQuality","hourly-rate":"hourlyRate","volume":"volume"};
  const next={};
  for(const [id,key] of Object.entries(map)){const node=$(id);if(!node.validity.valid||node.value.trim()===""){node.reportValidity();return;}next[key]=Number(node.value);}
  try{evaluate(dataset,next);options=next;render();clearMessage();}catch(e){tell(e.message,true);}
}
function render(resetCandidate=false){
  rows=evaluate(dataset,options);
  $("dataset-mode").textContent=mode;$("dataset-title").textContent=dataset.title;
  $("dataset-meta").textContent=dataset.source.length+" source cues · "+dataset.models.length+" candidates · schema v"+dataset.schemaVersion;
  document.querySelectorAll(".currency").forEach(n=>n.textContent=dataset.currency);
  const eligible=rows.filter(r=>r.eligible),best=eligible[0];
  $("summary").replaceChildren(stat("Gate-qualified candidates",eligible.length+" / "+rows.length,"All mandatory gates"),stat("Shortlist lead",best?best.model.label:"None",best?"Quality "+pct(best.quality):"No candidate is release-ready"),stat("Source cues",String(dataset.source.length),"Equal cue-level weighting"));
  const rank=$("ranking");rank.replaceChildren();
  let position=0;
  for(const r of rows){
    const tr=el("tr"),first=cell(tr,(r.eligible?String(++position)+". ":"— ")+r.model.label);first.append(el("small",r.model.version));
    cell(tr,pct(r.quality));cell(tr,pct(r.coverage));cell(tr,pct(r.reviewCoverage));cell(tr,pct(r.pace));cell(tr,number(r.p95Cps));cell(tr,String(r.critical));
    const status=cell(tr);status.append(el("span",r.eligible?"Qualified":"Not qualified","status "+(r.eligible?"pass":"fail")));if(r.reasons.length)status.append(el("small",r.reasons.join(" · ")));rank.append(tr);
  }
  const matrix=$("matrix");matrix.replaceChildren();
  for(const r of rows){const card=el("article",null,"matrix-card");card.append(el("h3",r.model.label));for(const k of KEYS){const line=el("div",null,"meter-row"),score=r.dimensions?.[k];line.append(el("span",names[k]+" ("+WEIGHTS[k]+"%)"));if(score==null){line.append(el("span","Not rated"),el("span","—"));}else{const meter=el("meter");meter.min=0;meter.max=100;meter.value=score;meter.setAttribute("aria-label",r.model.label+" "+names[k]);line.append(meter,el("span",pct(score)));}card.append(line);}matrix.append(card);}
  const sel=$("candidate"),previous=resetCandidate?null:sel.value;
  sel.replaceChildren(...rows.map(r=>{const o=el("option",r.model.label);o.value=r.model.id;return o;}));if(rows.some(r=>r.model.id===previous))sel.value=previous;
  const costs=$("costs");costs.replaceChildren();
  for(const r of rows){const tr=el("tr");cell(tr,r.model.label);for(const v of [r.cost?.api,r.cost?.human,r.cost?.total,r.cost?.projected])cell(tr,money(v));costs.append(tr);}
  renderEvidence();
}
function renderEvidence(){
  const r=rows.find(x=>x.model.id===$("candidate").value);
  if(!r)return;
  const filter=$("issue-filter").value;
  const items=r.evidence.filter(e=>filter==="all"||(filter==="issues"&&e.status!=="Pass")||(filter==="critical"&&e.critical===true)||(filter==="pacing"&&e.cps!=null&&!e.pace)||(filter==="timing"&&e.cps!=null&&!e.timing)||(filter==="unreviewed"&&!e.reviewed));
  $("evidence-summary").textContent=items.length+" of "+r.total+" source cues · "+r.extras+" extra candidate cues · "+r.timingErrors+" timestamp mismatches. Showing "+Math.min(limit,items.length)+".";
  const list=$("cue-list");list.replaceChildren();
  if(!items.length)list.append(el("p","No matching cues.","muted"));
  for(const e of items.slice(0,limit)){
    const article=el("article",null,"cue"),head=el("div",null,"cue-head");
    head.append(el("h3","Cue "+e.source.id+" · "+time(e.source.startMs)+" – "+time(e.source.endMs)),el("span",e.status,"status "+(e.status==="Pass"?"pass":"fail")));
    const texts=el("div",null,"cue-text"),left=el("div"),right=el("div");
    left.append(el("p","SOURCE","small"),el("p",e.source.text));const target=el("p",e.target?.text||"No output");target.lang="hi";right.append(el("p","CANDIDATE","small"),target);texts.append(left,right);
    const details=el("div",null,"cue-meta");
    details.append(el("span",number(e.cps)+" graphemes/s"),el("span",e.cps==null?"No pacing data":e.pace?"Pacing pass":"Pacing violation"),el("span",e.timing?"Timing aligned":"Timing absent / changed"),el("span",e.reviewed?"Human reviewed":"Review pending"));
    if(e.target&&e.cps!=null&&!e.timing)details.append(el("span","Candidate "+time(e.target.startMs)+" – "+time(e.target.endMs)));
    if(e.target?.ratings)for(const k of KEYS)details.append(el("span",names[k]+": "+number(e.target.ratings[k])+"/5"));
    article.append(head,texts,details);list.append(article);
  }
  $("more").hidden=limit>=items.length;
}
$("demo").addEventListener("click",()=>{options={...DEFAULTS};updateInputs();$("json-file").value="";$("source-file").value="";$("target-file").value="";$("issue-filter").value="all";useData(DEMO,"Synthetic demonstration");tell("Synthetic dataset restored.");});
$("template").addEventListener("click",()=>download("benchmark-example.json",JSON.stringify(DEMO,null,2),"application/json"));
$("json-file").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{useData(JSON.parse(await read(file)),"Local JSON import");tell("Benchmark loaded locally.");}catch(err){tell("Import failed: "+err.message,true);}finally{e.target.value="";}});
$("srt-import").addEventListener("click",async()=>{try{const [source,target]=await Promise.all([read($("source-file").files[0]),read($("target-file").files[0])]);useData({schemaVersion:1,title:"Local SRT pair",currency:"USD",source:parseSrt(source),models:[{id:"candidate",label:"Imported candidate",version:"unspecified",outputs:parseSrt(target),economics:null}]},"Local SRT import");tell("Cue comparison loaded. Human ratings and economics are not available for this raw pair.");}catch(err){tell("Import failed: "+err.message,true);}});
$("export").addEventListener("click",()=>download("benchmark-metrics.csv","\uFEFF"+reportCsv(rows,dataset.currency),"text/csv;charset=utf-8"));
for(const id of ["max-cps","min-pace","min-quality","hourly-rate","volume"])$(id).addEventListener("change",readOptions);
for(const id of ["candidate","issue-filter"])$(id).addEventListener("change",()=>{limit=25;renderEvidence();});
$("more").addEventListener("click",()=>{limit+=25;renderEvidence();});
updateInputs();render(true);
