var Ve=Object.defineProperty;var je=(i,n,e)=>n in i?Ve(i,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[n]=e;var k=(i,n,e)=>je(i,typeof n!="symbol"?n+"":n,e);import{r as H}from"./index-K1G2e5ai.js";function We(i){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(i[t]=e[t])}return i}function le(i,n){return Array(n+1).join(i)}function Ae(i){return i.replace(/^\n*/,"")}function xe(i){for(var n=i.length;n>0&&i[n-1]===`
`;)n--;return i.substring(0,n)}function Se(i){return xe(Ae(i))}var Fe=["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"];function oe(i){return ce(i,Fe)}var ke=["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"];function Ce(i){return ce(i,ke)}function Xe(i){return De(i,ke)}var Le=["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"];function ze(i){return ce(i,Le)}function qe(i){return De(i,Le)}function ce(i,n){return n.indexOf(i.nodeName)>=0}function De(i,n){return i.getElementsByTagName&&n.some(function(e){return i.getElementsByTagName(e).length})}var Ye=[[/\\/g,"\\\\"],[/\*/g,"\\*"],[/^-/g,"\\-"],[/^\+ /g,"\\+ "],[/^(=+)/g,"\\$1"],[/^(#{1,6}) /g,"\\$1 "],[/`/g,"\\`"],[/^~~~/g,"\\~~~"],[/\[/g,"\\["],[/\]/g,"\\]"],[/^>/g,"\\>"],[/_/g,"\\_"],[/^(\d+)\. /g,"$1\\. "]];function Ie(i){return Ye.reduce(function(n,e){return n.replace(e[0],e[1])},i)}var x={};x.paragraph={filter:"p",replacement:function(i){return`

`+i+`

`}};x.lineBreak={filter:"br",replacement:function(i,n,e){return e.br+`
`}};x.heading={filter:["h1","h2","h3","h4","h5","h6"],replacement:function(i,n,e){var t=Number(n.nodeName.charAt(1));if(e.headingStyle==="setext"&&t<3){var r=le(t===1?"=":"-",i.length);return`

`+i+`
`+r+`

`}else return`

`+le("#",t)+" "+i+`

`}};x.blockquote={filter:"blockquote",replacement:function(i){return i=Se(i).replace(/^/gm,"> "),`

`+i+`

`}};x.list={filter:["ul","ol"],replacement:function(i,n){var e=n.parentNode;return e.nodeName==="LI"&&e.lastElementChild===n?`
`+i:`

`+i+`

`}};x.listItem={filter:"li",replacement:function(i,n,e){var t=e.bulletListMarker+"   ",r=n.parentNode;if(r.nodeName==="OL"){var a=r.getAttribute("start"),l=Array.prototype.indexOf.call(r.children,n);t=(a?Number(a)+l:l+1)+".  "}var s=/\n$/.test(i);return i=Se(i)+(s?`
`:""),i=i.replace(/\n/gm,`
`+" ".repeat(t.length)),t+i+(n.nextSibling?`
`:"")}};x.indentedCodeBlock={filter:function(i,n){return n.codeBlockStyle==="indented"&&i.nodeName==="PRE"&&i.firstChild&&i.firstChild.nodeName==="CODE"},replacement:function(i,n,e){return`

    `+n.firstChild.textContent.replace(/\n/g,`
    `)+`

`}};x.fencedCodeBlock={filter:function(i,n){return n.codeBlockStyle==="fenced"&&i.nodeName==="PRE"&&i.firstChild&&i.firstChild.nodeName==="CODE"},replacement:function(i,n,e){for(var t=n.firstChild.getAttribute("class")||"",r=(t.match(/language-(\S+)/)||[null,""])[1],a=n.firstChild.textContent,l=e.fence.charAt(0),s=3,o=new RegExp("^"+l+"{3,}","gm"),u;u=o.exec(a);)u[0].length>=s&&(s=u[0].length+1);var h=le(l,s);return`

`+h+r+`
`+a.replace(/\n$/,"")+`
`+h+`

`}};x.horizontalRule={filter:"hr",replacement:function(i,n,e){return`

`+e.hr+`

`}};x.inlineLink={filter:function(i,n){return n.linkStyle==="inlined"&&i.nodeName==="A"&&i.getAttribute("href")},replacement:function(i,n){var e=ue(n.getAttribute("href")),t=he(z(n.getAttribute("title"))),r=t?' "'+t+'"':"";return"["+i+"]("+e+r+")"}};x.referenceLink={filter:function(i,n){return n.linkStyle==="referenced"&&i.nodeName==="A"&&i.getAttribute("href")},replacement:function(i,n,e){var t=ue(n.getAttribute("href")),r=z(n.getAttribute("title"));r&&(r=' "'+he(r)+'"');var a,l;switch(e.linkReferenceStyle){case"collapsed":a="["+i+"][]",l="["+i+"]: "+t+r;break;case"shortcut":a="["+i+"]",l="["+i+"]: "+t+r;break;default:var s=this.references.length+1;a="["+i+"]["+s+"]",l="["+s+"]: "+t+r}return this.references.push(l),a},references:[],append:function(i){var n="";return this.references.length&&(n=`

`+this.references.join(`
`)+`

`,this.references=[]),n}};x.emphasis={filter:["em","i"],replacement:function(i,n,e){return i.trim()?e.emDelimiter+i+e.emDelimiter:""}};x.strong={filter:["strong","b"],replacement:function(i,n,e){return i.trim()?e.strongDelimiter+i+e.strongDelimiter:""}};x.code={filter:function(i){var n=i.previousSibling||i.nextSibling,e=i.parentNode.nodeName==="PRE"&&!n;return i.nodeName==="CODE"&&!e},replacement:function(i){if(!i)return"";i=i.replace(/\r?\n|\r/g," ");for(var n=/^`|^ .*?[^ ].* $|`$/.test(i)?" ":"",e="`",t=i.match(/`+/gm)||[];t.indexOf(e)!==-1;)e=e+"`";return e+n+i+n+e}};x.image={filter:"img",replacement:function(i,n){var e=Ie(z(n.getAttribute("alt"))),t=ue(n.getAttribute("src")||""),r=z(n.getAttribute("title")),a=r?' "'+he(r)+'"':"";return t?"!["+e+"]("+t+a+")":""}};function z(i){return i?i.replace(/(\n+\s*)+/g,`
`):""}function ue(i){var n=i.replace(/([<>()])/g,"\\$1");return n.indexOf(" ")>=0?"<"+n+">":n}function he(i){return i.replace(/"/g,'\\"')}function Re(i){this.options=i,this._keep=[],this._remove=[],this.blankRule={replacement:i.blankReplacement},this.keepReplacement=i.keepReplacement,this.defaultRule={replacement:i.defaultReplacement},this.array=[];for(var n in i.rules)this.array.push(i.rules[n])}Re.prototype={add:function(i,n){this.array.unshift(n)},keep:function(i){this._keep.unshift({filter:i,replacement:this.keepReplacement})},remove:function(i){this._remove.unshift({filter:i,replacement:function(){return""}})},forNode:function(i){if(i.isBlank)return this.blankRule;var n;return(n=ne(this.array,i,this.options))||(n=ne(this._keep,i,this.options))||(n=ne(this._remove,i,this.options))?n:this.defaultRule},forEach:function(i){for(var n=0;n<this.array.length;n++)i(this.array[n],n)}};function ne(i,n,e){for(var t=0;t<i.length;t++){var r=i[t];if(Ke(r,n,e))return r}}function Ke(i,n,e){var t=i.filter;if(typeof t=="string"){if(t===n.nodeName.toLowerCase())return!0}else if(Array.isArray(t)){if(t.indexOf(n.nodeName.toLowerCase())>-1)return!0}else if(typeof t=="function"){if(t.call(i,n,e))return!0}else throw new TypeError("`filter` needs to be a string, array, or function")}function Je(i){var n=i.element,e=i.isBlock,t=i.isVoid,r=i.isPre||function(c){return c.nodeName==="PRE"};if(!(!n.firstChild||r(n))){for(var a=null,l=!1,s=null,o=Ee(s,n,r);o!==n;){if(o.nodeType===3||o.nodeType===4){var u=o.data.replace(/[ \r\n\t]+/g," ");if((!a||/ $/.test(a.data))&&!l&&u[0]===" "&&(u=u.substr(1)),!u){o=ae(o);continue}o.data=u,a=o}else if(o.nodeType===1)e(o)||o.nodeName==="BR"?(a&&(a.data=a.data.replace(/ $/,"")),a=null,l=!1):t(o)||r(o)?(a=null,l=!0):a&&(l=!1);else{o=ae(o);continue}var h=Ee(s,o,r);s=o,o=h}a&&(a.data=a.data.replace(/ $/,""),a.data||ae(a))}}function ae(i){var n=i.nextSibling||i.parentNode;return i.parentNode.removeChild(i),n}function Ee(i,n,e){return i&&i.parentNode===n||e(n)?n.nextSibling||n.parentNode:n.firstChild||n.nextSibling||n.parentNode}var de=typeof window<"u"?window:{};function Qe(){var i=de.DOMParser,n=!1;try{new i().parseFromString("","text/html")&&(n=!0)}catch{}return n}function Ze(){var i=function(){};return et()?i.prototype.parseFromString=function(n){var e=new window.ActiveXObject("htmlfile");return e.designMode="on",e.open(),e.write(n),e.close(),e}:i.prototype.parseFromString=function(n){var e=document.implementation.createHTMLDocument("");return e.open(),e.write(n),e.close(),e},i}function et(){var i=!1;try{document.implementation.createHTMLDocument("").open()}catch{de.ActiveXObject&&(i=!0)}return i}var tt=Qe()?de.DOMParser:Ze();function rt(i,n){var e;if(typeof i=="string"){var t=it().parseFromString('<x-turndown id="turndown-root">'+i+"</x-turndown>","text/html");e=t.getElementById("turndown-root")}else e=i.cloneNode(!0);return Je({element:e,isBlock:oe,isVoid:Ce,isPre:n.preformattedCode?nt:null}),e}var se;function it(){return se=se||new tt,se}function nt(i){return i.nodeName==="PRE"||i.nodeName==="CODE"}function at(i,n){return i.isBlock=oe(i),i.isCode=i.nodeName==="CODE"||i.parentNode.isCode,i.isBlank=st(i),i.flankingWhitespace=lt(i,n),i}function st(i){return!Ce(i)&&!ze(i)&&/^\s*$/i.test(i.textContent)&&!Xe(i)&&!qe(i)}function lt(i,n){if(i.isBlock||n.preformattedCode&&i.isCode)return{leading:"",trailing:""};var e=ot(i.textContent);return e.leadingAscii&&Te("left",i,n)&&(e.leading=e.leadingNonAscii),e.trailingAscii&&Te("right",i,n)&&(e.trailing=e.trailingNonAscii),{leading:e.leading,trailing:e.trailing}}function ot(i){var n=i.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);return{leading:n[1],leadingAscii:n[2],leadingNonAscii:n[3],trailing:n[4],trailingNonAscii:n[5],trailingAscii:n[6]}}function Te(i,n,e){var t,r,a;return i==="left"?(t=n.previousSibling,r=/ $/):(t=n.nextSibling,r=/^ /),t&&(t.nodeType===3?a=r.test(t.nodeValue):e.preformattedCode&&t.nodeName==="CODE"?a=!1:t.nodeType===1&&!oe(t)&&(a=r.test(t.textContent))),a}var ct=Array.prototype.reduce;function q(i){if(!(this instanceof q))return new q(i);var n={rules:x,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",preformattedCode:!1,blankReplacement:function(e,t){return t.isBlock?`

`:""},keepReplacement:function(e,t){return t.isBlock?`

`+t.outerHTML+`

`:t.outerHTML},defaultReplacement:function(e,t){return t.isBlock?`

`+e+`

`:e}};this.options=We({},n,i),this.rules=new Re(this.options)}q.prototype={turndown:function(i){if(!dt(i))throw new TypeError(i+" is not a string, or an element/document/fragment node.");if(i==="")return"";var n=Pe.call(this,new rt(i,this.options));return ut.call(this,n)},use:function(i){if(Array.isArray(i))for(var n=0;n<i.length;n++)this.use(i[n]);else if(typeof i=="function")i(this);else throw new TypeError("plugin must be a Function or an Array of Functions");return this},addRule:function(i,n){return this.rules.add(i,n),this},keep:function(i){return this.rules.keep(i),this},remove:function(i){return this.rules.remove(i),this},escape:function(i){return Ie(i)}};function Pe(i){var n=this;return ct.call(i.childNodes,function(e,t){t=new at(t,n.options);var r="";return t.nodeType===3?r=t.isCode?t.nodeValue:n.escape(t.nodeValue):t.nodeType===1&&(r=ht.call(n,t)),$e(e,r)},"")}function ut(i){var n=this;return this.rules.forEach(function(e){typeof e.append=="function"&&(i=$e(i,e.append(n.options)))}),i.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}function ht(i){var n=this.rules.forNode(i),e=Pe.call(this,i),t=i.flankingWhitespace;return(t.leading||t.trailing)&&(e=e.trim()),t.leading+n.replacement(e,i,this.options)+t.trailing}function $e(i,n){var e=xe(i),t=Ae(n),r=Math.max(i.length-e.length,n.length-t.length),a=`

`.substring(0,r);return e+a+t}function dt(i){return i!=null&&(typeof i=="string"||i.nodeType&&(i.nodeType===1||i.nodeType===9||i.nodeType===11))}var Ne=/highlight-(?:text|source)-([a-z0-9]+)/;function ft(i){i.addRule("highlightedCodeBlock",{filter:function(n){var e=n.firstChild;return n.nodeName==="DIV"&&Ne.test(n.className)&&e&&e.nodeName==="PRE"},replacement:function(n,e,t){var r=e.className||"",a=(r.match(Ne)||[null,""])[1];return`

`+t.fence+a+`
`+e.firstChild.textContent+`
`+t.fence+`

`}})}function mt(i){i.addRule("strikethrough",{filter:["del","s","strike"],replacement:function(n){return"~"+n+"~"}})}var gt=Array.prototype.indexOf,pt=Array.prototype.every,G={};G.tableCell={filter:["th","td"],replacement:function(i,n){return Me(i,n)}};G.tableRow={filter:"tr",replacement:function(i,n){var e="",t={left:":--",right:"--:",center:":-:"};if(fe(n))for(var r=0;r<n.childNodes.length;r++){var a="---",l=(n.childNodes[r].getAttribute("align")||"").toLowerCase();l&&(a=t[l]||a),e+=Me(a,n.childNodes[r])}return`
`+i+(e?`
`+e:"")}};G.table={filter:function(i){return i.nodeName==="TABLE"&&fe(i.rows[0])},replacement:function(i){return i=i.replace(`

`,`
`),`

`+i+`

`}};G.tableSection={filter:["thead","tbody","tfoot"],replacement:function(i){return i}};function fe(i){var n=i.parentNode;return n.nodeName==="THEAD"||n.firstChild===i&&(n.nodeName==="TABLE"||vt(n))&&pt.call(i.childNodes,function(e){return e.nodeName==="TH"})}function vt(i){var n=i.previousSibling;return i.nodeName==="TBODY"&&(!n||n.nodeName==="THEAD"&&/^\s*$/i.test(n.textContent))}function Me(i,n){var e=gt.call(n.parentNode.childNodes,n),t=" ";return e===0&&(t="| "),t+i+" |"}function yt(i){i.keep(function(e){return e.nodeName==="TABLE"&&!fe(e.rows[0])});for(var n in G)i.addRule(n,G[n])}function bt(i){i.addRule("taskListItems",{filter:function(n){return n.type==="checkbox"&&n.parentNode.nodeName==="LI"},replacement:function(n,e){return(e.checked?"[x]":"[ ]")+" "}})}function _t(i){i.use([ft,mt,yt,bt])}const Y=new q({headingStyle:"atx",hr:"---",bulletListMarker:"-",codeBlockStyle:"fenced",emDelimiter:"*"});Y.use(_t);Y.addRule("detailsRule",{filter:"details",replacement:function(i,n){var a;const t=((a=n.querySelector("summary"))==null?void 0:a.textContent)||"思考过程 (Thinking)",r=i.replace(t,"").trim();return`

<details>
<summary>${t}</summary>

${r}

</details>

`}});Y.addRule("fencedCodeBlock",{filter:function(i){return i.nodeName==="PRE"&&i.firstChild!==null&&i.firstChild.nodeName==="CODE"},replacement:function(i,n){const e=n.firstChild,r=(e.getAttribute("class")||"").match(/(?:language|lang)-(\w+)/);return`

\`\`\`${r?r[1]:""}
${e.textContent||""}
\`\`\`

`}});function P(i){return i?Y.turndown(i):""}class Et{constructor(){k(this,"id","deepseek");k(this,"name","DeepSeek Chat")}matches(n){return n.includes("chat.deepseek.com")}detectTurns(){return Array.from(document.querySelectorAll('.ds-markdown, div[class*="ds-markdown"], div[class*="chat-message"]')).filter(e=>!e.closest(".user-message")&&e.textContent&&e.textContent.trim().length>0)}extractTurn(n){var e,t;try{let r="";const a=n.querySelector('.ds-think, div[class*="think"], .ds-collapse');a&&(r=P(a.innerHTML).trim());const l=n.cloneNode(!0),s=l.querySelector('.ds-think, div[class*="think"], .ds-collapse');s&&s.remove();const o=P(l.innerHTML).trim();let u="",h=(e=n.parentElement)==null?void 0:e.previousElementSibling;for(;h;){const p=(t=h.textContent)==null?void 0:t.trim();if(p&&p.length>0){u=p;break}h=h.previousElementSibling}u||(u="用户在 DeepSeek 上的提问");const c=(typeof window<"u"?window.location.href:"")||"https://chat.deepseek.com";let d=`# 🤖 DeepSeek 对话轮次

> 🌐 **来源地址**: [${c}](${c})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: DeepSeek-V3 / R1

---

### ❓ Prompt

${u}

`;return r&&(d+=`<details>
<summary>🧠 思考过程 (DeepSeek Thinking)</summary>

${r}

</details>

`),d+=`### 💡 DeepSeek 回答

${o}

`,{prompt:u,answer:o,thinking:r,modelName:"DeepSeek-V3 / R1",markdown:d}}catch(r){return console.warn("解析 DeepSeek 对话轮次失败",r),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,l)=>{const s=this.extractTurn(a);s&&(s.turnIndex=l+1,e.push(s))});const t=document.title.replace("- DeepSeek","").trim()||"DeepSeek 对话会话";let r=`# ${t}

> 来源: [DeepSeek Chat](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,l)=>{r+=`## 轮次 ${l+1}

${a.markdown}
---

`}),{title:t,modelName:"DeepSeek-V3 / R1",turns:e,markdown:r}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=document.createElement("button");r.className="dsh-chat-inject-btn",r.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,r.title="将此轮对话（提示词 + 思考过程 + 回答）保存至 DSH 知识库",r.onclick=a=>{a.stopPropagation(),a.preventDefault();const l=this.extractTurn(t);l&&(r.innerText="已存入 ✓",setTimeout(()=>{r.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(l))},t.style.position="relative",t.prepend(r)})}}class Tt{constructor(){k(this,"id","chatgpt");k(this,"name","ChatGPT")}matches(n){return n.includes("chatgpt.com")||n.includes("chat.openai.com")}detectTurns(){return Array.from(document.querySelectorAll('[data-message-author-role="assistant"]'))}extractTurn(n){var e,t;try{const r=n.querySelector(".markdown")||n,a=P(r.innerHTML).trim();let l="";const s=n.closest('[data-testid^="conversation-turn"]')||n.parentElement,o=s==null?void 0:s.previousElementSibling;if(o){const p=o.querySelector('[data-message-author-role="user"]');p&&(l=((e=p.textContent)==null?void 0:e.trim())||"")}l||(l="ChatGPT 对话提问");let u="";const h=n.querySelector('[data-testid="thought"], div[class*="thought"]');h&&(u=((t=h.textContent)==null?void 0:t.trim())||"");const c=(typeof window<"u"?window.location.href:"")||"https://chatgpt.com";let d=`# 💬 ChatGPT 对话轮次

> 🌐 **来源地址**: [${c}](${c})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: ChatGPT (OpenAI)

---

### ❓ Prompt

${l}

`;return u&&(d+=`<details>
<summary>🧠 ChatGPT 思考过程 (Thought Chain)</summary>

${u}

</details>

`),d+=`### 💡 ChatGPT 回答

${a}

`,{prompt:l,answer:a,thinking:u,modelName:"ChatGPT (OpenAI)",markdown:d}}catch(r){return console.warn("解析 ChatGPT 轮次失败",r),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,l)=>{const s=this.extractTurn(a);s&&(s.turnIndex=l+1,e.push(s))});const t=document.title.replace("- ChatGPT","").trim()||"ChatGPT 对话记录";let r=`# ${t}

> 来源: [ChatGPT](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,l)=>{r+=`## 轮次 ${l+1}

${a.markdown}
---

`}),{title:t,modelName:"ChatGPT",turns:e,markdown:r}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=t.querySelector('div[class*="items-center"], div[class*="text-gray-500"]')||t,a=document.createElement("button");a.className="dsh-chat-inject-btn",a.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,a.onclick=l=>{l.stopPropagation(),l.preventDefault();const s=this.extractTurn(t);s&&(a.innerText="已存入 ✓",setTimeout(()=>{a.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(s))},r.appendChild(a)})}}class Nt{constructor(){k(this,"id","claude");k(this,"name","Claude AI")}matches(n){return n.includes("claude.ai")}detectTurns(){return Array.from(document.querySelectorAll('.font-claude-message, [data-is-streaming], div[class*="font-claude"]'))}extractTurn(n){var e,t;try{let r="";const a=n.querySelector('[data-testid="thought-box"], div[class*="thought"]');a&&(r=((e=a.textContent)==null?void 0:e.trim())||"");const l=n.cloneNode(!0),s=l.querySelector('[data-testid="thought-box"], div[class*="thought"]');s&&s.remove();const o=P(l.innerHTML).trim();let u="";const h=n.closest('[data-testid^="chat-turn"]')||n.parentElement,c=h==null?void 0:h.previousElementSibling;c&&(u=((t=c.textContent)==null?void 0:t.trim())||""),u||(u="Claude 提问");const d=(typeof window<"u"?window.location.href:"")||"https://claude.ai";let p=`# 🧠 Claude 对话轮次

> 🌐 **来源地址**: [${d}](${d})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Claude 3.5 / 3.7

---

### ❓ Prompt

${u}

`;return r&&(p+=`<details>
<summary>🧠 Claude 扩展思考过程 (Extended Thinking)</summary>

${r}

</details>

`),p+=`### 💡 Claude 回答

${o}

`,{prompt:u,answer:o,thinking:r,modelName:"Claude 3.5 / 3.7",markdown:p}}catch(r){return console.warn("解析 Claude 轮次失败",r),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,l)=>{const s=this.extractTurn(a);s&&(s.turnIndex=l+1,e.push(s))});const t=document.title.replace("- Claude","").trim()||"Claude 对话归档";let r=`# ${t}

> 来源: [Claude.ai](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,l)=>{r+=`## 轮次 ${l+1}

${a.markdown}
---

`}),{title:t,modelName:"Claude 3.5 / 3.7",turns:e,markdown:r}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=document.createElement("button");r.className="dsh-chat-inject-btn",r.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,r.onclick=a=>{a.stopPropagation(),a.preventDefault();const l=this.extractTurn(t);l&&(r.innerText="已存入 ✓",setTimeout(()=>{r.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(l))},t.appendChild(r)})}}class wt{constructor(){k(this,"id","gemini");k(this,"name","Google Gemini")}matches(n){return n.includes("gemini.google.com")}detectTurns(){return Array.from(document.querySelectorAll('model-response, message-content, div[class*="model-response"]'))}extractTurn(n){var e,t;try{const r=P(n.innerHTML).trim();let a="Gemini 提问";const l=(e=n.closest(".conversation-container"))==null?void 0:e.querySelector(".user-query");l&&(a=((t=l.textContent)==null?void 0:t.trim())||a);const s=(typeof window<"u"?window.location.href:"")||"https://gemini.google.com";return{prompt:a,answer:r,modelName:"Google Gemini",markdown:`# ✨ Gemini 对话轮次

> 🌐 **来源地址**: [${s}](${s})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Google Gemini

---

### ❓ Prompt

${a}

### 💡 Gemini 回答

${r}

`}}catch{return null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,l)=>{const s=this.extractTurn(a);s&&(s.turnIndex=l+1,e.push(s))});const t=document.title.replace("- Gemini","").trim()||"Gemini 对话记录";let r=`# ${t}

> 来源: [Gemini](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,l)=>{r+=`## 轮次 ${l+1}

${a.markdown}
---

`}),{title:t,modelName:"Google Gemini",turns:e,markdown:r}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=document.createElement("button");r.className="dsh-chat-inject-btn",r.innerHTML="存入 DSH",r.onclick=a=>{a.stopPropagation(),a.preventDefault();const l=this.extractTurn(t);l&&(r.innerText="已存入 ✓",setTimeout(()=>{r.innerText="存入 DSH"},2e3),n(l))},t.appendChild(r)})}}class At{constructor(){k(this,"id","doubao");k(this,"name","豆包 (Doubao)")}matches(n){return n.includes("doubao.com")}detectTurns(){return Array.from(document.querySelectorAll('div[class*="assistant-bubble"], div[data-testid="assistant_message"]'))}extractTurn(n){const e=P(n.innerHTML).trim(),t=(typeof window<"u"?window.location.href:"")||"https://www.doubao.com";return{prompt:"豆包对话提问",answer:e,modelName:"Doubao",markdown:`# 🌰 豆包对话轮次

> 🌐 **来源地址**: [${t}](${t})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Doubao

---

### 💡 豆包回答

${e}

`}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=n.map((r,a)=>{const l=this.extractTurn(r);return l.turnIndex=a+1,l}),t=(typeof window<"u"?window.location.href:"")||"https://www.doubao.com";return{title:document.title||"豆包对话记录",modelName:"Doubao",turns:e,markdown:`# 豆包对话归档

> 🌐 **来源地址**: [${t}](${t})
> ⏰ **归档时间**: ${new Date().toLocaleString()}

---

`+e.map(r=>r.markdown).join(`
---
`)}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=document.createElement("button");r.className="dsh-chat-inject-btn",r.innerText="存入 DSH",r.onclick=()=>{const a=this.extractTurn(t);a&&n(a)},t.appendChild(r)})}}class xt{constructor(){k(this,"id","grok");k(this,"name","xAI Grok")}matches(n){return n.includes("grok.com")||n.includes("x.com/i/grok")}detectTurns(){return Array.from(document.querySelectorAll('div[class*="response-message"], div[data-testid="grok-response"]'))}extractTurn(n){const e=P(n.innerHTML).trim(),t=(typeof window<"u"?window.location.href:"")||"https://grok.com";return{prompt:"Grok 提问",answer:e,modelName:"xAI Grok",markdown:`# ⚡ Grok 对话轮次

> 🌐 **来源地址**: [${t}](${t})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: xAI Grok

---

### 💡 Grok 回答

${e}

`}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=n.map((r,a)=>{const l=this.extractTurn(r);return l.turnIndex=a+1,l}),t=(typeof window<"u"?window.location.href:"")||"https://grok.com";return{title:document.title||"Grok 对话记录",modelName:"xAI Grok",turns:e,markdown:`# Grok 对话归档

> 🌐 **来源地址**: [${t}](${t})
> ⏰ **归档时间**: ${new Date().toLocaleString()}

---

`+e.map(r=>r.markdown).join(`
---
`)}}injectUI(n){this.detectTurns().forEach(t=>{if(t.dataset.dshInjected==="true")return;t.dataset.dshInjected="true";const r=document.createElement("button");r.className="dsh-chat-inject-btn",r.innerText="存入 DSH",r.onclick=()=>{const a=this.extractTurn(t);a&&n(a)},t.appendChild(r)})}}class St{constructor(){k(this,"adapters",[new Et,new Tt,new Nt,new wt,new At,new xt])}findAdapter(n){return this.adapters.find(e=>e.matches(n))||null}}const Be=new St;var He={exports:{}};(function(i){function n(e,t){if(t&&t.documentElement)e=t,t=arguments[2];else if(!e||!e.documentElement)throw new Error("First argument to Readability constructor should be a document object.");if(t=t||{},this._doc=e,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!t.debug,this._maxElemsToParse=t.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=t.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=t.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(t.classesToPreserve||[]),this._keepClasses=!!t.keepClasses,this._serializer=t.serializer||function(r){return r.innerHTML},this._disableJSONLD=!!t.disableJSONLD,this._allowedVideoRegex=t.allowedVideoRegex||this.REGEXPS.videos,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let r=function(a){if(a.nodeType==a.TEXT_NODE)return`${a.nodeName} ("${a.textContent}")`;let l=Array.from(a.attributes||[],function(s){return`${s.name}="${s.value}"`}).join(" ");return`<${a.localName} ${l}>`};this.log=function(){if(typeof console<"u"){let l=Array.from(arguments,s=>s&&s.nodeType==this.ELEMENT_NODE?r(s):s);l.unshift("Reader: (Readability)"),console.log.apply(console,l)}else if(typeof dump<"u"){var a=Array.prototype.map.call(arguments,function(l){return l&&l.nodeName?r(l):l}).join(" ");dump("Reader: (Readability) "+a+`
`)}}}else this.log=function(){}}n.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:"section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,shareElements:/(\b|_)(share|sharedaddy)(\b|_)/i,nextLink:/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\W+/g,whitespace:/^\s*$/,hasContent:/\S$/,hashUrl:/^#.+/,srcsetUrl:/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,b64DataUrl:/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,commas:/\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/},UNLIKELY_ROLES:["menu","menubar","complementary","navigation","alert","alertdialog","dialog"],DIV_TO_P_ELEMS:new Set(["BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL"]),ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P"],PRESENTATIONAL_ATTRIBUTES:["align","background","bgcolor","border","cellpadding","cellspacing","frame","hspace","rules","style","valign","vspace"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:["TABLE","TH","TD","HR","PRE"],PHRASING_ELEMS:["ABBR","AUDIO","B","BDO","BR","BUTTON","CITE","CODE","DATA","DATALIST","DFN","EM","EMBED","I","IMG","INPUT","KBD","LABEL","MARK","MATH","METER","NOSCRIPT","OBJECT","OUTPUT","PROGRESS","Q","RUBY","SAMP","SCRIPT","SELECT","SMALL","SPAN","STRONG","SUB","SUP","TEXTAREA","TIME","VAR","WBR"],CLASSES_TO_PRESERVE:["page"],HTML_ESCAPE_MAP:{lt:"<",gt:">",amp:"&",quot:'"',apos:"'"},_postProcessContent:function(e){this._fixRelativeUris(e),this._simplifyNestedElements(e),this._keepClasses||this._cleanClasses(e)},_removeNodes:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _removeNodes");for(var r=e.length-1;r>=0;r--){var a=e[r],l=a.parentNode;l&&(!t||t.call(this,a,r,e))&&l.removeChild(a)}},_replaceNodeTags:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _replaceNodeTags");for(const r of e)this._setNodeTag(r,t)},_forEachNode:function(e,t){Array.prototype.forEach.call(e,t,this)},_findNode:function(e,t){return Array.prototype.find.call(e,t,this)},_someNode:function(e,t){return Array.prototype.some.call(e,t,this)},_everyNode:function(e,t){return Array.prototype.every.call(e,t,this)},_concatNodeLists:function(){var e=Array.prototype.slice,t=e.call(arguments),r=t.map(function(a){return e.call(a)});return Array.prototype.concat.apply([],r)},_getAllNodesWithTag:function(e,t){return e.querySelectorAll?e.querySelectorAll(t.join(",")):[].concat.apply([],t.map(function(r){var a=e.getElementsByTagName(r);return Array.isArray(a)?a:Array.from(a)}))},_cleanClasses:function(e){var t=this._classesToPreserve,r=(e.getAttribute("class")||"").split(/\s+/).filter(function(a){return t.indexOf(a)!=-1}).join(" ");for(r?e.setAttribute("class",r):e.removeAttribute("class"),e=e.firstElementChild;e;e=e.nextElementSibling)this._cleanClasses(e)},_fixRelativeUris:function(e){var t=this._doc.baseURI,r=this._doc.documentURI;function a(o){if(t==r&&o.charAt(0)=="#")return o;try{return new URL(o,t).href}catch{}return o}var l=this._getAllNodesWithTag(e,["a"]);this._forEachNode(l,function(o){var u=o.getAttribute("href");if(u)if(u.indexOf("javascript:")===0)if(o.childNodes.length===1&&o.childNodes[0].nodeType===this.TEXT_NODE){var h=this._doc.createTextNode(o.textContent);o.parentNode.replaceChild(h,o)}else{for(var c=this._doc.createElement("span");o.firstChild;)c.appendChild(o.firstChild);o.parentNode.replaceChild(c,o)}else o.setAttribute("href",a(u))});var s=this._getAllNodesWithTag(e,["img","picture","figure","video","audio","source"]);this._forEachNode(s,function(o){var u=o.getAttribute("src"),h=o.getAttribute("poster"),c=o.getAttribute("srcset");if(u&&o.setAttribute("src",a(u)),h&&o.setAttribute("poster",a(h)),c){var d=c.replace(this.REGEXPS.srcsetUrl,function(p,S,v,N){return a(S)+(v||"")+N});o.setAttribute("srcset",d)}})},_simplifyNestedElements:function(e){for(var t=e;t;){if(t.parentNode&&["DIV","SECTION"].includes(t.tagName)&&!(t.id&&t.id.startsWith("readability"))){if(this._isElementWithoutContent(t)){t=this._removeAndGetNext(t);continue}else if(this._hasSingleTagInsideElement(t,"DIV")||this._hasSingleTagInsideElement(t,"SECTION")){for(var r=t.children[0],a=0;a<t.attributes.length;a++)r.setAttribute(t.attributes[a].name,t.attributes[a].value);t.parentNode.replaceChild(r,t),t=r;continue}}t=this._getNextNode(t)}},_getArticleTitle:function(){var e=this._doc,t="",r="";try{t=r=e.title.trim(),typeof t!="string"&&(t=r=this._getInnerText(e.getElementsByTagName("title")[0]))}catch{}var a=!1;function l(d){return d.split(/\s+/).length}if(/ [\|\-\\\/>»] /.test(t))a=/ [\\\/>»] /.test(t),t=r.replace(/(.*)[\|\-\\\/>»] .*/gi,"$1"),l(t)<3&&(t=r.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi,"$1"));else if(t.indexOf(": ")!==-1){var s=this._concatNodeLists(e.getElementsByTagName("h1"),e.getElementsByTagName("h2")),o=t.trim(),u=this._someNode(s,function(d){return d.textContent.trim()===o});u||(t=r.substring(r.lastIndexOf(":")+1),l(t)<3?t=r.substring(r.indexOf(":")+1):l(r.substr(0,r.indexOf(":")))>5&&(t=r))}else if(t.length>150||t.length<15){var h=e.getElementsByTagName("h1");h.length===1&&(t=this._getInnerText(h[0]))}t=t.trim().replace(this.REGEXPS.normalize," ");var c=l(t);return c<=4&&(!a||c!=l(r.replace(/[\|\-\\\/>»]+/g,""))-1)&&(t=r),t},_prepDocument:function(){var e=this._doc;this._removeNodes(this._getAllNodesWithTag(e,["style"])),e.body&&this._replaceBrs(e.body),this._replaceNodeTags(this._getAllNodesWithTag(e,["font"]),"SPAN")},_nextNode:function(e){for(var t=e;t&&t.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(t.textContent);)t=t.nextSibling;return t},_replaceBrs:function(e){this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(t){for(var r=t.nextSibling,a=!1;(r=this._nextNode(r))&&r.tagName=="BR";){a=!0;var l=r.nextSibling;r.parentNode.removeChild(r),r=l}if(a){var s=this._doc.createElement("p");for(t.parentNode.replaceChild(s,t),r=s.nextSibling;r;){if(r.tagName=="BR"){var o=this._nextNode(r.nextSibling);if(o&&o.tagName=="BR")break}if(!this._isPhrasingContent(r))break;var u=r.nextSibling;s.appendChild(r),r=u}for(;s.lastChild&&this._isWhitespace(s.lastChild);)s.removeChild(s.lastChild);s.parentNode.tagName==="P"&&this._setNodeTag(s.parentNode,"DIV")}})},_setNodeTag:function(e,t){if(this.log("_setNodeTag",e,t),this._docJSDOMParser)return e.localName=t.toLowerCase(),e.tagName=t.toUpperCase(),e;for(var r=e.ownerDocument.createElement(t);e.firstChild;)r.appendChild(e.firstChild);e.parentNode.replaceChild(r,e),e.readability&&(r.readability=e.readability);for(var a=0;a<e.attributes.length;a++)try{r.setAttribute(e.attributes[a].name,e.attributes[a].value)}catch{}return r},_prepArticle:function(e){this._cleanStyles(e),this._markDataTables(e),this._fixLazyImages(e),this._cleanConditionally(e,"form"),this._cleanConditionally(e,"fieldset"),this._clean(e,"object"),this._clean(e,"embed"),this._clean(e,"footer"),this._clean(e,"link"),this._clean(e,"aside");var t=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(e.children,function(r){this._cleanMatchedNodes(r,function(a,l){return this.REGEXPS.shareElements.test(l)&&a.textContent.length<t})}),this._clean(e,"iframe"),this._clean(e,"input"),this._clean(e,"textarea"),this._clean(e,"select"),this._clean(e,"button"),this._cleanHeaders(e),this._cleanConditionally(e,"table"),this._cleanConditionally(e,"ul"),this._cleanConditionally(e,"div"),this._replaceNodeTags(this._getAllNodesWithTag(e,["h1"]),"h2"),this._removeNodes(this._getAllNodesWithTag(e,["p"]),function(r){var a=r.getElementsByTagName("img").length,l=r.getElementsByTagName("embed").length,s=r.getElementsByTagName("object").length,o=r.getElementsByTagName("iframe").length,u=a+l+s+o;return u===0&&!this._getInnerText(r,!1)}),this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(r){var a=this._nextNode(r.nextSibling);a&&a.tagName=="P"&&r.parentNode.removeChild(r)}),this._forEachNode(this._getAllNodesWithTag(e,["table"]),function(r){var a=this._hasSingleTagInsideElement(r,"TBODY")?r.firstElementChild:r;if(this._hasSingleTagInsideElement(a,"TR")){var l=a.firstElementChild;if(this._hasSingleTagInsideElement(l,"TD")){var s=l.firstElementChild;s=this._setNodeTag(s,this._everyNode(s.childNodes,this._isPhrasingContent)?"P":"DIV"),r.parentNode.replaceChild(s,r)}}})},_initializeNode:function(e){switch(e.readability={contentScore:0},e.tagName){case"DIV":e.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":e.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":e.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":e.readability.contentScore-=5;break}e.readability.contentScore+=this._getClassWeight(e)},_removeAndGetNext:function(e){var t=this._getNextNode(e,!0);return e.parentNode.removeChild(e),t},_getNextNode:function(e,t){if(!t&&e.firstElementChild)return e.firstElementChild;if(e.nextElementSibling)return e.nextElementSibling;do e=e.parentNode;while(e&&!e.nextElementSibling);return e&&e.nextElementSibling},_textSimilarity:function(e,t){var r=e.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),a=t.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);if(!r.length||!a.length)return 0;var l=a.filter(o=>!r.includes(o)),s=l.join(" ").length/a.join(" ").length;return 1-s},_checkByline:function(e,t){if(this._articleByline)return!1;if(e.getAttribute!==void 0)var r=e.getAttribute("rel"),a=e.getAttribute("itemprop");return(r==="author"||a&&a.indexOf("author")!==-1||this.REGEXPS.byline.test(t))&&this._isValidByline(e.textContent)?(this._articleByline=e.textContent.trim(),!0):!1},_getNodeAncestors:function(e,t){t=t||0;for(var r=0,a=[];e.parentNode&&(a.push(e.parentNode),!(t&&++r===t));)e=e.parentNode;return a},_grabArticle:function(e){this.log("**** grabArticle ****");var t=this._doc,r=e!==null;if(e=e||this._doc.body,!e)return this.log("No body found in document. Abort."),null;for(var a=e.innerHTML;;){this.log("Starting grabArticle loop");var l=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),s=[],o=this._doc.documentElement;let be=!0;for(;o;){o.tagName==="HTML"&&(this._articleLang=o.getAttribute("lang"));var u=o.className+" "+o.id;if(!this._isProbablyVisible(o)){this.log("Removing hidden node - "+u),o=this._removeAndGetNext(o);continue}if(o.getAttribute("aria-modal")=="true"&&o.getAttribute("role")=="dialog"){o=this._removeAndGetNext(o);continue}if(this._checkByline(o,u)){o=this._removeAndGetNext(o);continue}if(be&&this._headerDuplicatesTitle(o)){this.log("Removing header: ",o.textContent.trim(),this._articleTitle.trim()),be=!1,o=this._removeAndGetNext(o);continue}if(l){if(this.REGEXPS.unlikelyCandidates.test(u)&&!this.REGEXPS.okMaybeItsACandidate.test(u)&&!this._hasAncestorTag(o,"table")&&!this._hasAncestorTag(o,"code")&&o.tagName!=="BODY"&&o.tagName!=="A"){this.log("Removing unlikely candidate - "+u),o=this._removeAndGetNext(o);continue}if(this.UNLIKELY_ROLES.includes(o.getAttribute("role"))){this.log("Removing content with role "+o.getAttribute("role")+" - "+u),o=this._removeAndGetNext(o);continue}}if((o.tagName==="DIV"||o.tagName==="SECTION"||o.tagName==="HEADER"||o.tagName==="H1"||o.tagName==="H2"||o.tagName==="H3"||o.tagName==="H4"||o.tagName==="H5"||o.tagName==="H6")&&this._isElementWithoutContent(o)){o=this._removeAndGetNext(o);continue}if(this.DEFAULT_TAGS_TO_SCORE.indexOf(o.tagName)!==-1&&s.push(o),o.tagName==="DIV"){for(var h=null,c=o.firstChild;c;){var d=c.nextSibling;if(this._isPhrasingContent(c))h!==null?h.appendChild(c):this._isWhitespace(c)||(h=t.createElement("p"),o.replaceChild(h,c),h.appendChild(c));else if(h!==null){for(;h.lastChild&&this._isWhitespace(h.lastChild);)h.removeChild(h.lastChild);h=null}c=d}if(this._hasSingleTagInsideElement(o,"P")&&this._getLinkDensity(o)<.25){var p=o.children[0];o.parentNode.replaceChild(p,o),o=p,s.push(o)}else this._hasChildBlockElement(o)||(o=this._setNodeTag(o,"P"),s.push(o))}o=this._getNextNode(o)}var S=[];this._forEachNode(s,function(D){if(!(!D.parentNode||typeof D.parentNode.tagName>"u")){var I=this._getInnerText(D);if(!(I.length<25)){var _e=this._getNodeAncestors(D,5);if(_e.length!==0){var X=0;X+=1,X+=I.split(this.REGEXPS.commas).length,X+=Math.min(Math.floor(I.length/100),3),this._forEachNode(_e,function(M,re){if(!(!M.tagName||!M.parentNode||typeof M.parentNode.tagName>"u")){if(typeof M.readability>"u"&&(this._initializeNode(M),S.push(M)),re===0)var ie=1;else re===1?ie=2:ie=re*3;M.readability.contentScore+=X/ie}})}}}});for(var v=[],N=0,_=S.length;N<_;N+=1){var E=S[N],w=E.readability.contentScore*(1-this._getLinkDensity(E));E.readability.contentScore=w,this.log("Candidate:",E,"with score "+w);for(var g=0;g<this._nbTopCandidates;g++){var y=v[g];if(!y||w>y.readability.contentScore){v.splice(g,0,E),v.length>this._nbTopCandidates&&v.pop();break}}}var m=v[0]||null,b=!1,f;if(m===null||m.tagName==="BODY"){for(m=t.createElement("DIV"),b=!0;e.firstChild;)this.log("Moving child out:",e.firstChild),m.appendChild(e.firstChild);e.appendChild(m),this._initializeNode(m)}else if(m){for(var L=[],$=1;$<v.length;$++)v[$].readability.contentScore/m.readability.contentScore>=.75&&L.push(this._getNodeAncestors(v[$]));var U=3;if(L.length>=U)for(f=m.parentNode;f.tagName!=="BODY";){for(var K=0,J=0;J<L.length&&K<U;J++)K+=Number(L[J].includes(f));if(K>=U){m=f;break}f=f.parentNode}m.readability||this._initializeNode(m),f=m.parentNode;for(var Q=m.readability.contentScore,Oe=Q/3;f.tagName!=="BODY";){if(!f.readability){f=f.parentNode;continue}var me=f.readability.contentScore;if(me<Oe)break;if(me>Q){m=f;break}Q=f.readability.contentScore,f=f.parentNode}for(f=m.parentNode;f.tagName!="BODY"&&f.children.length==1;)m=f,f=m.parentNode;m.readability||this._initializeNode(m)}var A=t.createElement("DIV");r&&(A.id="readability-content");var Ue=Math.max(10,m.readability.contentScore*.2);f=m.parentNode;for(var Z=f.children,W=0,ge=Z.length;W<ge;W++){var T=Z[W],V=!1;if(this.log("Looking at sibling node:",T,T.readability?"with score "+T.readability.contentScore:""),this.log("Sibling has score",T.readability?T.readability.contentScore:"Unknown"),T===m)V=!0;else{var pe=0;if(T.className===m.className&&m.className!==""&&(pe+=m.readability.contentScore*.2),T.readability&&T.readability.contentScore+pe>=Ue)V=!0;else if(T.nodeName==="P"){var ve=this._getLinkDensity(T),ye=this._getInnerText(T),ee=ye.length;(ee>80&&ve<.25||ee<80&&ee>0&&ve===0&&ye.search(/\.( |$)/)!==-1)&&(V=!0)}}V&&(this.log("Appending node:",T),this.ALTER_TO_DIV_EXCEPTIONS.indexOf(T.nodeName)===-1&&(this.log("Altering sibling:",T,"to div."),T=this._setNodeTag(T,"DIV")),A.appendChild(T),Z=f.children,W-=1,ge-=1)}if(this._debug&&this.log("Article content pre-prep: "+A.innerHTML),this._prepArticle(A),this._debug&&this.log("Article content post-prep: "+A.innerHTML),b)m.id="readability-page-1",m.className="page";else{var F=t.createElement("DIV");for(F.id="readability-page-1",F.className="page";A.firstChild;)F.appendChild(A.firstChild);A.appendChild(F)}this._debug&&this.log("Article content after paging: "+A.innerHTML);var te=!0,j=this._getInnerText(A,!0).length;if(j<this._charThreshold)if(te=!1,e.innerHTML=a,this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS),this._attempts.push({articleContent:A,textLength:j});else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES),this._attempts.push({articleContent:A,textLength:j});else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),this._attempts.push({articleContent:A,textLength:j});else{if(this._attempts.push({articleContent:A,textLength:j}),this._attempts.sort(function(D,I){return I.textLength-D.textLength}),!this._attempts[0].textLength)return null;A=this._attempts[0].articleContent,te=!0}if(te){var Ge=[f,m].concat(this._getNodeAncestors(f));return this._someNode(Ge,function(D){if(!D.tagName)return!1;var I=D.getAttribute("dir");return I?(this._articleDir=I,!0):!1}),A}}},_isValidByline:function(e){return typeof e=="string"||e instanceof String?(e=e.trim(),e.length>0&&e.length<100):!1},_unescapeHtmlEntities:function(e){if(!e)return e;var t=this.HTML_ESCAPE_MAP;return e.replace(/&(quot|amp|apos|lt|gt);/g,function(r,a){return t[a]}).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi,function(r,a,l){var s=parseInt(a||l,a?16:10);return String.fromCharCode(s)})},_getJSONLD:function(e){var t=this._getAllNodesWithTag(e,["script"]),r;return this._forEachNode(t,function(a){if(!r&&a.getAttribute("type")==="application/ld+json")try{var l=a.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,""),s=JSON.parse(l);if(!s["@context"]||!s["@context"].match(/^https?\:\/\/schema\.org$/)||(!s["@type"]&&Array.isArray(s["@graph"])&&(s=s["@graph"].find(function(c){return(c["@type"]||"").match(this.REGEXPS.jsonLdArticleTypes)})),!s||!s["@type"]||!s["@type"].match(this.REGEXPS.jsonLdArticleTypes)))return;if(r={},typeof s.name=="string"&&typeof s.headline=="string"&&s.name!==s.headline){var o=this._getArticleTitle(),u=this._textSimilarity(s.name,o)>.75,h=this._textSimilarity(s.headline,o)>.75;h&&!u?r.title=s.headline:r.title=s.name}else typeof s.name=="string"?r.title=s.name.trim():typeof s.headline=="string"&&(r.title=s.headline.trim());s.author&&(typeof s.author.name=="string"?r.byline=s.author.name.trim():Array.isArray(s.author)&&s.author[0]&&typeof s.author[0].name=="string"&&(r.byline=s.author.filter(function(c){return c&&typeof c.name=="string"}).map(function(c){return c.name.trim()}).join(", "))),typeof s.description=="string"&&(r.excerpt=s.description.trim()),s.publisher&&typeof s.publisher.name=="string"&&(r.siteName=s.publisher.name.trim()),typeof s.datePublished=="string"&&(r.datePublished=s.datePublished.trim());return}catch(c){this.log(c.message)}}),r||{}},_getArticleMetadata:function(e){var t={},r={},a=this._doc.getElementsByTagName("meta"),l=/\s*(article|dc|dcterm|og|twitter)\s*:\s*(author|creator|description|published_time|title|site_name)\s*/gi,s=/^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;return this._forEachNode(a,function(o){var u=o.getAttribute("name"),h=o.getAttribute("property"),c=o.getAttribute("content");if(c){var d=null,p=null;h&&(d=h.match(l),d&&(p=d[0].toLowerCase().replace(/\s/g,""),r[p]=c.trim())),!d&&u&&s.test(u)&&(p=u,c&&(p=p.toLowerCase().replace(/\s/g,"").replace(/\./g,":"),r[p]=c.trim()))}}),t.title=e.title||r["dc:title"]||r["dcterm:title"]||r["og:title"]||r["weibo:article:title"]||r["weibo:webpage:title"]||r.title||r["twitter:title"],t.title||(t.title=this._getArticleTitle()),t.byline=e.byline||r["dc:creator"]||r["dcterm:creator"]||r.author,t.excerpt=e.excerpt||r["dc:description"]||r["dcterm:description"]||r["og:description"]||r["weibo:article:description"]||r["weibo:webpage:description"]||r.description||r["twitter:description"],t.siteName=e.siteName||r["og:site_name"],t.publishedTime=e.datePublished||r["article:published_time"]||null,t.title=this._unescapeHtmlEntities(t.title),t.byline=this._unescapeHtmlEntities(t.byline),t.excerpt=this._unescapeHtmlEntities(t.excerpt),t.siteName=this._unescapeHtmlEntities(t.siteName),t.publishedTime=this._unescapeHtmlEntities(t.publishedTime),t},_isSingleImage:function(e){return e.tagName==="IMG"?!0:e.children.length!==1||e.textContent.trim()!==""?!1:this._isSingleImage(e.children[0])},_unwrapNoscriptImages:function(e){var t=Array.from(e.getElementsByTagName("img"));this._forEachNode(t,function(a){for(var l=0;l<a.attributes.length;l++){var s=a.attributes[l];switch(s.name){case"src":case"srcset":case"data-src":case"data-srcset":return}if(/\.(jpg|jpeg|png|webp)/i.test(s.value))return}a.parentNode.removeChild(a)});var r=Array.from(e.getElementsByTagName("noscript"));this._forEachNode(r,function(a){var l=e.createElement("div");if(l.innerHTML=a.innerHTML,!!this._isSingleImage(l)){var s=a.previousElementSibling;if(s&&this._isSingleImage(s)){var o=s;o.tagName!=="IMG"&&(o=s.getElementsByTagName("img")[0]);for(var u=l.getElementsByTagName("img")[0],h=0;h<o.attributes.length;h++){var c=o.attributes[h];if(c.value!==""&&(c.name==="src"||c.name==="srcset"||/\.(jpg|jpeg|png|webp)/i.test(c.value))){if(u.getAttribute(c.name)===c.value)continue;var d=c.name;u.hasAttribute(d)&&(d="data-old-"+d),u.setAttribute(d,c.value)}}a.parentNode.replaceChild(l.firstElementChild,s)}}})},_removeScripts:function(e){this._removeNodes(this._getAllNodesWithTag(e,["script","noscript"]))},_hasSingleTagInsideElement:function(e,t){return e.children.length!=1||e.children[0].tagName!==t?!1:!this._someNode(e.childNodes,function(r){return r.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(r.textContent)})},_isElementWithoutContent:function(e){return e.nodeType===this.ELEMENT_NODE&&e.textContent.trim().length==0&&(e.children.length==0||e.children.length==e.getElementsByTagName("br").length+e.getElementsByTagName("hr").length)},_hasChildBlockElement:function(e){return this._someNode(e.childNodes,function(t){return this.DIV_TO_P_ELEMS.has(t.tagName)||this._hasChildBlockElement(t)})},_isPhrasingContent:function(e){return e.nodeType===this.TEXT_NODE||this.PHRASING_ELEMS.indexOf(e.tagName)!==-1||(e.tagName==="A"||e.tagName==="DEL"||e.tagName==="INS")&&this._everyNode(e.childNodes,this._isPhrasingContent)},_isWhitespace:function(e){return e.nodeType===this.TEXT_NODE&&e.textContent.trim().length===0||e.nodeType===this.ELEMENT_NODE&&e.tagName==="BR"},_getInnerText:function(e,t){t=typeof t>"u"?!0:t;var r=e.textContent.trim();return t?r.replace(this.REGEXPS.normalize," "):r},_getCharCount:function(e,t){return t=t||",",this._getInnerText(e).split(t).length-1},_cleanStyles:function(e){if(!(!e||e.tagName.toLowerCase()==="svg")){for(var t=0;t<this.PRESENTATIONAL_ATTRIBUTES.length;t++)e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[t]);this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName)!==-1&&(e.removeAttribute("width"),e.removeAttribute("height"));for(var r=e.firstElementChild;r!==null;)this._cleanStyles(r),r=r.nextElementSibling}},_getLinkDensity:function(e){var t=this._getInnerText(e).length;if(t===0)return 0;var r=0;return this._forEachNode(e.getElementsByTagName("a"),function(a){var l=a.getAttribute("href"),s=l&&this.REGEXPS.hashUrl.test(l)?.3:1;r+=this._getInnerText(a).length*s}),r/t},_getClassWeight:function(e){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var t=0;return typeof e.className=="string"&&e.className!==""&&(this.REGEXPS.negative.test(e.className)&&(t-=25),this.REGEXPS.positive.test(e.className)&&(t+=25)),typeof e.id=="string"&&e.id!==""&&(this.REGEXPS.negative.test(e.id)&&(t-=25),this.REGEXPS.positive.test(e.id)&&(t+=25)),t},_clean:function(e,t){var r=["object","embed","iframe"].indexOf(t)!==-1;this._removeNodes(this._getAllNodesWithTag(e,[t]),function(a){if(r){for(var l=0;l<a.attributes.length;l++)if(this._allowedVideoRegex.test(a.attributes[l].value))return!1;if(a.tagName==="object"&&this._allowedVideoRegex.test(a.innerHTML))return!1}return!0})},_hasAncestorTag:function(e,t,r,a){r=r||3,t=t.toUpperCase();for(var l=0;e.parentNode;){if(r>0&&l>r)return!1;if(e.parentNode.tagName===t&&(!a||a(e.parentNode)))return!0;e=e.parentNode,l++}return!1},_getRowAndColumnCount:function(e){for(var t=0,r=0,a=e.getElementsByTagName("tr"),l=0;l<a.length;l++){var s=a[l].getAttribute("rowspan")||0;s&&(s=parseInt(s,10)),t+=s||1;for(var o=0,u=a[l].getElementsByTagName("td"),h=0;h<u.length;h++){var c=u[h].getAttribute("colspan")||0;c&&(c=parseInt(c,10)),o+=c||1}r=Math.max(r,o)}return{rows:t,columns:r}},_markDataTables:function(e){for(var t=e.getElementsByTagName("table"),r=0;r<t.length;r++){var a=t[r],l=a.getAttribute("role");if(l=="presentation"){a._readabilityDataTable=!1;continue}var s=a.getAttribute("datatable");if(s=="0"){a._readabilityDataTable=!1;continue}var o=a.getAttribute("summary");if(o){a._readabilityDataTable=!0;continue}var u=a.getElementsByTagName("caption")[0];if(u&&u.childNodes.length>0){a._readabilityDataTable=!0;continue}var h=["col","colgroup","tfoot","thead","th"],c=function(p){return!!a.getElementsByTagName(p)[0]};if(h.some(c)){this.log("Data table because found data-y descendant"),a._readabilityDataTable=!0;continue}if(a.getElementsByTagName("table")[0]){a._readabilityDataTable=!1;continue}var d=this._getRowAndColumnCount(a);if(d.rows>=10||d.columns>4){a._readabilityDataTable=!0;continue}a._readabilityDataTable=d.rows*d.columns>10}},_fixLazyImages:function(e){this._forEachNode(this._getAllNodesWithTag(e,["img","picture","figure"]),function(t){if(t.src&&this.REGEXPS.b64DataUrl.test(t.src)){var r=this.REGEXPS.b64DataUrl.exec(t.src);if(r[1]==="image/svg+xml")return;for(var a=!1,l=0;l<t.attributes.length;l++){var s=t.attributes[l];if(s.name!=="src"&&/\.(jpg|jpeg|png|webp)/i.test(s.value)){a=!0;break}}if(a){var o=t.src.search(/base64\s*/i)+7,u=t.src.length-o;u<133&&t.removeAttribute("src")}}if(!((t.src||t.srcset&&t.srcset!="null")&&t.className.toLowerCase().indexOf("lazy")===-1)){for(var h=0;h<t.attributes.length;h++)if(s=t.attributes[h],!(s.name==="src"||s.name==="srcset"||s.name==="alt")){var c=null;if(/\.(jpg|jpeg|png|webp)\s+\d/.test(s.value)?c="srcset":/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(s.value)&&(c="src"),c){if(t.tagName==="IMG"||t.tagName==="PICTURE")t.setAttribute(c,s.value);else if(t.tagName==="FIGURE"&&!this._getAllNodesWithTag(t,["img","picture"]).length){var d=this._doc.createElement("img");d.setAttribute(c,s.value),t.appendChild(d)}}}}})},_getTextDensity:function(e,t){var r=this._getInnerText(e,!0).length;if(r===0)return 0;var a=0,l=this._getAllNodesWithTag(e,t);return this._forEachNode(l,s=>a+=this._getInnerText(s,!0).length),a/r},_cleanConditionally:function(e,t){this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)&&this._removeNodes(this._getAllNodesWithTag(e,[t]),function(r){var a=function(f){return f._readabilityDataTable},l=t==="ul"||t==="ol";if(!l){var s=0,o=this._getAllNodesWithTag(r,["ul","ol"]);this._forEachNode(o,f=>s+=this._getInnerText(f).length),l=s/this._getInnerText(r).length>.9}if(t==="table"&&a(r)||this._hasAncestorTag(r,"table",-1,a)||this._hasAncestorTag(r,"code"))return!1;var u=this._getClassWeight(r);this.log("Cleaning Conditionally",r);var h=0;if(u+h<0)return!0;if(this._getCharCount(r,",")<10){for(var c=r.getElementsByTagName("p").length,d=r.getElementsByTagName("img").length,p=r.getElementsByTagName("li").length-100,S=r.getElementsByTagName("input").length,v=this._getTextDensity(r,["h1","h2","h3","h4","h5","h6"]),N=0,_=this._getAllNodesWithTag(r,["object","embed","iframe"]),E=0;E<_.length;E++){for(var w=0;w<_[E].attributes.length;w++)if(this._allowedVideoRegex.test(_[E].attributes[w].value))return!1;if(_[E].tagName==="object"&&this._allowedVideoRegex.test(_[E].innerHTML))return!1;N++}var g=this._getLinkDensity(r),y=this._getInnerText(r).length,m=d>1&&c/d<.5&&!this._hasAncestorTag(r,"figure")||!l&&p>c||S>Math.floor(c/3)||!l&&v<.9&&y<25&&(d===0||d>2)&&!this._hasAncestorTag(r,"figure")||!l&&u<25&&g>.2||u>=25&&g>.5||N===1&&y<75||N>1;if(l&&m){for(var b=0;b<r.children.length;b++)if(r.children[b].children.length>1)return m;let f=r.getElementsByTagName("li").length;if(d==f)return!1}return m}return!1})},_cleanMatchedNodes:function(e,t){for(var r=this._getNextNode(e,!0),a=this._getNextNode(e);a&&a!=r;)t.call(this,a,a.className+" "+a.id)?a=this._removeAndGetNext(a):a=this._getNextNode(a)},_cleanHeaders:function(e){let t=this._getAllNodesWithTag(e,["h1","h2"]);this._removeNodes(t,function(r){let a=this._getClassWeight(r)<0;return a&&this.log("Removing header with low class weight:",r),a})},_headerDuplicatesTitle:function(e){if(e.tagName!="H1"&&e.tagName!="H2")return!1;var t=this._getInnerText(e,!1);return this.log("Evaluating similarity of header:",t,this._articleTitle),this._textSimilarity(this._articleTitle,t)>.75},_flagIsActive:function(e){return(this._flags&e)>0},_removeFlag:function(e){this._flags=this._flags&~e},_isProbablyVisible:function(e){return(!e.style||e.style.display!="none")&&(!e.style||e.style.visibility!="hidden")&&!e.hasAttribute("hidden")&&(!e.hasAttribute("aria-hidden")||e.getAttribute("aria-hidden")!="true"||e.className&&e.className.indexOf&&e.className.indexOf("fallback-image")!==-1)},parse:function(){if(this._maxElemsToParse>0){var e=this._doc.getElementsByTagName("*").length;if(e>this._maxElemsToParse)throw new Error("Aborting parsing document; "+e+" elements found")}this._unwrapNoscriptImages(this._doc);var t=this._disableJSONLD?{}:this._getJSONLD(this._doc);this._removeScripts(this._doc),this._prepDocument();var r=this._getArticleMetadata(t);this._articleTitle=r.title;var a=this._grabArticle();if(!a)return null;if(this.log("Grabbed: "+a.innerHTML),this._postProcessContent(a),!r.excerpt){var l=a.getElementsByTagName("p");l.length>0&&(r.excerpt=l[0].textContent.trim())}var s=a.textContent;return{title:this._articleTitle,byline:r.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(a),textContent:s,length:s.length,excerpt:r.excerpt,siteName:r.siteName||this._articleSiteName,publishedTime:r.publishedTime}}},i.exports=n})(He);var kt=He.exports,Ct={exports:{}};(function(i){var n={unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i};function e(r){return(!r.style||r.style.display!="none")&&!r.hasAttribute("hidden")&&(!r.hasAttribute("aria-hidden")||r.getAttribute("aria-hidden")!="true"||r.className&&r.className.indexOf&&r.className.indexOf("fallback-image")!==-1)}function t(r,a={}){typeof a=="function"&&(a={visibilityChecker:a});var l={minScore:20,minContentLength:140,visibilityChecker:e};a=Object.assign(l,a);var s=r.querySelectorAll("p, pre, article"),o=r.querySelectorAll("div > br");if(o.length){var u=new Set(s);[].forEach.call(o,function(c){u.add(c.parentNode)}),s=Array.from(u)}var h=0;return[].some.call(s,function(c){if(!a.visibilityChecker(c))return!1;var d=c.className+" "+c.id;if(n.unlikelyCandidates.test(d)&&!n.okMaybeItsACandidate.test(d)||c.matches("li p"))return!1;var p=c.textContent.trim().length;return p<a.minContentLength?!1:(h+=Math.sqrt(p-a.minContentLength),h>a.minScore)})}i.exports=t})(Ct);var Lt=kt,Dt={Readability:Lt};async function It(i){try{const n=await fetch(i);if(!n.ok)return null;const e=await n.blob();return new Promise(t=>{const r=new FileReader;r.onloadend=()=>t(r.result),r.onerror=()=>t(null),r.readAsDataURL(e)})}catch(n){return console.warn("Failed to fetch image blob:",i,n),null}}async function Rt(i,n=!0){const e=Array.from(i.querySelectorAll("img")),t=[],r=new Map;let a=1;for(const l of e){const s=l.src||l.getAttribute("data-src")||l.getAttribute("data-original");if(!s||s.startsWith("data:")||r.has(s)||l.naturalWidth>0&&l.naturalWidth<32&&l.naturalHeight<32)continue;const o=s.match(/\.(png|jpe?g|gif|webp|svg)/i),u=o?o[1].toLowerCase().replace("jpeg","jpg"):"png",h=`img_${String(a).padStart(2,"0")}_${Math.random().toString(36).slice(2,6)}.${u}`,c=`assets/${h}`;r.set(s,c);let d;n&&(d=await It(s)||void 0),t.push({id:`media-${Date.now()}-${a}`,type:"image",originalUrl:s,filename:h,localPath:c,blobDataUrl:d}),a++}return{attachments:t,urlMap:r}}function Pt(i,n){let e=i;return n.forEach((t,r)=>{const a=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),l=new RegExp(`!\\[(.*?)\\]\\(${a}\\)`,"g");e=e.replace(l,`![$1](${t})`)}),e}async function $t(i,n=!0){var v;const e=i.cloneNode(!0),r=new Dt.Readability(e,{charThreshold:20,keepClasses:!0}).parse(),a=(r==null?void 0:r.title)||i.title||"Untitled Web Page",l=(r==null?void 0:r.byline)||"",s=(r==null?void 0:r.excerpt)||"",o=(r==null?void 0:r.content)||i.body.innerHTML,u=document.createElement("div");u.innerHTML=o;const{attachments:h,urlMap:c}=await Rt(u,n);let d=P(o);d=Pt(d,c);const p=((v=i.location)==null?void 0:v.href)||(typeof window<"u"?window.location.href:"")||"about:blank",S=`# ${a}

> 🌐 **来源地址**: [${p}](${p})
> ⏰ **抓取时间**: ${new Date().toLocaleString()}
${l?`> ✍️ **作者**: ${l}
`:""}
---

`;return{title:a,byline:l,excerpt:s,markdown:S+d,rawHtml:o,mediaAttachments:h}}function we(i){const n=Math.floor(i/60),e=Math.floor(i%60),t=Math.floor(n/60),r=n%60;return t>0?`${t.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`:`${r.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`}function Mt(i){return i.includes("bilibili.com/video")?{isVideo:!0,platform:"bilibili"}:i.includes("youtube.com/watch")||i.includes("youtu.be/")?{isVideo:!0,platform:"youtube"}:{isVideo:!1,platform:"other"}}function Bt(i=""){const n=document.querySelector("video"),e=window.location.href,{isVideo:t,platform:r}=Mt(e);if(!t&&!n)return null;const a=n?n.currentTime:0,l=n?n.duration:0,s=we(a),o=we(l);let u=e;r==="youtube"?u=`${e.split("&t=")[0]}&t=${Math.floor(a)}s`:r==="bilibili"&&(u=`${e.split("?p=")[0].split("&t=")[0]}?t=${Math.floor(a)}`);const h=document.title||"在线视频调研线索",c=`## 🎬 多模态音视频调研线索

- **标题**: ${h}
- **平台**: ${r==="bilibili"?"哔哩哔哩 (Bilibili)":"YouTube"}
- **播放时间锚点**: \`${s}\` / \`${o}\`
- **精准跳转链接**: [直达 ${s} 播放时刻](${u})
- **原始地址**: ${e}

${i?`### 📝 调研备忘笔记

${i}

`:""}
> 💡 *此多模态线索已建立音视频时间轴锚点，待 DSH 智能体接入后可自动调用 Whisper 转录或截取关键视频帧。*
`;return{title:`[视频线索] ${h.slice(0,40)}`,url:u,sourcePlatform:r,documentType:"media",tags:["Video",r,"MultimodalCue"],markdownContent:c,userNotes:i}}function Ht(i,n){chrome.runtime.sendMessage({type:"CAPTURE_VISIBLE_TAB_REQUEST"},e=>{if(!e||!e.success||!e.dataUrl){n((e==null?void 0:e.error)||"截取当前可视区域失败");return}Ot(e.dataUrl,i)})}function Ot(i,n){const e=document.getElementById("dsh-cropper-overlay");e&&e.remove();const t=document.createElement("div");t.id="dsh-cropper-overlay",t.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    cursor: crosshair;
    user-select: none;
    background: rgba(15, 23, 42, 0.45);
  `;const r=document.createElement("div");r.style.cssText=`
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #f8fafc;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.15);
    z-index: 2147483647;
  `,r.innerHTML="<span>📸 拖拽鼠标框选截图区域，按 Enter 确认保存，按 ESC 退出</span>",t.appendChild(r);const a=document.createElement("div");a.style.cssText=`
    position: fixed;
    border: 2px solid #22c55e;
    background: transparent !important;
    display: none;
    box-shadow: 0 0 0 99999px rgba(15, 23, 42, 0.55);
    z-index: 2147483647;
    pointer-events: none;
  `,t.appendChild(a);const l=document.createElement("div");l.style.cssText=`
    position: absolute;
    top: -24px;
    left: 0;
    background: #22c55e;
    color: #0f172a;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    white-space: nowrap;
  `,a.appendChild(l);const s=document.createElement("div");s.id="dsh-crop-action-panel",s.style.cssText=`
    position: fixed;
    display: none;
    align-items: center;
    gap: 8px;
    background: #0f172a;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid #334155;
    pointer-events: auto;
    z-index: 2147483647;
    flex-wrap: wrap;
  `,s.innerHTML=`
    <input 
      type="text" 
      id="dsh-crop-annotation"
      placeholder="输入视觉标注 (告诉 Agent 重点关注什么，回车直接保存)..." 
      style="
        flex: 1;
        min-width: 200px;
        padding: 6px 10px;
        font-size: 12px;
        border: 1px solid #475569;
        border-radius: 5px;
        background: #1e293b;
        color: #f8fafc;
        outline: none;
      "
    />
    <button 
      id="dsh-crop-confirm-btn"
      style="
        padding: 6px 14px;
        background: #22c55e;
        color: #0f172a;
        font-size: 12px;
        font-weight: 700;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
      "
      title="点击或按键盘 Enter 键直接确认保存"
    >
      <span>✓ 保存至 DSH</span>
      <kbd style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 3px; font-size: 10px; font-family: monospace;">Enter ↵</kbd>
    </button>
    <button 
      id="dsh-crop-cancel-btn"
      style="
        padding: 6px 10px;
        background: #334155;
        color: #cbd5e1;
        font-size: 12px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
      "
      title="退出本次截图 (ESC)"
    >
      ✕ 退出
    </button>
    <div 
      id="dsh-crop-status-tip" 
      style="display:none; width: 100%; color: #fca5a5; font-size: 11px; margin-top: 4px;"
    ></div>
  `,t.appendChild(s);const o=g=>{s.style.display="flex";const y=Math.min(500,window.innerWidth-24);s.style.width=`${y}px`;const m=s.offsetHeight||48;let b;g.top+g.height+m+14<=window.innerHeight?b=g.top+g.height+10:g.top-m-14>=0?b=g.top-m-10:b=Math.max(12,g.top+g.height-m-14);let f=g.left+g.width-y;f<12&&(f=12),f+y>window.innerWidth-12&&(f=window.innerWidth-y-12),s.style.position="fixed",s.style.top=`${Math.round(b)}px`,s.style.left=`${Math.round(f)}px`};let u=!1,h=0,c=0,d=0,p=0;const S=()=>{t.remove(),document.removeEventListener("keydown",w)};t.addEventListener("mousedown",g=>{s.contains(g.target)||(u=!0,h=g.clientX,c=g.clientY,d=g.clientX,p=g.clientY,t.style.background="transparent",a.style.display="block",s.style.display="none",a.style.left=`${h}px`,a.style.top=`${c}px`,a.style.width="0px",a.style.height="0px")}),t.addEventListener("mousemove",g=>{if(!u)return;d=g.clientX,p=g.clientY;const y=Math.min(h,d),m=Math.min(c,p),b=Math.abs(d-h),f=Math.abs(p-c);a.style.left=`${y}px`,a.style.top=`${m}px`,a.style.width=`${b}px`,a.style.height=`${f}px`,l.textContent=`${Math.round(b)} × ${Math.round(f)} px`}),t.addEventListener("mouseup",()=>{if(!u)return;u=!1;const g=Math.abs(d-h),y=Math.abs(p-c),m=Math.min(h,d),b=Math.min(c,p);if(g<20||y<20){a.style.display="none",s.style.display="none",t.style.background="rgba(15, 23, 42, 0.45)";return}o({left:m,top:b,width:g,height:y});const f=s.querySelector("#dsh-crop-annotation");f==null||f.focus()}),s.addEventListener("mousedown",g=>g.stopPropagation());const v=s.querySelector("#dsh-crop-confirm-btn"),N=s.querySelector("#dsh-crop-cancel-btn"),_=s.querySelector("#dsh-crop-annotation");N.onclick=S;const E=()=>{var $;if(v.disabled)return;const g=parseInt(a.style.left,10),y=parseInt(a.style.top,10),m=parseInt(a.style.width,10),b=parseInt(a.style.height,10);if(m<20||b<20)return;const f=(($=_==null?void 0:_.value)==null?void 0:$.trim())||"",L=s.querySelector("#dsh-crop-status-tip");v.disabled=!0,N.disabled=!0,v.innerHTML="⏳ 正在保存快照...",L&&(L.style.display="none"),Ut(i,{x:g,y,width:m,height:b},f,n,U=>{U.success?(v.innerHTML="✓ 保存成功！",v.style.background="#16a34a",setTimeout(()=>{S()},500)):(v.disabled=!1,N.disabled=!1,v.innerHTML="重试保存 (Enter ↵)",v.style.background="#ef4444",L&&(L.style.display="block",L.textContent=`❌ 保存失败: ${U.error||"未能成功写入磁盘"}`))})};v.onclick=E,_==null||_.addEventListener("keydown",g=>{g.key==="Enter"&&(g.preventDefault(),g.stopPropagation(),E())});const w=g=>{g.key==="Escape"?S():g.key==="Enter"&&s.style.display!=="none"&&!v.disabled&&(g.preventDefault(),E())};document.addEventListener("keydown",w),document.body.appendChild(t)}function Ut(i,n,e,t,r){const a=new Image;a.onload=()=>{const l=a.naturalWidth/window.innerWidth,s=a.naturalHeight/window.innerHeight,o=n.x*l,u=n.y*s,h=n.width*l,c=n.height*s,d=document.createElement("canvas");d.width=h,d.height=c;const p=d.getContext("2d");if(!p){r({success:!1,error:"无法创建 Canvas 2D 绘图上下文"});return}p.drawImage(a,o,u,h,c,0,0,h,c);const S=d.toDataURL("image/png"),v=Date.now(),N=`screenshot_${v}.png`,_=document.title||"网页局部视觉快照",E={isScreenshot:!0,cropArea:{x:Math.round(n.x),y:Math.round(n.y),width:Math.round(n.width),height:Math.round(n.height),devicePixelRatio:window.devicePixelRatio||1},viewport:{width:window.innerWidth,height:window.innerHeight},pageTitle:_,pageUrl:window.location.href||document.URL||location.href||"about:blank",visualAnnotation:e||"用户框选的网页重点截图快照",agentInstruction:"【DSH 智能体提示】本线索为多模态网页图像截图快照，附件位于 assets/ 目录。包含截取区域坐标与来源上下文。请下游智能体使用视觉多模态模型(Vision LLM)分析图中布局、图表、UI或文字内容。"},w=window.location.href||document.URL||location.href||"about:blank",g=`# 📸 网页截图快照: ${_}

> 🏷️ **模态类型**: 视觉图像快照 (Visual Screenshot)
> 🌐 **来源地址**: [${w}](${w})
> ⏰ **截取时刻**: ${new Date().toLocaleString()}
> 📐 **裁剪分辨率**: ${Math.round(n.width)} × ${Math.round(n.height)} px (DPR: ${window.devicePixelRatio||1})
${e?`> 📝 **视觉数据标注**: ${e}
`:""}

![截图快照](assets/${N})

---
> 🤖 **Agent 视觉感知指令**: 本条目已完成多模态视觉数据标注。下游 DSH 智能体请通过 Vision 模型读取对应 \`assets/\` 附件进行图像解析、图表抽取或 OCR 识别。
`,y={id:`snap-${v}`,project:"",topic:"Screenshots",title:`[截图快照] ${_.slice(0,35)}`,url:w,urlType:H(w),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"screenshot",tags:["Screenshot","VisualSnapshot","Multimodal"],userNotes:e,markdownContent:g,screenshotMetadata:E,mediaAttachments:[{id:`att-snap-${v}`,type:"image",originalUrl:w,filename:N,localPath:`assets/${N}`,blobDataUrl:S}]};t(y,r)},a.onerror=()=>{r({success:!1,error:"截屏图像加载失败，请刷新页面后重试"})},a.src=i}function O(){return window.location.href||document.URL||location.href||"about:blank"}function Gt(){const i="dsh-sensor-styles";if(document.getElementById(i))return;const n=document.createElement("style");n.id=i,n.textContent=`
    .dsh-chat-inject-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      margin: 4px 6px;
      font-size: 12px;
      font-weight: 500;
      color: #15803d;
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 1000;
    }
    .dsh-chat-inject-btn:hover {
      background-color: #dcfce7;
      color: #14532d;
      border-color: #86efac;
      transform: translateY(-1px);
    }
    .dsh-floating-pill {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #0f172a;
      color: #f8fafc;
      font-size: 13px;
      font-weight: 500;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      z-index: 999999;
      transform: translateY(-100%);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .dsh-floating-pill:hover {
      background: #1e293b;
      color: #4ade80;
    }
    .dsh-toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .dsh-toast {
      pointer-events: auto;
      padding: 10px 16px;
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border-left: 4px solid #22c55e;
      animation: dshFadeIn 0.3s ease;
    }
    .dsh-toast.error {
      border-left-color: #ef4444;
    }
    @keyframes dshFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,document.head.appendChild(n)}function R(i,n=!1){let e=document.getElementById("dsh-toast-root");e||(e=document.createElement("div"),e.id="dsh-toast-root",e.className="dsh-toast-container",document.body.appendChild(e));const t=document.createElement("div");t.className=`dsh-toast ${n?"error":""}`,t.textContent=i,e.appendChild(t),setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity 0.3s ease",setTimeout(()=>t.remove(),300)},3500)}function B(i,n){chrome.runtime.sendMessage({type:"SAVE_BUNDLE",payload:i},e=>{var t;if(e&&e.success)R(`✓ 已成功归档至 DSH: ${i.title.slice(0,25)}`),n==null||n({success:!0,savedPath:(t=e.data)==null?void 0:t.savedPath});else{const r=(e==null?void 0:e.error)||"未能成功写入磁盘";R(`✕ 保存失败: ${r}`,!0),n==null||n({success:!1,error:r})}})}let C=null;function Vt(){document.addEventListener("mouseup",()=>{var a;const i=window.getSelection(),n=i==null?void 0:i.toString().trim();if(C&&(C.remove(),C=null),!n||n.length<5)return;const e=(a=i==null?void 0:i.anchorNode)==null?void 0:a.parentElement;if(e!=null&&e.closest('input, textarea, [contenteditable="true"]'))return;const t=i==null?void 0:i.getRangeAt(0);if(!t)return;const r=t.getBoundingClientRect();r.width===0&&r.height===0||(C=document.createElement("div"),C.className="dsh-floating-pill",C.innerHTML=`
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      存入 DSH
    `,C.style.top=`${window.scrollY+r.top-8}px`,C.style.left=`${window.scrollX+r.left+r.width/2-40}px`,C.onmousedown=l=>l.stopPropagation(),C.onclick=l=>{l.stopPropagation();const s=O(),o={id:`snip-${Date.now()}`,project:"",topic:"",title:`摘录: ${n.slice(0,30)}...`,url:s,urlType:H(s),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"snippet",tags:["Snippet","Quote"],markdownContent:`> ${n.replace(/\n+/g,`
> `)}

---
> 来源出处: [${document.title||s}](${s})`,mediaAttachments:[]};B(o),C&&(C.remove(),C=null)},document.body.appendChild(C))})}function jt(){const i=O(),n=Be.findAdapter(i);if(!n)return;console.log(`[DSH Sensor] 检测到匹配的 AI Chat 平台: ${n.name}`);const e=r=>{const a=O(),l={id:`chat-${Date.now()}`,project:"",topic:"AI-Chat",title:`${n.name}: ${r.prompt.slice(0,30)}`,url:a,urlType:H(a),sourcePlatform:n.id,capturedAt:new Date().toISOString(),documentType:"chat_turn",tags:["AIChat",n.name,r.modelName||"LLM"],markdownContent:r.markdown,aiMetadata:{modelName:r.modelName,hasThinkingChain:!!r.thinking,thinkingContent:r.thinking,promptContext:r.prompt},mediaAttachments:r.mediaAttachments||[]};B(l)};n.injectUI(e),new MutationObserver(()=>{n.injectUI(e)}).observe(document.body,{childList:!0,subtree:!0})}chrome.runtime.onMessage.addListener((i,n,e)=>{var t;if(i.type==="SHOW_TOAST"){const r=i.payload;R(r.message,r.isError),e({ok:!0})}if(i.type==="CAPTURE_FULL_PAGE"){const r=O();return $t(document).then(a=>{const l={id:`page-${Date.now()}`,project:"",topic:"",title:a.title,url:r,urlType:H(r),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"article",tags:["Article","Research"],markdownContent:a.markdown,mediaAttachments:a.mediaAttachments};B(l),e({success:!0,item:l})}).catch(a=>{R(`提取正文失败: ${a.message}`,!0),e({success:!1,error:a.message})}),!0}if(i.type==="CAPTURE_SELECTION"){const r=i.payload,a=(r==null?void 0:r.text)||((t=window.getSelection())==null?void 0:t.toString())||"";if(a){const l=O(),s={id:`snip-${Date.now()}`,project:"",topic:"",title:`摘录: ${a.slice(0,30)}...`,url:l,urlType:H(l),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"snippet",tags:["Snippet","Quote"],markdownContent:`> ${a.replace(/\n+/g,`
> `)}

---
> 来源出处: [${document.title||l}](${l})`,mediaAttachments:[]};B(s),e({success:!0})}}if(i.type==="CAPTURE_VIDEO_CUE"){const r=Bt();if(r){const a=r.url||O(),l={id:`vid-${Date.now()}`,project:"",topic:"Video",title:r.title||"视频线索",url:a,urlType:H(a),sourcePlatform:r.sourcePlatform||"bilibili",capturedAt:new Date().toISOString(),documentType:"media",tags:r.tags||["Video"],markdownContent:r.markdownContent||"",mediaAttachments:[]};B(l),e({success:!0,item:l})}else R("当前页面未检测到视频播放器或非支持平台",!0),e({success:!1,error:"未检测到视频"});return!0}if(i.type==="START_SCREENSHOT_CAPTURE")return Ht((r,a)=>{B(r,a)},r=>{R(`截图失败: ${r}`,!0)}),e({success:!0}),!0;if(i.type==="CAPTURE_CHAT_SESSION"){const r=O(),a=Be.findAdapter(r);if(a){const l=a.extractSession();if(l){const s={id:`session-${Date.now()}`,project:"",topic:"AI-Chat",title:l.title,url:r,urlType:H(r),sourcePlatform:a.id,capturedAt:new Date().toISOString(),documentType:"chat_session",tags:["AISession",a.name,l.modelName||"LLM"],markdownContent:l.markdown,mediaAttachments:l.mediaAttachments||[]};B(s),e({success:!0,item:s})}else R("未能识别到完整的对话轮次",!0),e({success:!1,error:"未能识别对话"})}else R("当前页面不是受支持的 AI 对话平台",!0),e({success:!1,error:"未匹配适配器"});return!0}});Gt();Vt();jt();
