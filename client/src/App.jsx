import React, { useState, useRef, useEffect, useCallback } from "react";

async function callBackend(question, conversationHistory) {
  const res = await fetch("http://localhost:4000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, conversationHistory }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

const SUGGESTIONS = [
  "Show all employees earning more than $100k",
  "Add a new employee John Doe in Engineering as Junior Developer with salary 70000",
  "Update Alice Johnson's salary to 135000",
  "Delete the order with id 11",
  "Count orders by status",
  "What is the average salary per department?",
];

const QUERY_STYLES = {
  SELECT: { bg:"#58a6ff22", color:"#58a6ff", border:"#58a6ff44" },
  INSERT: { bg:"#3fb95022", color:"#3fb950", border:"#3fb95044" },
  UPDATE: { bg:"#f59e0b22", color:"#f59e0b", border:"#f59e0b44" },
  DELETE: { bg:"#ef444422", color:"#ef4444", border:"#ef444444" },
};

function QueryTypeBadge({ type }) {
  const s = QUERY_STYLES[type] ?? QUERY_STYLES.SELECT;
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,background:s.bg,color:s.color,fontSize:11,fontWeight:700,letterSpacing:"0.5px",border:`1px solid ${s.border}`}}>{type}</span>;
}

function StatusBadge({ status }) {
  const map = { delivered:"#10b981", shipped:"#3b82f6", processing:"#f59e0b", pending:"#8b5cf6", cancelled:"#ef4444" };
  const color = map[status?.toLowerCase()] ?? "#6b7280";
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,background:`${color}22`,color,fontSize:11,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",border:`1px solid ${color}44`}}>{status}</span>;
}

function SQLDisplay({ sql }) {
  const keywords = ["SELECT","FROM","WHERE","JOIN","ON","GROUP","ORDER","LIMIT","AND","OR","AS","INNER","LEFT","RIGHT","HAVING","DISTINCT","COUNT","SUM","AVG","MAX","MIN","IN","NOT","NULL","BY","DESC","ASC","INSERT","INTO","VALUES","UPDATE","SET","DELETE"];
  const parts = sql.split(/(\s+|,|\(|\))/g);
  return (
    <pre style={{margin:0,padding:"16px 20px",background:"#0d1117",borderRadius:8,overflowX:"auto",fontSize:13.5,lineHeight:1.7,fontFamily:"'Fira Code',monospace",border:"1px solid #21262d",color:"#c9d1d9"}}>
      {parts.map((p,i)=>{
        const up=p.trim().toUpperCase();
        if(keywords.includes(up)) return <span key={i} style={{color:"#ff7b72",fontWeight:600}}>{p}</span>;
        if(/^\d+(\.\d+)?$/.test(p.trim())) return <span key={i} style={{color:"#79c0ff"}}>{p}</span>;
        if(/^'[^']*'$/.test(p.trim())) return <span key={i} style={{color:"#a5d6ff"}}>{p}</span>;
        return <span key={i}>{p}</span>;
      })}
    </pre>
  );
}

export default function App() {
  const [question,setQuestion]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [history,setHistory]=useState([]);
  const [convHist,setConvHist]=useState([]);
  const [activeTab,setActiveTab]=useState("results");
  const inputRef=useRef(null);
  useEffect(()=>{inputRef.current?.focus();},[]);

  const handleSubmit=useCallback(async(q)=>{
    const text=(q??question).trim();
    if(!text||loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data=await callBackend(text,convHist);
      const isWrite=['INSERT','UPDATE','DELETE'].includes(data.queryType);
      const columns=isWrite?[]:data.columns.map(c=>c.name);
      const rows=isWrite?[]:data.rows.map(r=>columns.map(col=>r[col]));
      const entry={question:text,sql:data.sql,queryType:data.queryType??"SELECT",columns,rows,affectedRows:data.affectedRows,ts:Date.now()};
      setResult(entry);
      setHistory(h=>[entry,...h].slice(0,20));
      setConvHist(c=>[...c,{role:"user",content:text},{role:"assistant",content:data.sql}].slice(-12));
      setActiveTab("results");
    } catch(e){ setError(e.message??"Something went wrong."); }
    setLoading(false);
    if(!q) setQuestion("");
  },[question,loading,convHist]);

  const handleKeyDown=(e)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSubmit();} };

  return (
    <div style={{minHeight:"100vh",background:"#0a0c10",fontFamily:"'DM Sans','Inter',sans-serif",color:"#e6edf3",display:"flex",flexDirection:"column"}}>
      <nav style={{padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d1117",borderBottom:"1px solid #21262d",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#58a6ff,#bc8cff)"}}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{fontWeight:700,fontSize:16,letterSpacing:"-0.3px"}}>txt<span style={{color:"#58a6ff"}}>2</span>sql</span>
        </div>
        <div style={{display:"flex",gap:20}}>
          {["results","schema","history"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{background:"none",border:"none",color:activeTab===t?"#58a6ff":"#8b949e",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500,padding:"4px 0",textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>
      </nav>

      <main style={{flex:1,maxWidth:900,width:"100%",margin:"0 auto",padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h1 style={{fontSize:"clamp(28px,5vw,48px)",fontWeight:800,letterSpacing:"-1.5px",margin:"0 0 12px",background:"linear-gradient(135deg,#e6edf3 30%,#58a6ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Ask anything about your data
          </h1>
          <p style={{color:"#8b949e",fontSize:16,margin:"0 0 16px"}}>Natural language → MySQL 9.1 · Select, Insert, Update, Delete</p>
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            {["SELECT","INSERT","UPDATE","DELETE"].map(t=><QueryTypeBadge key={t} type={t}/>)}
          </div>
        </div>

        <div style={{background:"#161b22",border:`1px solid ${loading?"#58a6ff66":"#30363d"}`,borderRadius:12,padding:"4px 4px 4px 16px",display:"flex",alignItems:"center",gap:8,transition:"border-color .2s"}}>
          <textarea ref={inputRef} rows={2} value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="e.g. Add a new product, update a salary, delete an order, show all employees…"
            style={{flex:1,background:"none",border:"none",outline:"none",color:"#e6edf3",fontFamily:"inherit",fontSize:15,resize:"none",lineHeight:1.5,padding:"10px 0"}}/>
          <button onClick={()=>handleSubmit()} disabled={loading||!question.trim()}
            style={{minWidth:44,height:44,borderRadius:8,border:"none",background:loading||!question.trim()?"#21262d":"linear-gradient(135deg,#58a6ff,#bc8cff)",color:loading||!question.trim()?"#484f58":"#fff",cursor:loading||!question.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
            {loading
              ?<div style={{width:18,height:18,border:"2px solid #484f58",borderTop:"2px solid #58a6ff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              :<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
          {SUGGESTIONS.map(s=>(
            <button key={s} onClick={()=>{setQuestion(s);setTimeout(()=>handleSubmit(s),50);}}
              style={{background:"#161b22",border:"1px solid #30363d",borderRadius:20,padding:"6px 14px",color:"#8b949e",fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}
              onMouseEnter={e=>{e.target.style.borderColor="#58a6ff";e.target.style.color="#e6edf3";}}
              onMouseLeave={e=>{e.target.style.borderColor="#30363d";e.target.style.color="#8b949e";}}
            >{s}</button>
          ))}
        </div>

        {error&&<div style={{marginTop:24,padding:"14px 18px",borderRadius:8,background:"#ff7b7222",border:"1px solid #ff7b7244",color:"#ff7b72",fontSize:14,display:"flex",alignItems:"center",gap:10}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {error}
        </div>}

        <div style={{display:"flex",gap:2,marginTop:28,borderBottom:"1px solid #21262d"}}>
          {["results","schema","history"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{background:"none",border:"none",padding:"8px 18px 10px",borderBottom:activeTab===t?"2px solid #58a6ff":"2px solid transparent",color:activeTab===t?"#58a6ff":"#8b949e",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:500,textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>

        {activeTab==="results"&&result&&(
          <div style={{marginTop:24}}>
            <div style={{padding:"12px 16px",background:"#161b22",borderRadius:"8px 8px 0 0",border:"1px solid #30363d",borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <QueryTypeBadge type={result.queryType}/>
                <span style={{fontSize:12,color:"#8b949e",fontFamily:"monospace"}}>Generated SQL</span>
              </div>
              {result.queryType==="SELECT"
                ?<span style={{fontSize:12,color:"#3fb950"}}>✓ {result.rows.length} row{result.rows.length!==1?"s":""} returned</span>
                :<span style={{fontSize:12,color:"#3fb950"}}>✓ Executed successfully</span>}
            </div>
            <SQLDisplay sql={result.sql}/>

            {result.queryType==="SELECT"&&result.rows.length>0&&(
              <div style={{marginTop:16,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                  <thead><tr style={{background:"#161b22"}}>
                    {result.columns.map(c=><th key={c} style={{padding:"10px 14px",textAlign:"left",color:"#8b949e",fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.8px",border:"1px solid #21262d",whiteSpace:"nowrap"}}>{c}</th>)}
                  </tr></thead>
                  <tbody>
                    {result.rows.map((row,ri)=>(
                      <tr key={ri} style={{background:ri%2===0?"#0d1117":"#0a0c10"}}>
                        {row.map((cell,ci)=>(
                          <td key={ci} style={{padding:"10px 14px",border:"1px solid #21262d",color:"#c9d1d9",whiteSpace:"nowrap"}}>
                            {result.columns[ci]==="status"?<StatusBadge status={cell}/>:
                             /^\d+\.\d{2}$/.test(String(cell))?<span style={{color:"#3fb950",fontFamily:"monospace"}}>${cell}</span>:
                             String(cell??"")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.queryType!=="SELECT"&&(
              <div style={{marginTop:16,padding:"24px",background:"#161b22",border:"1px solid #30363d",borderRadius:8,display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:48,height:48,borderRadius:"50%",flexShrink:0,
                  background:result.queryType==="INSERT"?"#3fb95022":result.queryType==="UPDATE"?"#f59e0b22":"#ef444422",
                  border:`1px solid ${result.queryType==="INSERT"?"#3fb95044":result.queryType==="UPDATE"?"#f59e0b44":"#ef444444"}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {result.queryType==="DELETE"
                    ?<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    :result.queryType==="UPDATE"
                    ?<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    :<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                </div>
                <div>
                  <div style={{color:"#e6edf3",fontWeight:600,fontSize:15,marginBottom:4}}>
                    {result.queryType==="INSERT"&&"Row inserted successfully ✓"}
                    {result.queryType==="UPDATE"&&"Row(s) updated successfully ✓"}
                    {result.queryType==="DELETE"&&"Row(s) deleted successfully ✓"}
                  </div>
                  <div style={{color:"#8b949e",fontSize:13}}>Database modified. Run a SELECT to verify the changes.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="schema"&&(
          <div style={{marginTop:24,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {[
              {name:"employees",cols:["id","first_name","last_name","email","department","job_title","salary","hire_date"]},
              {name:"departments",cols:["id","name","budget","manager_id","location"]},
              {name:"products",cols:["id","name","category","price","stock_qty","supplier"]},
              {name:"orders",cols:["id","customer_id","product_id","quantity","total_price","status","order_date"]},
              {name:"customers",cols:["id","full_name","email","city","country","joined_at"]},
            ].map(t=>(
              <div key={t.name} style={{background:"#161b22",border:"1px solid #30363d",borderRadius:8,padding:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:10,borderBottom:"1px solid #21262d"}}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="5" rx="1" stroke="#58a6ff" strokeWidth="2"/><rect x="3" y="10" width="18" height="5" rx="1" stroke="#58a6ff" strokeWidth="2"/><rect x="3" y="17" width="18" height="4" rx="1" stroke="#58a6ff" strokeWidth="2"/></svg>
                  <span style={{color:"#e6edf3",fontWeight:600,fontSize:14}}>{t.name}</span>
                </div>
                {t.cols.map(c=>(
                  <div key={c} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:12.5}}>
                    {c==="id"&&<span style={{color:"#f0883e",fontSize:10}}>PK</span>}
                    {c.endsWith("_id")&&c!=="id"&&<span style={{color:"#8b949e",fontSize:10}}>FK</span>}
                    {c!=="id"&&!c.endsWith("_id")&&<span style={{width:20}}/>}
                    <span style={{color:"#c9d1d9",fontFamily:"monospace"}}>{c}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==="history"&&(
          <div style={{marginTop:24}}>
            {history.length===0
              ?<p style={{color:"#484f58",textAlign:"center",marginTop:40}}>No queries yet.</p>
              :history.map((h,i)=>(
                <div key={i} onClick={()=>{setQuestion(h.question);setResult(h);setActiveTab("results");}}
                  style={{background:"#161b22",border:"1px solid #30363d",borderRadius:8,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#58a6ff"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#30363d"}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <QueryTypeBadge type={h.queryType??"SELECT"}/>
                      <span style={{fontSize:14,color:"#e6edf3",fontWeight:500}}>{h.question}</span>
                    </div>
                    <span style={{fontSize:11,color:"#484f58",flexShrink:0,marginLeft:16}}>{new Date(h.ts).toLocaleTimeString()}</span>
                  </div>
                  <div style={{marginTop:8,fontSize:12,fontFamily:"monospace",color:"#58a6ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.sql}</div>
                </div>
              ))}
          </div>
        )}

        {activeTab==="results"&&!result&&!error&&(
          <div style={{textAlign:"center",padding:"60px 0",color:"#484f58"}}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{margin:"0 auto 16px",display:"block"}}>
              <path d="M4 6h16M4 12h10M4 18h7" stroke="#30363d" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="17" cy="17" r="4" stroke="#30363d" strokeWidth="1.5"/>
              <path d="M20 20l2 2" stroke="#30363d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={{margin:0,fontSize:14}}>Ask anything — select, insert, update or delete</p>
          </div>
        )}
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#0d1117}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}`}</style>
    </div>
  );
}
