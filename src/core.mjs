export const KEYS=["meaning","grammar","register","pedagogy"];
export const WEIGHTS={"meaning":40,"grammar":20,"register":20,"pedagogy":20};
export const DEFAULTS={"maxCps":15,"minPace":90,"minQuality":80,"hourlyRate":20,"volume":100};
function assert(condition,message){if(!condition)throw new Error(message);}

function finite(value,min=0,max=Number.MAX_SAFE_INTEGER){return typeof value==="number"&&Number.isFinite(value)&&value>=min&&value<=max;}

function str(value,max){return typeof value==="string"&&value.trim().length>0&&value.length<=max;}

function visibleText(text){return text.replace(/<\/?(?:i|b|u|s)>/gi,"").replace(/\s+/gu," ").trim();}

export function validateDataset(input){
  assert(input&&input.schemaVersion===1,"Expected schemaVersion 1.");
  assert(str(input.title,160),"Provide a title of 1–160 characters.");
  assert(typeof input.currency==="string"&&/^[A-Z]{3}$/.test(input.currency),"Use a three-letter currency code.");
  function cues(list,reviewed){
    assert(Array.isArray(list)&&list.length<=2000,"Each cue list must contain at most 2,000 cues.");
    const seen=new Set();
    return list.map((c)=>{
      assert(c&&str(c.id,80)&&!seen.has(c.id),"Cue IDs must be unique, nonempty strings.");
      seen.add(c.id);
      assert(Number.isSafeInteger(c.startMs)&&Number.isSafeInteger(c.endMs)&&c.startMs>=0&&c.endMs>c.startMs,"Invalid cue timing.");
      assert(typeof c.text==="string"&&c.text.length<=10000,"Invalid cue text.");
      assert(reviewed||c.text.trim(),"Source cues cannot be empty.");
      const clean={id:c.id,startMs:c.startMs,endMs:c.endMs,text:c.text};
      if(reviewed){
        assert(c.ratings==null||(typeof c.ratings==="object"&&KEYS.every(k=>finite(c.ratings[k],0,5))),"Ratings must contain all four values between 0 and 5.");
        assert(c.critical==null||typeof c.critical==="boolean","Critical status must be boolean or null.");
        clean.ratings=c.ratings==null?null:Object.fromEntries(KEYS.map(k=>[k,c.ratings[k]]));
        clean.critical=c.critical??null;
      }
      return clean;
    });
  }
  const source=cues(input.source,false);
  assert(source.length>0,"At least one source cue is required.");
  assert(Array.isArray(input.models)&&input.models.length>0&&input.models.length<=20,"Provide 1–20 candidates.");
  const ids=new Set();
  const models=input.models.map(m=>{
    assert(m&&str(m.id,80)&&!ids.has(m.id)&&str(m.label,100)&&str(m.version,100),"Candidates need unique IDs, labels and versions.");
    ids.add(m.id);
    let economics=null;
    if(m.economics!=null){
      const e=m.economics;
      assert(e&&["inputTokens","outputTokens","inputPerMillion","outputPerMillion","reviewMinutes"].every(k=>finite(e[k])),"Economics must contain five nonnegative numeric inputs.");
      assert(Number.isSafeInteger(e.inputTokens)&&Number.isSafeInteger(e.outputTokens),"Token counts must be integers.");
      economics=Object.fromEntries(["inputTokens","outputTokens","inputPerMillion","outputPerMillion","reviewMinutes"].map(k=>[k,e[k]]));
    }
    return {id:m.id,label:m.label,version:m.version,outputs:cues(m.outputs,true),economics};
  });
  return {schemaVersion:1,title:input.title,currency:input.currency,source,models};
}

export function parseSrt(raw){
  assert(typeof raw==="string"&&raw.length<=5*1024*1024,"SRT exceeds the supported size.");
  const text=raw.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").trim();
  assert(text,"SRT is empty.");
  const blocks=text.split(/\n[ \t]*\n+/);
  assert(blocks.length<=2000,"SRT exceeds 2,000 cues.");
  const ids=new Set();
  function ms(s){
    const m=/^(\d{2,5}):([0-5]\d):([0-5]\d)[,.](\d{3})$/.exec(s);
    assert(m,"Invalid SRT timestamp.");
    return ((Number(m[1])*60+Number(m[2]))*60+Number(m[3]))*1000+Number(m[4]);
  }
  return blocks.map((block,i)=>{
    const [first,timing,...lines]=block.split("\n");
    const id=first.trim();
    assert(/^\d+$/.test(id)&&!ids.has(id),"Invalid or duplicate SRT index in block "+(i+1)+".");
    ids.add(id);
    const match=/^\s*(\S+)\s+-->\s+(\S+)\s*$/.exec(timing??"");
    assert(match,"Invalid timing line in block "+(i+1)+".");
    const startMs=ms(match[1]),endMs=ms(match[2]),body=lines.join("\n").trim();
    assert(endMs>startMs&&body&&body.length<=10000,"Invalid timing or missing text in block "+(i+1)+".");
    return {id,startMs,endMs,text:body};
  });
}

export function countGraphemes(text){
  const value=visibleText(text);
  return Array.from(new Intl.Segmenter("hi",{granularity:"grapheme"}).segment(value)).length;
}

export function percentile(values,p){
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.max(0,Math.ceil(p*sorted.length)-1)];
}

export function settings(input={}){
  const s={...DEFAULTS,...input};
  assert(finite(s.maxCps,1,100)&&finite(s.minPace,0,100)&&finite(s.minQuality,0,100)&&finite(s.hourlyRate,0,1000000)&&Number.isSafeInteger(s.volume)&&finite(s.volume,1,1000000),"Invalid decision settings.");
  return s;
}

export function evaluate(dataset,options={}){
  const s=settings(options);
  const sourceIds=new Set(dataset.source.map(c=>c.id));
  const rows=dataset.models.map(model=>{
    const byId=new Map(model.outputs.map(c=>[c.id,c]));
    const evidence=dataset.source.map(source=>{
      const target=byId.get(source.id);
      if(!target||!visibleText(target.text))return {source,target:target??null,status:"Missing",cps:null,reviewed:false,critical:null,timing:false,pace:false};
      const cps=countGraphemes(target.text)/((target.endMs-target.startMs)/1000);
      const timing=source.startMs===target.startMs&&source.endMs===target.endMs;
      const reviewed=target.ratings!=null&&target.critical!=null;
      return {source,target,status:target.critical===true?"Critical":!timing?"Timing":cps>s.maxCps?"Pacing":!reviewed?"Unreviewed":"Pass",cps,reviewed,critical:target.critical,timing,pace:cps<=s.maxCps};
    });
    const present=evidence.filter(e=>e.cps!=null);
    const reviewed=present.filter(e=>e.reviewed);
    const total=dataset.source.length,matched=present.length;
    const extras=model.outputs.filter(c=>!sourceIds.has(c.id)).length;
    const timingErrors=present.filter(e=>!e.timing).length;
    const critical=present.filter(e=>e.critical===true).length;
    const coverage=100*matched/total;
    const reviewCoverage=100*reviewed.length/total;
    const pace=matched?100*present.filter(e=>e.pace).length/matched:null;
    const dimensions=reviewed.length?Object.fromEntries(KEYS.map(k=>[k,100*reviewed.reduce((sum,e)=>sum+e.target.ratings[k],0)/(5*reviewed.length)])):null;
    const quality=dimensions?KEYS.reduce((sum,k)=>sum+dimensions[k]*WEIGHTS[k]/100,0):null;
    const cps=present.map(e=>e.cps);
    const meanCps=cps.length?cps.reduce((sum,v)=>sum+v,0)/cps.length:null;
    let cost=null;
    if(model.economics){
      const e=model.economics;
      const api=(e.inputTokens*e.inputPerMillion+e.outputTokens*e.outputPerMillion)/1e6;
      const human=e.reviewMinutes*s.hourlyRate/60;
      cost={api,human,total:api+human,projected:(api+human)*s.volume};
    }
    const reasons=[];
    if(matched!==total||extras)reasons.push("Cue coverage / extra cues");
    if(timingErrors)reasons.push("Timestamp mismatch");
    if(reviewed.length!==total)reasons.push("Incomplete human review");
    if(critical)reasons.push("Critical meaning error");
    if(quality==null||quality<s.minQuality)reasons.push("Quality threshold");
    if(pace==null||pace<s.minPace)reasons.push("Pacing threshold");
    return {model,evidence,total,matched,extras,timingErrors,critical,coverage,reviewCoverage,pace,dimensions,quality,meanCps,p95Cps:percentile(cps,.95),cost,reasons,eligible:reasons.length===0};
  });
  return rows.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(b.quality??-1)-(a.quality??-1)||(b.pace??-1)-(a.pace??-1)||a.model.id.localeCompare(b.model.id,"en"));
}

export function csvCell(value){
  if(value==null)return "";
  if(typeof value==="number")return String(value);
  let s=String(value);
  if(/^[\s]*[=+\-@]|^[\t\r\n]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}

export function reportCsv(rows,currency){
  const headers=["candidate","version","eligible","coverage_pct","review_pct","quality_pct","pacing_pct","mean_cps","p95_cps","timing_errors","extra_cues","critical_errors","currency","api_cost","review_cost","total_cost","projected_cost","decision_reasons"];
  const round=v=>v==null?null:Number(v.toFixed(4));
  const lines=rows.map(r=>[r.model.label,r.model.version,r.eligible?"yes":"no",round(r.coverage),round(r.reviewCoverage),round(r.quality),round(r.pace),round(r.meanCps),round(r.p95Cps),r.timingErrors,r.extras,r.critical,currency,round(r.cost?.api),round(r.cost?.human),round(r.cost?.total),round(r.cost?.projected),r.reasons.join("; ")]);
  return [headers,...lines].map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
