(function(){"use strict";
var L={
easy:{t:"Case 014 — The Missing Client List",b:["A mid-sized firm suspects a departing employee, <strong>P. Nandakumar</strong>, copied the client database and emailed it to a personal address before resigning. IT imaged her workstation before wiping it. Several files were deleted, some are hidden, and one recovered artifact is corrupted. This is a synthetic exercise — no real evidence, no real person.","Inspect the manifest, recover and flag the files that matter, then reconstruct the order of events."],
files:[
{id:"master",n:"client_list_master.csv",s:"active",ts:"09:02:11",c:"name,email,account_tier\nAcosta Freight,ops@acostafreight.com,Gold\n...(4,112 rows)"},
{id:"backup",n:"client_list_backup.csv",s:"deleted",ts:"09:15:47",dt:"09:47:02",c:"name,email,account_tier\n...(4,112 rows)\n# duplicate of master, created shortly before deletion",ev:1,h:"Compare its creation time to the master — why would a duplicate appear minutes before things went missing?"},
{id:"sync",n:".sync_temp.log",s:"hidden",ts:"09:16:03",c:"[09:16:03] external volume mounted: E:\\ (USB, 32GB)\n[09:16:09] queued: client_list_backup.csv\n[09:16:22] sync complete",ev:1,h:"Hidden files often log activity the user didn't want seen — tick 'show hidden entries'."},
{id:"eml",n:"transfer_confirmation.eml",s:"dc",ts:"10:03:29",dt:"10:41:15",cc:"Fr□m: p.n█ndak█████\nT█: p███████90@gm██l.c█m\nSubj█ct: ██ backup ██ safekeeping\n\n██y attaching the ██ before I ██...",rc:"From: p.nandakumar@[internal]\nTo: pnanda*****90@gmail.com\nSubject: re: backup for safekeeping\n\nHey, attaching the client file before I forget — keeping a copy for myself just in case HR is weird about references.",ev:1,h:"Corrupted doesn't mean unreadable — try the repair action."},
{id:"search",n:"search_history.sqlite",s:"deleted",ts:"09:12:30",dt:"10:45:00",c:"09:12:30  \"copy large csv to usb without admin approval\"\n09:12:58  \"does IT log usb insertions\"",ev:1,h:"Search history can reveal intent before any file moves."},
{id:"zip",n:"vacation_photos.zip",s:"active",ts:"08:50:02",c:"[archive: 214 files, 340MB — unrelated personal photos]"},
{id:"inv",n:"old_invoice_2023.pdf",s:"deleted",ts:"2023-11-02",dt:"09:50:18",c:"INVOICE #2023-1188 — paid in full, archived. Routine cleanup, unrelated.",h:"Old, routine, already resolved — deleted isn't automatically suspicious."},
{id:"cache",n:"thumbcache_tmp.db",s:"deleted",ts:"09:00:41",dt:"09:00:44",c:"System thumbnail cache, auto-purged by the OS three seconds after creation.",h:"Automatic system purges are noise, not intent."},
{id:"rec",n:"lunch_receipt.png",s:"hidden",ts:"08:55:00",c:"[image: cafeteria receipt, 2 items, $9.40]",h:"Hidden doesn't mean guilty — read the content."},
{id:"res",n:"resignation_letter.docx",s:"active",ts:"11:20:00",c:"To HR — please accept this letter as notice of my resignation, effective two weeks from today."},
{id:"log",n:"system_access.log",s:"active",ts:"—",c:"[09:10:02] login: p.nandakumar — device UNREGISTERED (first seen)\n[09:45:51] bulk file access: /clients/* (4,112 objects)\n[11:19:40] logout"}],
te:["backup","sync","eml","search"],
ev:[["Unregistered device logs in as P. Nandakumar","09:10 — system_access.log"],["Search history shows queries about copying files to USB","09:12 — search_history.sqlite"],["Backup copy of the client list is created","09:15 — client_list_backup.csv"],["USB drive mounted and backup synced off-machine","09:16 — .sync_temp.log"],["Bulk access of all client records logged","09:45 — system_access.log"],["Backup copy is deleted from the workstation","09:47 — client_list_backup.csv"],["Email sent to a personal address with the file attached","10:03 — transfer_confirmation.eml"],["Resignation letter formally submitted","11:20 — resignation_letter.docx"]]},
moderate:{t:"Case 027 — The Split Invoice",b:["A vendor payments clerk is suspected of routing duplicate payments to a shell account. Evidence is messier: files are split into fragments, timestamps lie, and several files are deliberate decoys. This is a synthetic exercise — no real evidence, no real person.","Flag only what's genuinely relevant — false flags cost more here than on Easy."],
files:[
{id:"vm",n:"vendor_master.xlsx",s:"active",ts:"08:40:00",c:"vendor_id,name,account\nV-118,Kestrel Supply,AC-4471\nV-119,Doe Logistics,AC-9012\n...(212 rows)"},
{id:"f1",n:"payout_frag_1.tmp",s:"deleted",ts:"13:02:04",dt:"13:40:11",c:"...ROUTE: V-118 -> AC-4471 (primary) [fragment 1 of 2, continues in payout_frag_2.tmp]",ev:1,h:"This fragment references a second half — find it."},
{id:"f2",n:"payout_frag_2.tmp",s:"hidden",ts:"13:02:09",c:"...ROUTE (cont): V-118 -> AC-7734 (shadow) — added same session, not in vendor_master.xlsx",ev:1,h:"Same vendor ID, two different destination accounts."},
{id:"aud",n:"session_audit.csv",s:"active",ts:"12:20:00 (displayed)",c:"session_id,user,displayed_ts,server_ts\nS-881,clerk_09,12:20:00,13:01:52\n# displayed timestamp was backdated by the client; server_ts is authoritative",h:"The displayed timestamp can't be trusted — check server_ts."},
{id:"bank",n:"bank_release_receipt.pdf",s:"deleted",ts:"13:44:20",dt:"13:52:00",c:"Payment batch #5531 released: V-118 -> AC-7734, amount 48,900.00. Approver: clerk_09 (self-approved).",ev:1,h:"Follow the money: who approved the release, and to which account?"},
{id:"ledger",n:"shadow_ledger.txt",s:"hidden",ts:"13:10:00",c:"AC-7734 opened 3 weeks ago under a name variant of V-118. Skim: 4 prior payments, all under approval threshold.",ev:1,h:"Structuring below approval thresholds is a classic pattern."},
{id:"spool",n:"printer_spool.log",s:"deleted",ts:"12:55:00",dt:"13:10:00",c:"Routine print job — quarterly vendor report, 4 pages. No relation to payment routing.",h:"Deleted and oddly timed, but read the content."},
{id:"lunch",n:"lunch_order.eml",s:"deleted",ts:"12:30:00",dt:"12:45:00",c:"Subject: Lunch order for the team — nothing case-relevant."},
{id:"clean",n:"audit_all_clear.txt",s:"deleted",ts:"13:30:00",dt:"13:31:00",c:"\"Internal audit: no anomalies found.\" — unsigned, created by clerk_09's own account.",h:"An unsigned all-clear from the suspect's own account proves nothing."}],
te:["f1","f2","bank","ledger"],
ev:[["Vendor master file is opened for a routine edit","08:40 — vendor_master.xlsx"],["Session begins; its displayed time is backdated","12:20 shown / 13:01 actual — session_audit.csv"],["First payout-routing fragment is written","13:02 — payout_frag_1.tmp"],["Second fragment adds a shadow account","13:02 — payout_frag_2.tmp"],["Fragment 1 is deleted from disk","13:40 — payout_frag_1.tmp"],["Payment released to the shadow account","13:44 — bank_release_receipt.pdf"]]},
impossible:{t:"Case 041 — Locked Out",b:["A server admin is suspected of covering their tracks after an unauthorized export. Standard logs are wiped; what's left are inconsistencies, a planted 'confession', a forged approval, and encoded fragments. This is a synthetic exercise — no real evidence, no real person.","The absence of an expected file is itself a clue. Distrust anything that hands you a conclusion too easily."],
files:[
{id:"cron",n:"crontab.bak",s:"deleted",ts:"22:05:11",dt:"22:15:00",c:"# new entry added 22:05\n14 22 * * * /opt/tools/cleanup_utility --wipe /var/log/*",ev:1,h:"Something was scheduled before it ran — premeditation."},
{id:"b64",n:"note.b64",s:"hidden",ts:"22:12:55",c:"Decoded: 'export queued for 22:13, destination staging-external, approved by nobody'",ev:1,h:"Needing to decode this suggests it wasn't meant to be found."},
{id:"meta",n:"export_job.meta",s:"dc",ts:"22:13:01",dt:"22:19:47",cc:"j█b_id: 88█2\nde█t: sta████-ex█ernal\napp███ed_by: n█████",rc:"job_id: 8802\ndest: staging-external\napproved_by: none on record — bypassed normal approval queue",ev:1,h:"Repair it and compare 'approved_by' with the decoded note."},
{id:"dns",n:"dns_query.cache",s:"deleted",ts:"22:13:30",dt:"22:18:00",c:"22:13:30  A staging-external.example -> 203.0.113.44 (first lookup ever from this host)",ev:1,h:"A first-ever lookup of the destination right at export time is telling."},
{id:"wipe",n:"cleanup_utility.exe.trace",s:"deleted",ts:"22:14:02",dt:"22:16:40",c:"Secure-wipe tool ran against /var/log/* at 22:14. Most standard logs unrecoverable — their absence from this manifest is the evidence.",ev:1,h:"Notice what's missing compared to a normal system."},
{id:"conf",n:"my_confession.txt",s:"active",ts:"22:20:00",c:"I did it, I exported the database, I'm sorry. — signed, the admin",h:"A file that hands you the whole conclusion, untouched by the wipe, deserves scrutiny."},
{id:"appr",n:"export_approval.eml",s:"active",ts:"22:40:00",c:"Approved: export job 8802. — cfo-office\n# Received-by header: mail server clock, 22:40 — 27 minutes AFTER the export ran.",h:"An approval that arrives after the fact is not an approval."},
{id:"tmp",n:"readme.tmp",s:"deleted",ts:"22:00:00",dt:"22:00:05",c:"Empty editor scratch file, auto-deleted five seconds after creation."}],
te:["cron","b64","meta","dns","wipe"],
ev:[["A wipe job is scheduled in the crontab","22:05 — crontab.bak"],["Hidden encoded note queues an unapproved export","22:12 — note.b64"],["Export job metadata is created with no approval","22:13 — export_job.meta"],["Destination host is resolved for the first time","22:13 — dns_query.cache"],["Secure-wipe utility runs against system logs","22:14 — cleanup_utility.exe.trace"],["A convenient confession file appears, untouched by the wipe","22:20 — my_confession.txt"],["A back-dated-looking approval email arrives after the export","22:40 — export_approval.eml"]]}};
var ORDER=["easy","moderate","impossible"],S={lv:"easy",sel:null,hid:false,rep:{},fl:{},pos:{},vw:{},hs:{},sub:false,res:null,un:{easy:1,moderate:0,impossible:0}};
try{var u=JSON.parse(localStorage.getItem("dfl-unlock")||"null");if(u)S.un=u}catch(e){}
var $=function(i){return document.getElementById(i)},cur=function(){return L[S.lv]};
var fl=function(f){return f.s!=="active"},dele=function(f){return f.s==="d"||f.s==="dc"||f.s==="deleted"};
function file(id){return cur().files.filter(function(f){return f.id===id})[0]}
function stTag(f){var s=f.s;if(s==="active")return'<span class="t a">active</span>';if(s==="hidden")return'<span class="t h">hidden</span>';return'<span class="t d">deleted</span>'+(s==="dc"?'<span class="t c">corrupted</span>':'')}
function nav(){document.querySelectorAll(".lv").forEach(function(b){var l=b.dataset.l;b.classList.toggle("on",l===S.lv);b.disabled=!S.un[l]});
$("lock").textContent=!S.un.moderate?"Score 70+ on Easy to unlock Moderate.":!S.un.impossible?"Score 70+ on Moderate to unlock Impossible.":""}
function brief(){var l=cur();$("brief").innerHTML="<h2>"+l.t+"</h2>"+l.b.map(function(p){return"<p>"+p+"</p>"}).join("")}
function prog(){var r=cur().files.filter(fl),v=r.filter(function(f){return S.vw[f.id]}).length,p=r.length?Math.round(v/r.length*100):0;
$("pl").textContent=v+" / "+r.length+" recoverable inspected";$("pf").style.width=p+"%";$("ph").textContent=p===100?"ready to flag & submit":""}
function manifest(){var h="";cur().files.forEach(function(f){if(f.s==="hidden"&&!S.hid)return;var m="";
if(S.sub&&fl(f)){var t=cur().te.indexOf(f.id)>-1,g=!!S.fl[f.id];m=t&&g?"ok":!t&&g?"bad":t?"miss":""}
h+='<tr class="r '+m+(S.sel===f.id?" sel":"")+(f.s==="hidden"?" hid":"")+'" data-id="'+f.id+'"><td>'+(f.s==="hidden"?"👁":dele(f)?"🗑":"📄")+'</td><td class="fn">'+f.n+'</td><td>'+stTag(f)+(m==="ok"?'<span class="t g">correct</span>':m==="bad"?'<span class="t b">false flag</span>':m==="miss"?'<span class="t mi">missed</span>':"")+'</td><td class="ts">'+f.ts+'</td><td><input type="checkbox" class="fc" data-f="'+f.id+'" '+(S.fl[f.id]?"checked":"")+((!fl(f)||S.sub)?" disabled":"")+' aria-label="Flag '+f.n+'"></td></tr>'});
$("mb").innerHTML=h;
$("mb").querySelectorAll("tr.r").forEach(function(tr){tr.onclick=function(e){if(e.target.classList.contains("fc"))return;S.sel=tr.dataset.id;S.vw[S.sel]=1;inspect();manifest();prog()}});
$("mb").querySelectorAll(".fc").forEach(function(c){c.onchange=function(){S.fl[c.dataset.f]=c.checked;if(S.sel===c.dataset.f)inspect()}})}
function inspect(){var el=$("ins");if(!S.sel){el.innerHTML='<div class="empty">Select a file from the manifest to inspect it.</div>';return}
var f=file(S.sel),h='<div class="it">'+f.n+'</div><div class="im">'+f.s.replace("dc","deleted + corrupted")+" · "+f.ts+(f.dt?" · deleted "+f.dt:"")+"</div>";
if(f.s==="dc"){var r=S.rep[f.id];h+='<div class="box '+(r?"":"cor")+'">'+(r?f.rc:f.cc)+"</div>"+(r?'<p class="hint">Repair recovered the real contents.</p>':'<button class="btn" id="rp">Attempt repair</button>')}else h+='<div class="box">'+f.c+"</div>";
h+=fl(f)?'<label class="chk" style="margin-top:12px"><input type="checkbox" id="if" '+(S.fl[f.id]?"checked":"")+(S.sub?" disabled":"")+'> Flag as recovered evidence</label>':'<p class="hint">Never deleted or hidden — no recovery needed, but its contents may help the timeline.</p>';
if(f.h&&!S.sub){h+='<button class="btn" id="hb">Need a hint?</button>'+(S.hs[f.id]?'<div class="hb">'+f.h+"</div>":"")}
el.innerHTML=h;
var a=$("rp");if(a)a.onclick=function(){S.rep[f.id]=1;inspect()};
a=$("if");if(a)a.onchange=function(){S.fl[f.id]=a.checked;manifest()};
a=$("hb");if(a)a.onclick=function(){S.hs[f.id]=1;inspect()}}
function timeline(){var l=cur(),n=l.ev.length;$("tl").innerHTML=l.ev.map(function(e,i){var o=i+1,v=S.pos[i]||"",c=S.sub?(String(v)===String(o)?"ok":"bad"):"";
var opts='<option value="">–</option>';for(var k=1;k<=n;k++)opts+='<option value="'+k+'"'+(String(k)===String(v)?" selected":"")+">"+k+"</option>";
return'<div class="ti '+c+'"><select data-i="'+i+'" aria-label="Position"'+(S.sub?" disabled":"")+">"+opts+'</select><div>'+e[0]+'<div class="d">'+e[1]+"</div></div>"+(S.sub?'<span class="c">correct: '+o+"</span>":"")+"</div>"}).join("");
$("tl").querySelectorAll("select").forEach(function(s){s.onchange=function(){S.pos[s.dataset.i]=s.value}})}
function score(){var l=cur(),tt=0,ff=0;l.files.forEach(function(f){if(!fl(f)||!S.fl[f.id])return;l.te.indexOf(f.id)>-1?tt++:ff++});
var pen=S.lv==="easy"?.25:.35,fs=Math.max(0,Math.min(1,tt/l.te.length-ff*pen))*50,cp=0;
l.ev.forEach(function(e,i){if(String(S.pos[i])===String(i+1))cp++});var ts=cp/l.ev.length*50,tot=Math.round(fs+ts);
return{tot:tot,fs:Math.round(fs),ts:Math.round(ts),tt:tt,ff:ff,n:l.te.length,cp:cp,ne:l.ev.length,g:tot>=90?"Case closed — exemplary work":tot>=70?"Solid recovery, minor gaps":tot>=50?"Needs review — key evidence missed":"Reopen the case — start from the manifest"}}
function card(){var r=S.res;$("sp").style.display=r?"block":"none";if(!r)return;
$("sc").innerHTML='<div class="score"><div class="ring" style="--p:'+r.tot+'"><b>'+r.tot+'</b></div><div class="grade">'+r.g+'</div>'+
'<div class="row"><span>Evidence recovered correctly</span><span>'+r.tt+" / "+r.n+'</span></div><div class="row"><span>Irrelevant files wrongly flagged</span><span>'+r.ff+'</span></div><div class="row"><span>Timeline positions correct</span><span>'+r.cp+" / "+r.ne+'</span></div><div class="row"><span>File recovery score</span><span>'+r.fs+' / 50</span></div><div class="row"><span>Timeline score</span><span>'+r.ts+' / 50</span></div></div>'+
(r.tot>=70&&S.lv!=="impossible"?'<p class="hint">Next level unlocked — see the tabs above.</p>':"")+'<button class="btn" id="rt">Reset and try again</button>';
$("rt").onclick=function(){reset(S.lv)}}
function all(){brief();nav();manifest();inspect();timeline();prog();card()}
function reset(lv){S.lv=lv;S.sel=null;S.hid=false;S.rep={};S.fl={};S.pos={};S.vw={};S.hs={};S.sub=false;S.res=null;$("sh").checked=false;$("nt").value="";$("sub").disabled=false;all()}
$("sh").onchange=function(e){S.hid=e.target.checked;manifest()};
$("sub").onclick=function(){if(S.sub)return;S.sub=true;S.res=score();var nx=ORDER[ORDER.indexOf(S.lv)+1];
if(S.res.tot>=70&&nx){S.un[nx]=1;try{localStorage.setItem("dfl-unlock",JSON.stringify(S.un))}catch(e){}}$("sub").disabled=true;all();$("sp").scrollIntoView({behavior:"smooth",block:"nearest"})};
document.querySelectorAll(".lv").forEach(function(b){b.onclick=function(){if(S.un[b.dataset.l])reset(b.dataset.l)}});
all();
})();