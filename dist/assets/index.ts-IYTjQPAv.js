var je=Object.defineProperty;var Ve=(i,n,e)=>n in i?je(i,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[n]=e;var D=(i,n,e)=>Ve(i,typeof n!="symbol"?n+"":n,e);import{r as G}from"./index-K1G2e5ai.js";function We(i){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(i[r]=e[r])}return i}function le(i,n){return Array(n+1).join(i)}function Ae(i){return i.replace(/^\n*/,"")}function Se(i){for(var n=i.length;n>0&&i[n-1]===`
`;)n--;return i.substring(0,n)}function ke(i){return Se(Ae(i))}var Fe=["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"];function ce(i){return ue(i,Fe)}var Ce=["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"];function Le(i){return ue(i,Ce)}function Xe(i){return Ie(i,Ce)}var De=["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"];function ze(i){return ue(i,De)}function qe(i){return Ie(i,De)}function ue(i,n){return n.indexOf(i.nodeName)>=0}function Ie(i,n){return i.getElementsByTagName&&n.some(function(e){return i.getElementsByTagName(e).length})}var Ye=[[/\\/g,"\\\\"],[/\*/g,"\\*"],[/^-/g,"\\-"],[/^\+ /g,"\\+ "],[/^(=+)/g,"\\$1"],[/^(#{1,6}) /g,"\\$1 "],[/`/g,"\\`"],[/^~~~/g,"\\~~~"],[/\[/g,"\\["],[/\]/g,"\\]"],[/^>/g,"\\>"],[/_/g,"\\_"],[/^(\d+)\. /g,"$1\\. "]];function Re(i){return Ye.reduce(function(n,e){return n.replace(e[0],e[1])},i)}var k={};k.paragraph={filter:"p",replacement:function(i){return`

`+i+`

`}};k.lineBreak={filter:"br",replacement:function(i,n,e){return e.br+`
`}};k.heading={filter:["h1","h2","h3","h4","h5","h6"],replacement:function(i,n,e){var r=Number(n.nodeName.charAt(1));if(e.headingStyle==="setext"&&r<3){var t=le(r===1?"=":"-",i.length);return`

`+i+`
`+t+`

`}else return`

`+le("#",r)+" "+i+`

`}};k.blockquote={filter:"blockquote",replacement:function(i){return i=ke(i).replace(/^/gm,"> "),`

`+i+`

`}};k.list={filter:["ul","ol"],replacement:function(i,n){var e=n.parentNode;return e.nodeName==="LI"&&e.lastElementChild===n?`
`+i:`

`+i+`

`}};k.listItem={filter:"li",replacement:function(i,n,e){var r=e.bulletListMarker+"   ",t=n.parentNode;if(t.nodeName==="OL"){var a=t.getAttribute("start"),o=Array.prototype.indexOf.call(t.children,n);r=(a?Number(a)+o:o+1)+".  "}var s=/\n$/.test(i);return i=ke(i)+(s?`
`:""),i=i.replace(/\n/gm,`
`+" ".repeat(r.length)),r+i+(n.nextSibling?`
`:"")}};k.indentedCodeBlock={filter:function(i,n){return n.codeBlockStyle==="indented"&&i.nodeName==="PRE"&&i.firstChild&&i.firstChild.nodeName==="CODE"},replacement:function(i,n,e){return`

    `+n.firstChild.textContent.replace(/\n/g,`
    `)+`

`}};k.fencedCodeBlock={filter:function(i,n){return n.codeBlockStyle==="fenced"&&i.nodeName==="PRE"&&i.firstChild&&i.firstChild.nodeName==="CODE"},replacement:function(i,n,e){for(var r=n.firstChild.getAttribute("class")||"",t=(r.match(/language-(\S+)/)||[null,""])[1],a=n.firstChild.textContent,o=e.fence.charAt(0),s=3,l=new RegExp("^"+o+"{3,}","gm"),c;c=l.exec(a);)c[0].length>=s&&(s=c[0].length+1);var h=le(o,s);return`

`+h+t+`
`+a.replace(/\n$/,"")+`
`+h+`

`}};k.horizontalRule={filter:"hr",replacement:function(i,n,e){return`

`+e.hr+`

`}};k.inlineLink={filter:function(i,n){return n.linkStyle==="inlined"&&i.nodeName==="A"&&i.getAttribute("href")},replacement:function(i,n){var e=he(n.getAttribute("href")),r=de(J(n.getAttribute("title"))),t=r?' "'+r+'"':"";return"["+i+"]("+e+t+")"}};k.referenceLink={filter:function(i,n){return n.linkStyle==="referenced"&&i.nodeName==="A"&&i.getAttribute("href")},replacement:function(i,n,e){var r=he(n.getAttribute("href")),t=J(n.getAttribute("title"));t&&(t=' "'+de(t)+'"');var a,o;switch(e.linkReferenceStyle){case"collapsed":a="["+i+"][]",o="["+i+"]: "+r+t;break;case"shortcut":a="["+i+"]",o="["+i+"]: "+r+t;break;default:var s=this.references.length+1;a="["+i+"]["+s+"]",o="["+s+"]: "+r+t}return this.references.push(o),a},references:[],append:function(i){var n="";return this.references.length&&(n=`

`+this.references.join(`
`)+`

`,this.references=[]),n}};k.emphasis={filter:["em","i"],replacement:function(i,n,e){return i.trim()?e.emDelimiter+i+e.emDelimiter:""}};k.strong={filter:["strong","b"],replacement:function(i,n,e){return i.trim()?e.strongDelimiter+i+e.strongDelimiter:""}};k.code={filter:function(i){var n=i.previousSibling||i.nextSibling,e=i.parentNode.nodeName==="PRE"&&!n;return i.nodeName==="CODE"&&!e},replacement:function(i){if(!i)return"";i=i.replace(/\r?\n|\r/g," ");for(var n=/^`|^ .*?[^ ].* $|`$/.test(i)?" ":"",e="`",r=i.match(/`+/gm)||[];r.indexOf(e)!==-1;)e=e+"`";return e+n+i+n+e}};k.image={filter:"img",replacement:function(i,n){var e=Re(J(n.getAttribute("alt"))),r=he(n.getAttribute("src")||""),t=J(n.getAttribute("title")),a=t?' "'+de(t)+'"':"";return r?"!["+e+"]("+r+a+")":""}};function J(i){return i?i.replace(/(\n+\s*)+/g,`
`):""}function he(i){var n=i.replace(/([<>()])/g,"\\$1");return n.indexOf(" ")>=0?"<"+n+">":n}function de(i){return i.replace(/"/g,'\\"')}function Pe(i){this.options=i,this._keep=[],this._remove=[],this.blankRule={replacement:i.blankReplacement},this.keepReplacement=i.keepReplacement,this.defaultRule={replacement:i.defaultReplacement},this.array=[];for(var n in i.rules)this.array.push(i.rules[n])}Pe.prototype={add:function(i,n){this.array.unshift(n)},keep:function(i){this._keep.unshift({filter:i,replacement:this.keepReplacement})},remove:function(i){this._remove.unshift({filter:i,replacement:function(){return""}})},forNode:function(i){if(i.isBlank)return this.blankRule;var n;return(n=ae(this.array,i,this.options))||(n=ae(this._keep,i,this.options))||(n=ae(this._remove,i,this.options))?n:this.defaultRule},forEach:function(i){for(var n=0;n<this.array.length;n++)i(this.array[n],n)}};function ae(i,n,e){for(var r=0;r<i.length;r++){var t=i[r];if(Ke(t,n,e))return t}}function Ke(i,n,e){var r=i.filter;if(typeof r=="string"){if(r===n.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(n.nodeName.toLowerCase())>-1)return!0}else if(typeof r=="function"){if(r.call(i,n,e))return!0}else throw new TypeError("`filter` needs to be a string, array, or function")}function Je(i){var n=i.element,e=i.isBlock,r=i.isVoid,t=i.isPre||function(u){return u.nodeName==="PRE"};if(!(!n.firstChild||t(n))){for(var a=null,o=!1,s=null,l=Te(s,n,t);l!==n;){if(l.nodeType===3||l.nodeType===4){var c=l.data.replace(/[ \r\n\t]+/g," ");if((!a||/ $/.test(a.data))&&!o&&c[0]===" "&&(c=c.substr(1)),!c){l=se(l);continue}l.data=c,a=l}else if(l.nodeType===1)e(l)||l.nodeName==="BR"?(a&&(a.data=a.data.replace(/ $/,"")),a=null,o=!1):r(l)||t(l)?(a=null,o=!0):a&&(o=!1);else{l=se(l);continue}var h=Te(s,l,t);s=l,l=h}a&&(a.data=a.data.replace(/ $/,""),a.data||se(a))}}function se(i){var n=i.nextSibling||i.parentNode;return i.parentNode.removeChild(i),n}function Te(i,n,e){return i&&i.parentNode===n||e(n)?n.nextSibling||n.parentNode:n.firstChild||n.nextSibling||n.parentNode}var fe=typeof window<"u"?window:{};function Qe(){var i=fe.DOMParser,n=!1;try{new i().parseFromString("","text/html")&&(n=!0)}catch{}return n}function Ze(){var i=function(){};return et()?i.prototype.parseFromString=function(n){var e=new window.ActiveXObject("htmlfile");return e.designMode="on",e.open(),e.write(n),e.close(),e}:i.prototype.parseFromString=function(n){var e=document.implementation.createHTMLDocument("");return e.open(),e.write(n),e.close(),e},i}function et(){var i=!1;try{document.implementation.createHTMLDocument("").open()}catch{fe.ActiveXObject&&(i=!0)}return i}var tt=Qe()?fe.DOMParser:Ze();function rt(i,n){var e;if(typeof i=="string"){var r=it().parseFromString('<x-turndown id="turndown-root">'+i+"</x-turndown>","text/html");e=r.getElementById("turndown-root")}else e=i.cloneNode(!0);return Je({element:e,isBlock:ce,isVoid:Le,isPre:n.preformattedCode?nt:null}),e}var oe;function it(){return oe=oe||new tt,oe}function nt(i){return i.nodeName==="PRE"||i.nodeName==="CODE"}function at(i,n){return i.isBlock=ce(i),i.isCode=i.nodeName==="CODE"||i.parentNode.isCode,i.isBlank=st(i),i.flankingWhitespace=ot(i,n),i}function st(i){return!Le(i)&&!ze(i)&&/^\s*$/i.test(i.textContent)&&!Xe(i)&&!qe(i)}function ot(i,n){if(i.isBlock||n.preformattedCode&&i.isCode)return{leading:"",trailing:""};var e=lt(i.textContent);return e.leadingAscii&&Ne("left",i,n)&&(e.leading=e.leadingNonAscii),e.trailingAscii&&Ne("right",i,n)&&(e.trailing=e.trailingNonAscii),{leading:e.leading,trailing:e.trailing}}function lt(i){var n=i.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);return{leading:n[1],leadingAscii:n[2],leadingNonAscii:n[3],trailing:n[4],trailingNonAscii:n[5],trailingAscii:n[6]}}function Ne(i,n,e){var r,t,a;return i==="left"?(r=n.previousSibling,t=/ $/):(r=n.nextSibling,t=/^ /),r&&(r.nodeType===3?a=t.test(r.nodeValue):e.preformattedCode&&r.nodeName==="CODE"?a=!1:r.nodeType===1&&!ce(r)&&(a=t.test(r.textContent))),a}var ct=Array.prototype.reduce;function Q(i){if(!(this instanceof Q))return new Q(i);var n={rules:k,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",preformattedCode:!1,blankReplacement:function(e,r){return r.isBlock?`

`:""},keepReplacement:function(e,r){return r.isBlock?`

`+r.outerHTML+`

`:r.outerHTML},defaultReplacement:function(e,r){return r.isBlock?`

`+e+`

`:e}};this.options=We({},n,i),this.rules=new Pe(this.options)}Q.prototype={turndown:function(i){if(!dt(i))throw new TypeError(i+" is not a string, or an element/document/fragment node.");if(i==="")return"";var n=$e.call(this,new rt(i,this.options));return ut.call(this,n)},use:function(i){if(Array.isArray(i))for(var n=0;n<i.length;n++)this.use(i[n]);else if(typeof i=="function")i(this);else throw new TypeError("plugin must be a Function or an Array of Functions");return this},addRule:function(i,n){return this.rules.add(i,n),this},keep:function(i){return this.rules.keep(i),this},remove:function(i){return this.rules.remove(i),this},escape:function(i){return Re(i)}};function $e(i){var n=this;return ct.call(i.childNodes,function(e,r){r=new at(r,n.options);var t="";return r.nodeType===3?t=r.isCode?r.nodeValue:n.escape(r.nodeValue):r.nodeType===1&&(t=ht.call(n,r)),Me(e,t)},"")}function ut(i){var n=this;return this.rules.forEach(function(e){typeof e.append=="function"&&(i=Me(i,e.append(n.options)))}),i.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}function ht(i){var n=this.rules.forNode(i),e=$e.call(this,i),r=i.flankingWhitespace;return(r.leading||r.trailing)&&(e=e.trim()),r.leading+n.replacement(e,i,this.options)+r.trailing}function Me(i,n){var e=Se(i),r=Ae(n),t=Math.max(i.length-e.length,n.length-r.length),a=`

`.substring(0,t);return e+a+r}function dt(i){return i!=null&&(typeof i=="string"||i.nodeType&&(i.nodeType===1||i.nodeType===9||i.nodeType===11))}var we=/highlight-(?:text|source)-([a-z0-9]+)/;function ft(i){i.addRule("highlightedCodeBlock",{filter:function(n){var e=n.firstChild;return n.nodeName==="DIV"&&we.test(n.className)&&e&&e.nodeName==="PRE"},replacement:function(n,e,r){var t=e.className||"",a=(t.match(we)||[null,""])[1];return`

`+r.fence+a+`
`+e.firstChild.textContent+`
`+r.fence+`

`}})}function mt(i){i.addRule("strikethrough",{filter:["del","s","strike"],replacement:function(n){return"~"+n+"~"}})}var gt=Array.prototype.indexOf,pt=Array.prototype.every,W={};W.tableCell={filter:["th","td"],replacement:function(i,n){return Be(i,n)}};W.tableRow={filter:"tr",replacement:function(i,n){var e="",r={left:":--",right:"--:",center:":-:"};if(me(n))for(var t=0;t<n.childNodes.length;t++){var a="---",o=(n.childNodes[t].getAttribute("align")||"").toLowerCase();o&&(a=r[o]||a),e+=Be(a,n.childNodes[t])}return`
`+i+(e?`
`+e:"")}};W.table={filter:function(i){return i.nodeName==="TABLE"&&me(i.rows[0])},replacement:function(i){return i=i.replace(`

`,`
`),`

`+i+`

`}};W.tableSection={filter:["thead","tbody","tfoot"],replacement:function(i){return i}};function me(i){var n=i.parentNode;return n.nodeName==="THEAD"||n.firstChild===i&&(n.nodeName==="TABLE"||vt(n))&&pt.call(i.childNodes,function(e){return e.nodeName==="TH"})}function vt(i){var n=i.previousSibling;return i.nodeName==="TBODY"&&(!n||n.nodeName==="THEAD"&&/^\s*$/i.test(n.textContent))}function Be(i,n){var e=gt.call(n.parentNode.childNodes,n),r=" ";return e===0&&(r="| "),r+i+" |"}function yt(i){i.keep(function(e){return e.nodeName==="TABLE"&&!me(e.rows[0])});for(var n in W)i.addRule(n,W[n])}function bt(i){i.addRule("taskListItems",{filter:function(n){return n.type==="checkbox"&&n.parentNode.nodeName==="LI"},replacement:function(n,e){return(e.checked?"[x]":"[ ]")+" "}})}function _t(i){i.use([ft,mt,yt,bt])}const Z=new Q({headingStyle:"atx",hr:"---",bulletListMarker:"-",codeBlockStyle:"fenced",emDelimiter:"*"});Z.use(_t);Z.addRule("detailsRule",{filter:"details",replacement:function(i,n){var a;const r=((a=n.querySelector("summary"))==null?void 0:a.textContent)||"思考过程 (Thinking)",t=i.replace(r,"").trim();return`

<details>
<summary>${r}</summary>

${t}

</details>

`}});Z.addRule("fencedCodeBlock",{filter:function(i){return i.nodeName==="PRE"&&i.firstChild!==null&&i.firstChild.nodeName==="CODE"},replacement:function(i,n){const e=n.firstChild,t=(e.getAttribute("class")||"").match(/(?:language|lang)-(\w+)/);return`

\`\`\`${t?t[1]:""}
${e.textContent||""}
\`\`\`

`}});function H(i){return i?Z.turndown(i):""}class Et{constructor(){D(this,"id","deepseek");D(this,"name","DeepSeek Chat")}matches(n){return n.includes("chat.deepseek.com")}detectTurns(){return Array.from(document.querySelectorAll('.ds-markdown, div[class*="ds-markdown"], div[class*="chat-message"]')).filter(e=>!e.closest(".user-message")&&e.textContent&&e.textContent.trim().length>0)}extractTurn(n){var e,r;try{let t="";const a=n.querySelector('.ds-think, div[class*="think"], .ds-collapse');a&&(t=H(a.innerHTML).trim());const o=n.cloneNode(!0),s=o.querySelector('.ds-think, div[class*="think"], .ds-collapse');s&&s.remove();const l=H(o.innerHTML).trim();let c="",h=(e=n.parentElement)==null?void 0:e.previousElementSibling;for(;h;){const m=(r=h.textContent)==null?void 0:r.trim();if(m&&m.length>0){c=m;break}h=h.previousElementSibling}c||(c="用户在 DeepSeek 上的提问");const u=(typeof window<"u"?window.location.href:"")||"https://chat.deepseek.com";let f=`# 🤖 DeepSeek 对话轮次

> 🌐 **来源地址**: [${u}](${u})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: DeepSeek-V3 / R1

---

### ❓ Prompt

${c}

`;return t&&(f+=`<details>
<summary>🧠 思考过程 (DeepSeek Thinking)</summary>

${t}

</details>

`),f+=`### 💡 DeepSeek 回答

${l}

`,{prompt:c,answer:l,thinking:t,modelName:"DeepSeek-V3 / R1",markdown:f}}catch(t){return console.warn("解析 DeepSeek 对话轮次失败",t),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,o)=>{const s=this.extractTurn(a);s&&(s.turnIndex=o+1,e.push(s))});const r=document.title.replace("- DeepSeek","").trim()||"DeepSeek 对话会话";let t=`# ${r}

> 来源: [DeepSeek Chat](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,o)=>{t+=`## 轮次 ${o+1}

${a.markdown}
---

`}),{title:r,modelName:"DeepSeek-V3 / R1",turns:e,markdown:t}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=document.createElement("button");t.className="dsh-chat-inject-btn",t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,t.title="将此轮对话（提示词 + 思考过程 + 回答）保存至 DSH 知识库",t.onclick=a=>{a.stopPropagation(),a.preventDefault();const o=this.extractTurn(r);o&&(t.innerText="已存入 ✓",setTimeout(()=>{t.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(o))},r.style.position="relative",r.prepend(t)})}}class Tt{constructor(){D(this,"id","chatgpt");D(this,"name","ChatGPT")}matches(n){return n.includes("chatgpt.com")||n.includes("chat.openai.com")}detectTurns(){return Array.from(document.querySelectorAll('[data-message-author-role="assistant"]'))}extractTurn(n){var e,r;try{const t=n.querySelector(".markdown")||n,a=H(t.innerHTML).trim();let o="";const s=n.closest('[data-testid^="conversation-turn"]')||n.parentElement,l=s==null?void 0:s.previousElementSibling;if(l){const m=l.querySelector('[data-message-author-role="user"]');m&&(o=((e=m.textContent)==null?void 0:e.trim())||"")}o||(o="ChatGPT 对话提问");let c="";const h=n.querySelector('[data-testid="thought"], div[class*="thought"]');h&&(c=((r=h.textContent)==null?void 0:r.trim())||"");const u=(typeof window<"u"?window.location.href:"")||"https://chatgpt.com";let f=`# 💬 ChatGPT 对话轮次

> 🌐 **来源地址**: [${u}](${u})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: ChatGPT (OpenAI)

---

### ❓ Prompt

${o}

`;return c&&(f+=`<details>
<summary>🧠 ChatGPT 思考过程 (Thought Chain)</summary>

${c}

</details>

`),f+=`### 💡 ChatGPT 回答

${a}

`,{prompt:o,answer:a,thinking:c,modelName:"ChatGPT (OpenAI)",markdown:f}}catch(t){return console.warn("解析 ChatGPT 轮次失败",t),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,o)=>{const s=this.extractTurn(a);s&&(s.turnIndex=o+1,e.push(s))});const r=document.title.replace("- ChatGPT","").trim()||"ChatGPT 对话记录";let t=`# ${r}

> 来源: [ChatGPT](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,o)=>{t+=`## 轮次 ${o+1}

${a.markdown}
---

`}),{title:r,modelName:"ChatGPT",turns:e,markdown:t}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=r.querySelector('div[class*="items-center"], div[class*="text-gray-500"]')||r,a=document.createElement("button");a.className="dsh-chat-inject-btn",a.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,a.onclick=o=>{o.stopPropagation(),o.preventDefault();const s=this.extractTurn(r);s&&(a.innerText="已存入 ✓",setTimeout(()=>{a.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(s))},t.appendChild(a)})}}class Nt{constructor(){D(this,"id","claude");D(this,"name","Claude AI")}matches(n){return n.includes("claude.ai")}detectTurns(){return Array.from(document.querySelectorAll('.font-claude-message, [data-is-streaming], div[class*="font-claude"]'))}extractTurn(n){var e,r;try{let t="";const a=n.querySelector('[data-testid="thought-box"], div[class*="thought"]');a&&(t=((e=a.textContent)==null?void 0:e.trim())||"");const o=n.cloneNode(!0),s=o.querySelector('[data-testid="thought-box"], div[class*="thought"]');s&&s.remove();const l=H(o.innerHTML).trim();let c="";const h=n.closest('[data-testid^="chat-turn"]')||n.parentElement,u=h==null?void 0:h.previousElementSibling;u&&(c=((r=u.textContent)==null?void 0:r.trim())||""),c||(c="Claude 提问");const f=(typeof window<"u"?window.location.href:"")||"https://claude.ai";let m=`# 🧠 Claude 对话轮次

> 🌐 **来源地址**: [${f}](${f})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Claude 3.5 / 3.7

---

### ❓ Prompt

${c}

`;return t&&(m+=`<details>
<summary>🧠 Claude 扩展思考过程 (Extended Thinking)</summary>

${t}

</details>

`),m+=`### 💡 Claude 回答

${l}

`,{prompt:c,answer:l,thinking:t,modelName:"Claude 3.5 / 3.7",markdown:m}}catch(t){return console.warn("解析 Claude 轮次失败",t),null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,o)=>{const s=this.extractTurn(a);s&&(s.turnIndex=o+1,e.push(s))});const r=document.title.replace("- Claude","").trim()||"Claude 对话归档";let t=`# ${r}

> 来源: [Claude.ai](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,o)=>{t+=`## 轮次 ${o+1}

${a.markdown}
---

`}),{title:r,modelName:"Claude 3.5 / 3.7",turns:e,markdown:t}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=document.createElement("button");t.className="dsh-chat-inject-btn",t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        存入 DSH
      `,t.onclick=a=>{a.stopPropagation(),a.preventDefault();const o=this.extractTurn(r);o&&(t.innerText="已存入 ✓",setTimeout(()=>{t.innerHTML=`
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              存入 DSH
            `},2500),n(o))},r.appendChild(t)})}}class wt{constructor(){D(this,"id","gemini");D(this,"name","Google Gemini")}matches(n){return n.includes("gemini.google.com")}detectTurns(){return Array.from(document.querySelectorAll('model-response, message-content, div[class*="model-response"]'))}extractTurn(n){var e,r;try{const t=H(n.innerHTML).trim();let a="Gemini 提问";const o=(e=n.closest(".conversation-container"))==null?void 0:e.querySelector(".user-query");o&&(a=((r=o.textContent)==null?void 0:r.trim())||a);const s=(typeof window<"u"?window.location.href:"")||"https://gemini.google.com";return{prompt:a,answer:t,modelName:"Google Gemini",markdown:`# ✨ Gemini 对话轮次

> 🌐 **来源地址**: [${s}](${s})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Google Gemini

---

### ❓ Prompt

${a}

### 💡 Gemini 回答

${t}

`}}catch{return null}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=[];n.forEach((a,o)=>{const s=this.extractTurn(a);s&&(s.turnIndex=o+1,e.push(s))});const r=document.title.replace("- Gemini","").trim()||"Gemini 对话记录";let t=`# ${r}

> 来源: [Gemini](${window.location.href})
> 归档时间: ${new Date().toLocaleString()}
---

`;return e.forEach((a,o)=>{t+=`## 轮次 ${o+1}

${a.markdown}
---

`}),{title:r,modelName:"Google Gemini",turns:e,markdown:t}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=document.createElement("button");t.className="dsh-chat-inject-btn",t.innerHTML="存入 DSH",t.onclick=a=>{a.stopPropagation(),a.preventDefault();const o=this.extractTurn(r);o&&(t.innerText="已存入 ✓",setTimeout(()=>{t.innerText="存入 DSH"},2e3),n(o))},r.appendChild(t)})}}class xt{constructor(){D(this,"id","doubao");D(this,"name","豆包 (Doubao)")}matches(n){return n.includes("doubao.com")}detectTurns(){return Array.from(document.querySelectorAll('div[class*="assistant-bubble"], div[data-testid="assistant_message"]'))}extractTurn(n){const e=H(n.innerHTML).trim(),r=(typeof window<"u"?window.location.href:"")||"https://www.doubao.com";return{prompt:"豆包对话提问",answer:e,modelName:"Doubao",markdown:`# 🌰 豆包对话轮次

> 🌐 **来源地址**: [${r}](${r})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: Doubao

---

### 💡 豆包回答

${e}

`}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=n.map((t,a)=>{const o=this.extractTurn(t);return o.turnIndex=a+1,o}),r=(typeof window<"u"?window.location.href:"")||"https://www.doubao.com";return{title:document.title||"豆包对话记录",modelName:"Doubao",turns:e,markdown:`# 豆包对话归档

> 🌐 **来源地址**: [${r}](${r})
> ⏰ **归档时间**: ${new Date().toLocaleString()}

---

`+e.map(t=>t.markdown).join(`
---
`)}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=document.createElement("button");t.className="dsh-chat-inject-btn",t.innerText="存入 DSH",t.onclick=()=>{const a=this.extractTurn(r);a&&n(a)},r.appendChild(t)})}}class At{constructor(){D(this,"id","grok");D(this,"name","xAI Grok")}matches(n){return n.includes("grok.com")||n.includes("x.com/i/grok")}detectTurns(){return Array.from(document.querySelectorAll('div[class*="response-message"], div[data-testid="grok-response"]'))}extractTurn(n){const e=H(n.innerHTML).trim(),r=(typeof window<"u"?window.location.href:"")||"https://grok.com";return{prompt:"Grok 提问",answer:e,modelName:"xAI Grok",markdown:`# ⚡ Grok 对话轮次

> 🌐 **来源地址**: [${r}](${r})
> ⏰ **抓取时刻**: ${new Date().toLocaleString()}
> 🏷️ **模型**: xAI Grok

---

### 💡 Grok 回答

${e}

`}}extractSession(){const n=this.detectTurns();if(n.length===0)return null;const e=n.map((t,a)=>{const o=this.extractTurn(t);return o.turnIndex=a+1,o}),r=(typeof window<"u"?window.location.href:"")||"https://grok.com";return{title:document.title||"Grok 对话记录",modelName:"xAI Grok",turns:e,markdown:`# Grok 对话归档

> 🌐 **来源地址**: [${r}](${r})
> ⏰ **归档时间**: ${new Date().toLocaleString()}

---

`+e.map(t=>t.markdown).join(`
---
`)}}injectUI(n){this.detectTurns().forEach(r=>{if(r.dataset.dshInjected==="true")return;r.dataset.dshInjected="true";const t=document.createElement("button");t.className="dsh-chat-inject-btn",t.innerText="存入 DSH",t.onclick=()=>{const a=this.extractTurn(r);a&&n(a)},r.appendChild(t)})}}class St{constructor(){D(this,"adapters",[new Et,new Tt,new Nt,new wt,new xt,new At])}findAdapter(n){return this.adapters.find(e=>e.matches(n))||null}}const He=new St;var Oe={exports:{}};(function(i){function n(e,r){if(r&&r.documentElement)e=r,r=arguments[2];else if(!e||!e.documentElement)throw new Error("First argument to Readability constructor should be a document object.");if(r=r||{},this._doc=e,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!r.debug,this._maxElemsToParse=r.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=r.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=r.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(r.classesToPreserve||[]),this._keepClasses=!!r.keepClasses,this._serializer=r.serializer||function(t){return t.innerHTML},this._disableJSONLD=!!r.disableJSONLD,this._allowedVideoRegex=r.allowedVideoRegex||this.REGEXPS.videos,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let t=function(a){if(a.nodeType==a.TEXT_NODE)return`${a.nodeName} ("${a.textContent}")`;let o=Array.from(a.attributes||[],function(s){return`${s.name}="${s.value}"`}).join(" ");return`<${a.localName} ${o}>`};this.log=function(){if(typeof console<"u"){let o=Array.from(arguments,s=>s&&s.nodeType==this.ELEMENT_NODE?t(s):s);o.unshift("Reader: (Readability)"),console.log.apply(console,o)}else if(typeof dump<"u"){var a=Array.prototype.map.call(arguments,function(o){return o&&o.nodeName?t(o):o}).join(" ");dump("Reader: (Readability) "+a+`
`)}}}else this.log=function(){}}n.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:"section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,shareElements:/(\b|_)(share|sharedaddy)(\b|_)/i,nextLink:/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\W+/g,whitespace:/^\s*$/,hasContent:/\S$/,hashUrl:/^#.+/,srcsetUrl:/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,b64DataUrl:/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,commas:/\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/},UNLIKELY_ROLES:["menu","menubar","complementary","navigation","alert","alertdialog","dialog"],DIV_TO_P_ELEMS:new Set(["BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL"]),ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P"],PRESENTATIONAL_ATTRIBUTES:["align","background","bgcolor","border","cellpadding","cellspacing","frame","hspace","rules","style","valign","vspace"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:["TABLE","TH","TD","HR","PRE"],PHRASING_ELEMS:["ABBR","AUDIO","B","BDO","BR","BUTTON","CITE","CODE","DATA","DATALIST","DFN","EM","EMBED","I","IMG","INPUT","KBD","LABEL","MARK","MATH","METER","NOSCRIPT","OBJECT","OUTPUT","PROGRESS","Q","RUBY","SAMP","SCRIPT","SELECT","SMALL","SPAN","STRONG","SUB","SUP","TEXTAREA","TIME","VAR","WBR"],CLASSES_TO_PRESERVE:["page"],HTML_ESCAPE_MAP:{lt:"<",gt:">",amp:"&",quot:'"',apos:"'"},_postProcessContent:function(e){this._fixRelativeUris(e),this._simplifyNestedElements(e),this._keepClasses||this._cleanClasses(e)},_removeNodes:function(e,r){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _removeNodes");for(var t=e.length-1;t>=0;t--){var a=e[t],o=a.parentNode;o&&(!r||r.call(this,a,t,e))&&o.removeChild(a)}},_replaceNodeTags:function(e,r){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error("Do not pass live node lists to _replaceNodeTags");for(const t of e)this._setNodeTag(t,r)},_forEachNode:function(e,r){Array.prototype.forEach.call(e,r,this)},_findNode:function(e,r){return Array.prototype.find.call(e,r,this)},_someNode:function(e,r){return Array.prototype.some.call(e,r,this)},_everyNode:function(e,r){return Array.prototype.every.call(e,r,this)},_concatNodeLists:function(){var e=Array.prototype.slice,r=e.call(arguments),t=r.map(function(a){return e.call(a)});return Array.prototype.concat.apply([],t)},_getAllNodesWithTag:function(e,r){return e.querySelectorAll?e.querySelectorAll(r.join(",")):[].concat.apply([],r.map(function(t){var a=e.getElementsByTagName(t);return Array.isArray(a)?a:Array.from(a)}))},_cleanClasses:function(e){var r=this._classesToPreserve,t=(e.getAttribute("class")||"").split(/\s+/).filter(function(a){return r.indexOf(a)!=-1}).join(" ");for(t?e.setAttribute("class",t):e.removeAttribute("class"),e=e.firstElementChild;e;e=e.nextElementSibling)this._cleanClasses(e)},_fixRelativeUris:function(e){var r=this._doc.baseURI,t=this._doc.documentURI;function a(l){if(r==t&&l.charAt(0)=="#")return l;try{return new URL(l,r).href}catch{}return l}var o=this._getAllNodesWithTag(e,["a"]);this._forEachNode(o,function(l){var c=l.getAttribute("href");if(c)if(c.indexOf("javascript:")===0)if(l.childNodes.length===1&&l.childNodes[0].nodeType===this.TEXT_NODE){var h=this._doc.createTextNode(l.textContent);l.parentNode.replaceChild(h,l)}else{for(var u=this._doc.createElement("span");l.firstChild;)u.appendChild(l.firstChild);l.parentNode.replaceChild(u,l)}else l.setAttribute("href",a(c))});var s=this._getAllNodesWithTag(e,["img","picture","figure","video","audio","source"]);this._forEachNode(s,function(l){var c=l.getAttribute("src"),h=l.getAttribute("poster"),u=l.getAttribute("srcset");if(c&&l.setAttribute("src",a(c)),h&&l.setAttribute("poster",a(h)),u){var f=u.replace(this.REGEXPS.srcsetUrl,function(m,b,p,_){return a(b)+(p||"")+_});l.setAttribute("srcset",f)}})},_simplifyNestedElements:function(e){for(var r=e;r;){if(r.parentNode&&["DIV","SECTION"].includes(r.tagName)&&!(r.id&&r.id.startsWith("readability"))){if(this._isElementWithoutContent(r)){r=this._removeAndGetNext(r);continue}else if(this._hasSingleTagInsideElement(r,"DIV")||this._hasSingleTagInsideElement(r,"SECTION")){for(var t=r.children[0],a=0;a<r.attributes.length;a++)t.setAttribute(r.attributes[a].name,r.attributes[a].value);r.parentNode.replaceChild(t,r),r=t;continue}}r=this._getNextNode(r)}},_getArticleTitle:function(){var e=this._doc,r="",t="";try{r=t=e.title.trim(),typeof r!="string"&&(r=t=this._getInnerText(e.getElementsByTagName("title")[0]))}catch{}var a=!1;function o(f){return f.split(/\s+/).length}if(/ [\|\-\\\/>»] /.test(r))a=/ [\\\/>»] /.test(r),r=t.replace(/(.*)[\|\-\\\/>»] .*/gi,"$1"),o(r)<3&&(r=t.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi,"$1"));else if(r.indexOf(": ")!==-1){var s=this._concatNodeLists(e.getElementsByTagName("h1"),e.getElementsByTagName("h2")),l=r.trim(),c=this._someNode(s,function(f){return f.textContent.trim()===l});c||(r=t.substring(t.lastIndexOf(":")+1),o(r)<3?r=t.substring(t.indexOf(":")+1):o(t.substr(0,t.indexOf(":")))>5&&(r=t))}else if(r.length>150||r.length<15){var h=e.getElementsByTagName("h1");h.length===1&&(r=this._getInnerText(h[0]))}r=r.trim().replace(this.REGEXPS.normalize," ");var u=o(r);return u<=4&&(!a||u!=o(t.replace(/[\|\-\\\/>»]+/g,""))-1)&&(r=t),r},_prepDocument:function(){var e=this._doc;this._removeNodes(this._getAllNodesWithTag(e,["style"])),e.body&&this._replaceBrs(e.body),this._replaceNodeTags(this._getAllNodesWithTag(e,["font"]),"SPAN")},_nextNode:function(e){for(var r=e;r&&r.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(r.textContent);)r=r.nextSibling;return r},_replaceBrs:function(e){this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(r){for(var t=r.nextSibling,a=!1;(t=this._nextNode(t))&&t.tagName=="BR";){a=!0;var o=t.nextSibling;t.parentNode.removeChild(t),t=o}if(a){var s=this._doc.createElement("p");for(r.parentNode.replaceChild(s,r),t=s.nextSibling;t;){if(t.tagName=="BR"){var l=this._nextNode(t.nextSibling);if(l&&l.tagName=="BR")break}if(!this._isPhrasingContent(t))break;var c=t.nextSibling;s.appendChild(t),t=c}for(;s.lastChild&&this._isWhitespace(s.lastChild);)s.removeChild(s.lastChild);s.parentNode.tagName==="P"&&this._setNodeTag(s.parentNode,"DIV")}})},_setNodeTag:function(e,r){if(this.log("_setNodeTag",e,r),this._docJSDOMParser)return e.localName=r.toLowerCase(),e.tagName=r.toUpperCase(),e;for(var t=e.ownerDocument.createElement(r);e.firstChild;)t.appendChild(e.firstChild);e.parentNode.replaceChild(t,e),e.readability&&(t.readability=e.readability);for(var a=0;a<e.attributes.length;a++)try{t.setAttribute(e.attributes[a].name,e.attributes[a].value)}catch{}return t},_prepArticle:function(e){this._cleanStyles(e),this._markDataTables(e),this._fixLazyImages(e),this._cleanConditionally(e,"form"),this._cleanConditionally(e,"fieldset"),this._clean(e,"object"),this._clean(e,"embed"),this._clean(e,"footer"),this._clean(e,"link"),this._clean(e,"aside");var r=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(e.children,function(t){this._cleanMatchedNodes(t,function(a,o){return this.REGEXPS.shareElements.test(o)&&a.textContent.length<r})}),this._clean(e,"iframe"),this._clean(e,"input"),this._clean(e,"textarea"),this._clean(e,"select"),this._clean(e,"button"),this._cleanHeaders(e),this._cleanConditionally(e,"table"),this._cleanConditionally(e,"ul"),this._cleanConditionally(e,"div"),this._replaceNodeTags(this._getAllNodesWithTag(e,["h1"]),"h2"),this._removeNodes(this._getAllNodesWithTag(e,["p"]),function(t){var a=t.getElementsByTagName("img").length,o=t.getElementsByTagName("embed").length,s=t.getElementsByTagName("object").length,l=t.getElementsByTagName("iframe").length,c=a+o+s+l;return c===0&&!this._getInnerText(t,!1)}),this._forEachNode(this._getAllNodesWithTag(e,["br"]),function(t){var a=this._nextNode(t.nextSibling);a&&a.tagName=="P"&&t.parentNode.removeChild(t)}),this._forEachNode(this._getAllNodesWithTag(e,["table"]),function(t){var a=this._hasSingleTagInsideElement(t,"TBODY")?t.firstElementChild:t;if(this._hasSingleTagInsideElement(a,"TR")){var o=a.firstElementChild;if(this._hasSingleTagInsideElement(o,"TD")){var s=o.firstElementChild;s=this._setNodeTag(s,this._everyNode(s.childNodes,this._isPhrasingContent)?"P":"DIV"),t.parentNode.replaceChild(s,t)}}})},_initializeNode:function(e){switch(e.readability={contentScore:0},e.tagName){case"DIV":e.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":e.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":e.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":e.readability.contentScore-=5;break}e.readability.contentScore+=this._getClassWeight(e)},_removeAndGetNext:function(e){var r=this._getNextNode(e,!0);return e.parentNode.removeChild(e),r},_getNextNode:function(e,r){if(!r&&e.firstElementChild)return e.firstElementChild;if(e.nextElementSibling)return e.nextElementSibling;do e=e.parentNode;while(e&&!e.nextElementSibling);return e&&e.nextElementSibling},_textSimilarity:function(e,r){var t=e.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),a=r.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);if(!t.length||!a.length)return 0;var o=a.filter(l=>!t.includes(l)),s=o.join(" ").length/a.join(" ").length;return 1-s},_checkByline:function(e,r){if(this._articleByline)return!1;if(e.getAttribute!==void 0)var t=e.getAttribute("rel"),a=e.getAttribute("itemprop");return(t==="author"||a&&a.indexOf("author")!==-1||this.REGEXPS.byline.test(r))&&this._isValidByline(e.textContent)?(this._articleByline=e.textContent.trim(),!0):!1},_getNodeAncestors:function(e,r){r=r||0;for(var t=0,a=[];e.parentNode&&(a.push(e.parentNode),!(r&&++t===r));)e=e.parentNode;return a},_grabArticle:function(e){this.log("**** grabArticle ****");var r=this._doc,t=e!==null;if(e=e||this._doc.body,!e)return this.log("No body found in document. Abort."),null;for(var a=e.innerHTML;;){this.log("Starting grabArticle loop");var o=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),s=[],l=this._doc.documentElement;let _e=!0;for(;l;){l.tagName==="HTML"&&(this._articleLang=l.getAttribute("lang"));var c=l.className+" "+l.id;if(!this._isProbablyVisible(l)){this.log("Removing hidden node - "+c),l=this._removeAndGetNext(l);continue}if(l.getAttribute("aria-modal")=="true"&&l.getAttribute("role")=="dialog"){l=this._removeAndGetNext(l);continue}if(this._checkByline(l,c)){l=this._removeAndGetNext(l);continue}if(_e&&this._headerDuplicatesTitle(l)){this.log("Removing header: ",l.textContent.trim(),this._articleTitle.trim()),_e=!1,l=this._removeAndGetNext(l);continue}if(o){if(this.REGEXPS.unlikelyCandidates.test(c)&&!this.REGEXPS.okMaybeItsACandidate.test(c)&&!this._hasAncestorTag(l,"table")&&!this._hasAncestorTag(l,"code")&&l.tagName!=="BODY"&&l.tagName!=="A"){this.log("Removing unlikely candidate - "+c),l=this._removeAndGetNext(l);continue}if(this.UNLIKELY_ROLES.includes(l.getAttribute("role"))){this.log("Removing content with role "+l.getAttribute("role")+" - "+c),l=this._removeAndGetNext(l);continue}}if((l.tagName==="DIV"||l.tagName==="SECTION"||l.tagName==="HEADER"||l.tagName==="H1"||l.tagName==="H2"||l.tagName==="H3"||l.tagName==="H4"||l.tagName==="H5"||l.tagName==="H6")&&this._isElementWithoutContent(l)){l=this._removeAndGetNext(l);continue}if(this.DEFAULT_TAGS_TO_SCORE.indexOf(l.tagName)!==-1&&s.push(l),l.tagName==="DIV"){for(var h=null,u=l.firstChild;u;){var f=u.nextSibling;if(this._isPhrasingContent(u))h!==null?h.appendChild(u):this._isWhitespace(u)||(h=r.createElement("p"),l.replaceChild(h,u),h.appendChild(u));else if(h!==null){for(;h.lastChild&&this._isWhitespace(h.lastChild);)h.removeChild(h.lastChild);h=null}u=f}if(this._hasSingleTagInsideElement(l,"P")&&this._getLinkDensity(l)<.25){var m=l.children[0];l.parentNode.replaceChild(m,l),l=m,s.push(l)}else this._hasChildBlockElement(l)||(l=this._setNodeTag(l,"P"),s.push(l))}l=this._getNextNode(l)}var b=[];this._forEachNode(s,function($){if(!(!$.parentNode||typeof $.parentNode.tagName>"u")){var M=this._getInnerText($);if(!(M.length<25)){var Ee=this._getNodeAncestors($,5);if(Ee.length!==0){var K=0;K+=1,K+=M.split(this.REGEXPS.commas).length,K+=Math.min(Math.floor(M.length/100),3),this._forEachNode(Ee,function(O,ie){if(!(!O.tagName||!O.parentNode||typeof O.parentNode.tagName>"u")){if(typeof O.readability>"u"&&(this._initializeNode(O),b.push(O)),ie===0)var ne=1;else ie===1?ne=2:ne=ie*3;O.readability.contentScore+=K/ne}})}}}});for(var p=[],_=0,v=b.length;_<v;_+=1){var E=b[_],T=E.readability.contentScore*(1-this._getLinkDensity(E));E.readability.contentScore=T,this.log("Candidate:",E,"with score "+T);for(var C=0;C<this._nbTopCandidates;C++){var R=p[C];if(!R||T>R.readability.contentScore){p.splice(C,0,E),p.length>this._nbTopCandidates&&p.pop();break}}}var g=p[0]||null,L=!1,d;if(g===null||g.tagName==="BODY"){for(g=r.createElement("DIV"),L=!0;e.firstChild;)this.log("Moving child out:",e.firstChild),g.appendChild(e.firstChild);e.appendChild(g),this._initializeNode(g)}else if(g){for(var y=[],N=1;N<p.length;N++)p[N].readability.contentScore/g.readability.contentScore>=.75&&y.push(this._getNodeAncestors(p[N]));var A=3;if(y.length>=A)for(d=g.parentNode;d.tagName!=="BODY";){for(var w=0,P=0;P<y.length&&w<A;P++)w+=Number(y[P].includes(d));if(w>=A){g=d;break}d=d.parentNode}g.readability||this._initializeNode(g),d=g.parentNode;for(var V=g.readability.contentScore,z=V/3;d.tagName!=="BODY";){if(!d.readability){d=d.parentNode;continue}var ge=d.readability.contentScore;if(ge<z)break;if(ge>V){g=d;break}V=d.readability.contentScore,d=d.parentNode}for(d=g.parentNode;d.tagName!="BODY"&&d.children.length==1;)g=d,d=g.parentNode;g.readability||this._initializeNode(g)}var S=r.createElement("DIV");t&&(S.id="readability-content");var Ue=Math.max(10,g.readability.contentScore*.2);d=g.parentNode;for(var ee=d.children,q=0,pe=ee.length;q<pe;q++){var x=ee[q],F=!1;if(this.log("Looking at sibling node:",x,x.readability?"with score "+x.readability.contentScore:""),this.log("Sibling has score",x.readability?x.readability.contentScore:"Unknown"),x===g)F=!0;else{var ve=0;if(x.className===g.className&&g.className!==""&&(ve+=g.readability.contentScore*.2),x.readability&&x.readability.contentScore+ve>=Ue)F=!0;else if(x.nodeName==="P"){var ye=this._getLinkDensity(x),be=this._getInnerText(x),te=be.length;(te>80&&ye<.25||te<80&&te>0&&ye===0&&be.search(/\.( |$)/)!==-1)&&(F=!0)}}F&&(this.log("Appending node:",x),this.ALTER_TO_DIV_EXCEPTIONS.indexOf(x.nodeName)===-1&&(this.log("Altering sibling:",x,"to div."),x=this._setNodeTag(x,"DIV")),S.appendChild(x),ee=d.children,q-=1,pe-=1)}if(this._debug&&this.log("Article content pre-prep: "+S.innerHTML),this._prepArticle(S),this._debug&&this.log("Article content post-prep: "+S.innerHTML),L)g.id="readability-page-1",g.className="page";else{var Y=r.createElement("DIV");for(Y.id="readability-page-1",Y.className="page";S.firstChild;)Y.appendChild(S.firstChild);S.appendChild(Y)}this._debug&&this.log("Article content after paging: "+S.innerHTML);var re=!0,X=this._getInnerText(S,!0).length;if(X<this._charThreshold)if(re=!1,e.innerHTML=a,this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS),this._attempts.push({articleContent:S,textLength:X});else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES),this._attempts.push({articleContent:S,textLength:X});else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),this._attempts.push({articleContent:S,textLength:X});else{if(this._attempts.push({articleContent:S,textLength:X}),this._attempts.sort(function($,M){return M.textLength-$.textLength}),!this._attempts[0].textLength)return null;S=this._attempts[0].articleContent,re=!0}if(re){var Ge=[d,g].concat(this._getNodeAncestors(d));return this._someNode(Ge,function($){if(!$.tagName)return!1;var M=$.getAttribute("dir");return M?(this._articleDir=M,!0):!1}),S}}},_isValidByline:function(e){return typeof e=="string"||e instanceof String?(e=e.trim(),e.length>0&&e.length<100):!1},_unescapeHtmlEntities:function(e){if(!e)return e;var r=this.HTML_ESCAPE_MAP;return e.replace(/&(quot|amp|apos|lt|gt);/g,function(t,a){return r[a]}).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi,function(t,a,o){var s=parseInt(a||o,a?16:10);return String.fromCharCode(s)})},_getJSONLD:function(e){var r=this._getAllNodesWithTag(e,["script"]),t;return this._forEachNode(r,function(a){if(!t&&a.getAttribute("type")==="application/ld+json")try{var o=a.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,""),s=JSON.parse(o);if(!s["@context"]||!s["@context"].match(/^https?\:\/\/schema\.org$/)||(!s["@type"]&&Array.isArray(s["@graph"])&&(s=s["@graph"].find(function(u){return(u["@type"]||"").match(this.REGEXPS.jsonLdArticleTypes)})),!s||!s["@type"]||!s["@type"].match(this.REGEXPS.jsonLdArticleTypes)))return;if(t={},typeof s.name=="string"&&typeof s.headline=="string"&&s.name!==s.headline){var l=this._getArticleTitle(),c=this._textSimilarity(s.name,l)>.75,h=this._textSimilarity(s.headline,l)>.75;h&&!c?t.title=s.headline:t.title=s.name}else typeof s.name=="string"?t.title=s.name.trim():typeof s.headline=="string"&&(t.title=s.headline.trim());s.author&&(typeof s.author.name=="string"?t.byline=s.author.name.trim():Array.isArray(s.author)&&s.author[0]&&typeof s.author[0].name=="string"&&(t.byline=s.author.filter(function(u){return u&&typeof u.name=="string"}).map(function(u){return u.name.trim()}).join(", "))),typeof s.description=="string"&&(t.excerpt=s.description.trim()),s.publisher&&typeof s.publisher.name=="string"&&(t.siteName=s.publisher.name.trim()),typeof s.datePublished=="string"&&(t.datePublished=s.datePublished.trim());return}catch(u){this.log(u.message)}}),t||{}},_getArticleMetadata:function(e){var r={},t={},a=this._doc.getElementsByTagName("meta"),o=/\s*(article|dc|dcterm|og|twitter)\s*:\s*(author|creator|description|published_time|title|site_name)\s*/gi,s=/^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;return this._forEachNode(a,function(l){var c=l.getAttribute("name"),h=l.getAttribute("property"),u=l.getAttribute("content");if(u){var f=null,m=null;h&&(f=h.match(o),f&&(m=f[0].toLowerCase().replace(/\s/g,""),t[m]=u.trim())),!f&&c&&s.test(c)&&(m=c,u&&(m=m.toLowerCase().replace(/\s/g,"").replace(/\./g,":"),t[m]=u.trim()))}}),r.title=e.title||t["dc:title"]||t["dcterm:title"]||t["og:title"]||t["weibo:article:title"]||t["weibo:webpage:title"]||t.title||t["twitter:title"],r.title||(r.title=this._getArticleTitle()),r.byline=e.byline||t["dc:creator"]||t["dcterm:creator"]||t.author,r.excerpt=e.excerpt||t["dc:description"]||t["dcterm:description"]||t["og:description"]||t["weibo:article:description"]||t["weibo:webpage:description"]||t.description||t["twitter:description"],r.siteName=e.siteName||t["og:site_name"],r.publishedTime=e.datePublished||t["article:published_time"]||null,r.title=this._unescapeHtmlEntities(r.title),r.byline=this._unescapeHtmlEntities(r.byline),r.excerpt=this._unescapeHtmlEntities(r.excerpt),r.siteName=this._unescapeHtmlEntities(r.siteName),r.publishedTime=this._unescapeHtmlEntities(r.publishedTime),r},_isSingleImage:function(e){return e.tagName==="IMG"?!0:e.children.length!==1||e.textContent.trim()!==""?!1:this._isSingleImage(e.children[0])},_unwrapNoscriptImages:function(e){var r=Array.from(e.getElementsByTagName("img"));this._forEachNode(r,function(a){for(var o=0;o<a.attributes.length;o++){var s=a.attributes[o];switch(s.name){case"src":case"srcset":case"data-src":case"data-srcset":return}if(/\.(jpg|jpeg|png|webp)/i.test(s.value))return}a.parentNode.removeChild(a)});var t=Array.from(e.getElementsByTagName("noscript"));this._forEachNode(t,function(a){var o=e.createElement("div");if(o.innerHTML=a.innerHTML,!!this._isSingleImage(o)){var s=a.previousElementSibling;if(s&&this._isSingleImage(s)){var l=s;l.tagName!=="IMG"&&(l=s.getElementsByTagName("img")[0]);for(var c=o.getElementsByTagName("img")[0],h=0;h<l.attributes.length;h++){var u=l.attributes[h];if(u.value!==""&&(u.name==="src"||u.name==="srcset"||/\.(jpg|jpeg|png|webp)/i.test(u.value))){if(c.getAttribute(u.name)===u.value)continue;var f=u.name;c.hasAttribute(f)&&(f="data-old-"+f),c.setAttribute(f,u.value)}}a.parentNode.replaceChild(o.firstElementChild,s)}}})},_removeScripts:function(e){this._removeNodes(this._getAllNodesWithTag(e,["script","noscript"]))},_hasSingleTagInsideElement:function(e,r){return e.children.length!=1||e.children[0].tagName!==r?!1:!this._someNode(e.childNodes,function(t){return t.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(t.textContent)})},_isElementWithoutContent:function(e){return e.nodeType===this.ELEMENT_NODE&&e.textContent.trim().length==0&&(e.children.length==0||e.children.length==e.getElementsByTagName("br").length+e.getElementsByTagName("hr").length)},_hasChildBlockElement:function(e){return this._someNode(e.childNodes,function(r){return this.DIV_TO_P_ELEMS.has(r.tagName)||this._hasChildBlockElement(r)})},_isPhrasingContent:function(e){return e.nodeType===this.TEXT_NODE||this.PHRASING_ELEMS.indexOf(e.tagName)!==-1||(e.tagName==="A"||e.tagName==="DEL"||e.tagName==="INS")&&this._everyNode(e.childNodes,this._isPhrasingContent)},_isWhitespace:function(e){return e.nodeType===this.TEXT_NODE&&e.textContent.trim().length===0||e.nodeType===this.ELEMENT_NODE&&e.tagName==="BR"},_getInnerText:function(e,r){r=typeof r>"u"?!0:r;var t=e.textContent.trim();return r?t.replace(this.REGEXPS.normalize," "):t},_getCharCount:function(e,r){return r=r||",",this._getInnerText(e).split(r).length-1},_cleanStyles:function(e){if(!(!e||e.tagName.toLowerCase()==="svg")){for(var r=0;r<this.PRESENTATIONAL_ATTRIBUTES.length;r++)e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[r]);this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName)!==-1&&(e.removeAttribute("width"),e.removeAttribute("height"));for(var t=e.firstElementChild;t!==null;)this._cleanStyles(t),t=t.nextElementSibling}},_getLinkDensity:function(e){var r=this._getInnerText(e).length;if(r===0)return 0;var t=0;return this._forEachNode(e.getElementsByTagName("a"),function(a){var o=a.getAttribute("href"),s=o&&this.REGEXPS.hashUrl.test(o)?.3:1;t+=this._getInnerText(a).length*s}),t/r},_getClassWeight:function(e){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var r=0;return typeof e.className=="string"&&e.className!==""&&(this.REGEXPS.negative.test(e.className)&&(r-=25),this.REGEXPS.positive.test(e.className)&&(r+=25)),typeof e.id=="string"&&e.id!==""&&(this.REGEXPS.negative.test(e.id)&&(r-=25),this.REGEXPS.positive.test(e.id)&&(r+=25)),r},_clean:function(e,r){var t=["object","embed","iframe"].indexOf(r)!==-1;this._removeNodes(this._getAllNodesWithTag(e,[r]),function(a){if(t){for(var o=0;o<a.attributes.length;o++)if(this._allowedVideoRegex.test(a.attributes[o].value))return!1;if(a.tagName==="object"&&this._allowedVideoRegex.test(a.innerHTML))return!1}return!0})},_hasAncestorTag:function(e,r,t,a){t=t||3,r=r.toUpperCase();for(var o=0;e.parentNode;){if(t>0&&o>t)return!1;if(e.parentNode.tagName===r&&(!a||a(e.parentNode)))return!0;e=e.parentNode,o++}return!1},_getRowAndColumnCount:function(e){for(var r=0,t=0,a=e.getElementsByTagName("tr"),o=0;o<a.length;o++){var s=a[o].getAttribute("rowspan")||0;s&&(s=parseInt(s,10)),r+=s||1;for(var l=0,c=a[o].getElementsByTagName("td"),h=0;h<c.length;h++){var u=c[h].getAttribute("colspan")||0;u&&(u=parseInt(u,10)),l+=u||1}t=Math.max(t,l)}return{rows:r,columns:t}},_markDataTables:function(e){for(var r=e.getElementsByTagName("table"),t=0;t<r.length;t++){var a=r[t],o=a.getAttribute("role");if(o=="presentation"){a._readabilityDataTable=!1;continue}var s=a.getAttribute("datatable");if(s=="0"){a._readabilityDataTable=!1;continue}var l=a.getAttribute("summary");if(l){a._readabilityDataTable=!0;continue}var c=a.getElementsByTagName("caption")[0];if(c&&c.childNodes.length>0){a._readabilityDataTable=!0;continue}var h=["col","colgroup","tfoot","thead","th"],u=function(m){return!!a.getElementsByTagName(m)[0]};if(h.some(u)){this.log("Data table because found data-y descendant"),a._readabilityDataTable=!0;continue}if(a.getElementsByTagName("table")[0]){a._readabilityDataTable=!1;continue}var f=this._getRowAndColumnCount(a);if(f.rows>=10||f.columns>4){a._readabilityDataTable=!0;continue}a._readabilityDataTable=f.rows*f.columns>10}},_fixLazyImages:function(e){this._forEachNode(this._getAllNodesWithTag(e,["img","picture","figure"]),function(r){if(r.src&&this.REGEXPS.b64DataUrl.test(r.src)){var t=this.REGEXPS.b64DataUrl.exec(r.src);if(t[1]==="image/svg+xml")return;for(var a=!1,o=0;o<r.attributes.length;o++){var s=r.attributes[o];if(s.name!=="src"&&/\.(jpg|jpeg|png|webp)/i.test(s.value)){a=!0;break}}if(a){var l=r.src.search(/base64\s*/i)+7,c=r.src.length-l;c<133&&r.removeAttribute("src")}}if(!((r.src||r.srcset&&r.srcset!="null")&&r.className.toLowerCase().indexOf("lazy")===-1)){for(var h=0;h<r.attributes.length;h++)if(s=r.attributes[h],!(s.name==="src"||s.name==="srcset"||s.name==="alt")){var u=null;if(/\.(jpg|jpeg|png|webp)\s+\d/.test(s.value)?u="srcset":/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(s.value)&&(u="src"),u){if(r.tagName==="IMG"||r.tagName==="PICTURE")r.setAttribute(u,s.value);else if(r.tagName==="FIGURE"&&!this._getAllNodesWithTag(r,["img","picture"]).length){var f=this._doc.createElement("img");f.setAttribute(u,s.value),r.appendChild(f)}}}}})},_getTextDensity:function(e,r){var t=this._getInnerText(e,!0).length;if(t===0)return 0;var a=0,o=this._getAllNodesWithTag(e,r);return this._forEachNode(o,s=>a+=this._getInnerText(s,!0).length),a/t},_cleanConditionally:function(e,r){this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)&&this._removeNodes(this._getAllNodesWithTag(e,[r]),function(t){var a=function(d){return d._readabilityDataTable},o=r==="ul"||r==="ol";if(!o){var s=0,l=this._getAllNodesWithTag(t,["ul","ol"]);this._forEachNode(l,d=>s+=this._getInnerText(d).length),o=s/this._getInnerText(t).length>.9}if(r==="table"&&a(t)||this._hasAncestorTag(t,"table",-1,a)||this._hasAncestorTag(t,"code"))return!1;var c=this._getClassWeight(t);this.log("Cleaning Conditionally",t);var h=0;if(c+h<0)return!0;if(this._getCharCount(t,",")<10){for(var u=t.getElementsByTagName("p").length,f=t.getElementsByTagName("img").length,m=t.getElementsByTagName("li").length-100,b=t.getElementsByTagName("input").length,p=this._getTextDensity(t,["h1","h2","h3","h4","h5","h6"]),_=0,v=this._getAllNodesWithTag(t,["object","embed","iframe"]),E=0;E<v.length;E++){for(var T=0;T<v[E].attributes.length;T++)if(this._allowedVideoRegex.test(v[E].attributes[T].value))return!1;if(v[E].tagName==="object"&&this._allowedVideoRegex.test(v[E].innerHTML))return!1;_++}var C=this._getLinkDensity(t),R=this._getInnerText(t).length,g=f>1&&u/f<.5&&!this._hasAncestorTag(t,"figure")||!o&&m>u||b>Math.floor(u/3)||!o&&p<.9&&R<25&&(f===0||f>2)&&!this._hasAncestorTag(t,"figure")||!o&&c<25&&C>.2||c>=25&&C>.5||_===1&&R<75||_>1;if(o&&g){for(var L=0;L<t.children.length;L++)if(t.children[L].children.length>1)return g;let d=t.getElementsByTagName("li").length;if(f==d)return!1}return g}return!1})},_cleanMatchedNodes:function(e,r){for(var t=this._getNextNode(e,!0),a=this._getNextNode(e);a&&a!=t;)r.call(this,a,a.className+" "+a.id)?a=this._removeAndGetNext(a):a=this._getNextNode(a)},_cleanHeaders:function(e){let r=this._getAllNodesWithTag(e,["h1","h2"]);this._removeNodes(r,function(t){let a=this._getClassWeight(t)<0;return a&&this.log("Removing header with low class weight:",t),a})},_headerDuplicatesTitle:function(e){if(e.tagName!="H1"&&e.tagName!="H2")return!1;var r=this._getInnerText(e,!1);return this.log("Evaluating similarity of header:",r,this._articleTitle),this._textSimilarity(this._articleTitle,r)>.75},_flagIsActive:function(e){return(this._flags&e)>0},_removeFlag:function(e){this._flags=this._flags&~e},_isProbablyVisible:function(e){return(!e.style||e.style.display!="none")&&(!e.style||e.style.visibility!="hidden")&&!e.hasAttribute("hidden")&&(!e.hasAttribute("aria-hidden")||e.getAttribute("aria-hidden")!="true"||e.className&&e.className.indexOf&&e.className.indexOf("fallback-image")!==-1)},parse:function(){if(this._maxElemsToParse>0){var e=this._doc.getElementsByTagName("*").length;if(e>this._maxElemsToParse)throw new Error("Aborting parsing document; "+e+" elements found")}this._unwrapNoscriptImages(this._doc);var r=this._disableJSONLD?{}:this._getJSONLD(this._doc);this._removeScripts(this._doc),this._prepDocument();var t=this._getArticleMetadata(r);this._articleTitle=t.title;var a=this._grabArticle();if(!a)return null;if(this.log("Grabbed: "+a.innerHTML),this._postProcessContent(a),!t.excerpt){var o=a.getElementsByTagName("p");o.length>0&&(t.excerpt=o[0].textContent.trim())}var s=a.textContent;return{title:this._articleTitle,byline:t.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(a),textContent:s,length:s.length,excerpt:t.excerpt,siteName:t.siteName||this._articleSiteName,publishedTime:t.publishedTime}}},i.exports=n})(Oe);var kt=Oe.exports,Ct={exports:{}};(function(i){var n={unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i};function e(t){return(!t.style||t.style.display!="none")&&!t.hasAttribute("hidden")&&(!t.hasAttribute("aria-hidden")||t.getAttribute("aria-hidden")!="true"||t.className&&t.className.indexOf&&t.className.indexOf("fallback-image")!==-1)}function r(t,a={}){typeof a=="function"&&(a={visibilityChecker:a});var o={minScore:20,minContentLength:140,visibilityChecker:e};a=Object.assign(o,a);var s=t.querySelectorAll("p, pre, article"),l=t.querySelectorAll("div > br");if(l.length){var c=new Set(s);[].forEach.call(l,function(u){c.add(u.parentNode)}),s=Array.from(c)}var h=0;return[].some.call(s,function(u){if(!a.visibilityChecker(u))return!1;var f=u.className+" "+u.id;if(n.unlikelyCandidates.test(f)&&!n.okMaybeItsACandidate.test(f)||u.matches("li p"))return!1;var m=u.textContent.trim().length;return m<a.minContentLength?!1:(h+=Math.sqrt(m-a.minContentLength),h>a.minScore)})}i.exports=r})(Ct);var Lt=kt,Dt={Readability:Lt};async function It(i){try{const n=await fetch(i);if(!n.ok)return null;const e=await n.blob();return new Promise(r=>{const t=new FileReader;t.onloadend=()=>r(t.result),t.onerror=()=>r(null),t.readAsDataURL(e)})}catch(n){return console.warn("Failed to fetch image blob:",i,n),null}}async function Rt(i,n=!0){const e=Array.from(i.querySelectorAll("img")),r=[],t=new Map;let a=1;for(const o of e){const s=o.src||o.getAttribute("data-src")||o.getAttribute("data-original");if(!s||s.startsWith("data:")||t.has(s)||o.naturalWidth>0&&o.naturalWidth<32&&o.naturalHeight<32)continue;const l=s.match(/\.(png|jpe?g|gif|webp|svg)/i),c=l?l[1].toLowerCase().replace("jpeg","jpg"):"png",h=`img_${String(a).padStart(2,"0")}_${Math.random().toString(36).slice(2,6)}.${c}`,u=`assets/${h}`;t.set(s,u);let f;n&&(f=await It(s)||void 0),r.push({id:`media-${Date.now()}-${a}`,type:"image",originalUrl:s,filename:h,localPath:u,blobDataUrl:f}),a++}return{attachments:r,urlMap:t}}function Pt(i,n){let e=i;return n.forEach((r,t)=>{const a=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),o=new RegExp(`!\\[(.*?)\\]\\(${a}\\)`,"g");e=e.replace(o,`![$1](${r})`)}),e}async function $t(i,n=!0){var p;const e=i.cloneNode(!0),t=new Dt.Readability(e,{charThreshold:20,keepClasses:!0}).parse(),a=(t==null?void 0:t.title)||i.title||"Untitled Web Page",o=(t==null?void 0:t.byline)||"",s=(t==null?void 0:t.excerpt)||"",l=(t==null?void 0:t.content)||i.body.innerHTML,c=document.createElement("div");c.innerHTML=l;const{attachments:h,urlMap:u}=await Rt(c,n);let f=H(l);f=Pt(f,u);const m=((p=i.location)==null?void 0:p.href)||(typeof window<"u"?window.location.href:"")||"about:blank",b=`# ${a}

> 🌐 **来源地址**: [${m}](${m})
> ⏰ **抓取时间**: ${new Date().toLocaleString()}
${o?`> ✍️ **作者**: ${o}
`:""}
---

`;return{title:a,byline:o,excerpt:s,markdown:b+f,rawHtml:l,mediaAttachments:h}}function xe(i){const n=Math.floor(i/60),e=Math.floor(i%60),r=Math.floor(n/60),t=n%60;return r>0?`${r.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`:`${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`}function Mt(i){return i.includes("bilibili.com/video")?{isVideo:!0,platform:"bilibili"}:i.includes("youtube.com/watch")||i.includes("youtu.be/")?{isVideo:!0,platform:"youtube"}:{isVideo:!1,platform:"other"}}function Bt(i=""){const n=document.querySelector("video"),e=window.location.href,{isVideo:r,platform:t}=Mt(e);if(!r&&!n)return null;const a=n?n.currentTime:0,o=n?n.duration:0,s=xe(a),l=xe(o);let c=e;t==="youtube"?c=`${e.split("&t=")[0]}&t=${Math.floor(a)}s`:t==="bilibili"&&(c=`${e.split("?p=")[0].split("&t=")[0]}?t=${Math.floor(a)}`);const h=document.title||"在线视频调研线索",u=`## 🎬 多模态音视频调研线索

- **标题**: ${h}
- **平台**: ${t==="bilibili"?"哔哩哔哩 (Bilibili)":"YouTube"}
- **播放时间锚点**: \`${s}\` / \`${l}\`
- **精准跳转链接**: [直达 ${s} 播放时刻](${c})
- **原始地址**: ${e}

${i?`### 📝 调研备忘笔记

${i}

`:""}
> 💡 *此多模态线索已建立音视频时间轴锚点，待 DSH 智能体接入后可自动调用 Whisper 转录或截取关键视频帧。*
`;return{title:`[视频线索] ${h.slice(0,40)}`,url:c,sourcePlatform:t,documentType:"media",tags:["Video",t,"MultimodalCue"],markdownContent:u,userNotes:i}}function Ht(i,n,e,r){chrome.runtime.sendMessage({type:"CAPTURE_VISIBLE_TAB_REQUEST"},t=>{var a;if(chrome.runtime.lastError||!t||!t.success||!t.dataUrl){const o=(t==null?void 0:t.error)||((a=chrome.runtime.lastError)==null?void 0:a.message)||"截取当前可视区域失败";n(o);return}Ot(t.dataUrl,i,e,r)})}function Ot(i,n,e,r){var L;const t=document.getElementById("dsh-cropper-overlay");t&&(t.remove(),(L=window.__dsh_cropper_cleanup)==null||L.call(window));const a=document.createElement("div");a.id="dsh-cropper-overlay",a.style.cssText=`
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    z-index: 2147483647 !important;
    cursor: crosshair;
    user-select: none;
    background: rgba(15, 23, 42, 0.45);
  `;const o=document.createElement("div");o.style.cssText=`
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
  `,o.innerHTML="<span>📸 拖拽鼠标框选截图区域，按 Enter 确认保存，按 ESC 退出</span>",a.appendChild(o);const s=document.createElement("div");s.style.cssText=`
    position: fixed;
    border: 2px solid #22c55e;
    background: transparent !important;
    display: none;
    box-shadow: 0 0 0 99999px rgba(15, 23, 42, 0.55);
    z-index: 2147483647;
    pointer-events: none;
  `,a.appendChild(s);const l=document.createElement("div");l.style.cssText=`
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
  `,s.appendChild(l);const c=document.createElement("div");c.id="dsh-crop-action-panel",c.style.cssText=`
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
  `,c.innerHTML=`
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
  `,a.appendChild(c);const h=d=>{c.style.display="flex";const y=Math.min(500,window.innerWidth-24);c.style.width=`${y}px`;const N=c.offsetHeight||48;let A;d.top+d.height+N+14<=window.innerHeight?A=d.top+d.height+10:d.top-N-14>=0?A=d.top-N-10:A=Math.max(12,d.top+d.height-N-14);let w=d.left+d.width-y;w<12&&(w=12),w+y>window.innerWidth-12&&(w=window.innerWidth-y-12),c.style.position="fixed",c.style.top=`${Math.round(A)}px`,c.style.left=`${Math.round(w)}px`};let u=!1,f=0,m=0,b=0,p=0;const _=()=>{a.remove(),document.removeEventListener("keydown",R),window.__dsh_cropper_cleanup=void 0};window.__dsh_cropper_cleanup=_,a.addEventListener("mousedown",d=>{c.contains(d.target)||(u=!0,f=d.clientX,m=d.clientY,b=d.clientX,p=d.clientY,a.style.background="transparent",s.style.display="block",c.style.display="none",s.style.left=`${f}px`,s.style.top=`${m}px`,s.style.width="0px",s.style.height="0px")}),a.addEventListener("mousemove",d=>{if(!u)return;b=d.clientX,p=d.clientY;const y=Math.min(f,b),N=Math.min(m,p),A=Math.abs(b-f),w=Math.abs(p-m);s.style.left=`${y}px`,s.style.top=`${N}px`,s.style.width=`${A}px`,s.style.height=`${w}px`,l.textContent=`${Math.round(A)} × ${Math.round(w)} px`}),a.addEventListener("mouseup",()=>{if(!u)return;u=!1;const d=Math.abs(b-f),y=Math.abs(p-m),N=Math.min(f,b),A=Math.min(m,p);if(d<20||y<20){s.style.display="none",c.style.display="none",a.style.background="rgba(15, 23, 42, 0.45)";return}h({left:N,top:A,width:d,height:y});const w=c.querySelector("#dsh-crop-annotation");w==null||w.focus()}),c.addEventListener("mousedown",d=>d.stopPropagation());const v=c.querySelector("#dsh-crop-confirm-btn"),E=c.querySelector("#dsh-crop-cancel-btn"),T=c.querySelector("#dsh-crop-annotation");E.onclick=_;const C=()=>{var V;if(v.disabled)return;const d=parseInt(s.style.left,10),y=parseInt(s.style.top,10),N=parseInt(s.style.width,10),A=parseInt(s.style.height,10);if(N<20||A<20)return;const w=((V=T==null?void 0:T.value)==null?void 0:V.trim())||"",P=c.querySelector("#dsh-crop-status-tip");v.disabled=!0,E.disabled=!0,v.innerHTML="⏳ 正在保存快照...",P&&(P.style.display="none"),Ut(i,{x:d,y,width:N,height:A},w,n,z=>{z.success?(v.innerHTML="✓ 保存成功！",v.style.background="#16a34a",setTimeout(()=>{_()},500)):(v.disabled=!1,E.disabled=!1,v.innerHTML="重试保存 (Enter ↵)",v.style.background="#ef4444",P&&(P.style.display="block",P.textContent=`❌ 保存失败: ${z.error||"未能成功写入磁盘"}`))},e,r)};v.onclick=C,T==null||T.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),d.stopPropagation(),C())});const R=d=>{d.key==="Escape"?_():d.key==="Enter"&&c.style.display!=="none"&&!v.disabled&&(d.preventDefault(),C())};document.addEventListener("keydown",R);const g=document.documentElement||document.body;g&&g.appendChild(a)}function Ut(i,n,e,r,t,a,o){const s=new Image;s.onload=()=>{const l=window.innerWidth||document.documentElement.clientWidth||1,c=window.innerHeight||document.documentElement.clientHeight||1,h=s.naturalWidth/l,u=s.naturalHeight/c,f=Math.max(0,n.x*h),m=Math.max(0,n.y*u),b=Math.max(1,Math.min(n.width*h,s.naturalWidth-f)),p=Math.max(1,Math.min(n.height*u,s.naturalHeight-m)),_=document.createElement("canvas");_.width=b,_.height=p;const v=_.getContext("2d");if(!v){t({success:!1,error:"无法创建 Canvas 2D 绘图上下文"});return}v.drawImage(s,f,m,b,p,0,0,b,p);const E=_.toDataURL("image/png"),T=Date.now(),C=`screenshot_${T}.png`,R=document.title||"网页局部视觉快照",g={isScreenshot:!0,cropArea:{x:Math.round(n.x),y:Math.round(n.y),width:Math.round(n.width),height:Math.round(n.height),devicePixelRatio:window.devicePixelRatio||1},viewport:{width:l,height:c},pageTitle:R,pageUrl:window.location.href||document.URL||location.href||"about:blank",visualAnnotation:e||"用户框选的网页重点截图快照",agentInstruction:"【DSH 智能体提示】本线索为多模态网页图像截图快照，附件位于 assets/ 目录。包含截取区域坐标与来源上下文。请下游智能体使用视觉多模态模型(Vision LLM)分析图中布局、图表、UI或文字内容。"},L=window.location.href||document.URL||location.href||"about:blank",d=`# 📸 网页截图快照: ${R}

> 🏷️ **模态类型**: 视觉图像快照 (Visual Screenshot)
> 🌐 **来源地址**: [${L}](${L})
> ⏰ **截取时刻**: ${new Date().toLocaleString()}
> 📐 **裁剪分辨率**: ${Math.round(n.width)} × ${Math.round(n.height)} px (DPR: ${window.devicePixelRatio||1})
${e?`> 📝 **视觉数据标注**: ${e}
`:""}

![截图快照](assets/${C})

---
> 🤖 **Agent 视觉感知指令**: 本条目已完成多模态视觉数据标注。下游 DSH 智能体请通过 Vision 模型读取对应 \`assets/\` 附件进行图像解析、图表抽取或 OCR 识别。
`,y=o&&o.length>0?o:["Screenshots"],N={id:`snap-${T}`,project:a||"",topic:y.join("+"),topics:y,title:`[截图快照] ${R.slice(0,35)}`,url:L,urlType:G(L),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"screenshot",tags:["Screenshot","VisualSnapshot","Multimodal",...y],userNotes:e,markdownContent:d,screenshotMetadata:g,mediaAttachments:[{id:`att-snap-${T}`,type:"image",originalUrl:L,filename:C,localPath:`assets/${C}`,blobDataUrl:E}]};r(N,t)},s.onerror=()=>{t({success:!1,error:"截屏图像加载失败，请刷新页面后重试"})},s.src=i}function j(){return window.location.href||document.URL||location.href||"about:blank"}function Gt(){const i="dsh-sensor-styles";if(document.getElementById(i))return;const n=document.createElement("style");n.id=i,n.textContent=`
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
  `,document.head.appendChild(n)}function B(i,n=!1){let e=document.getElementById("dsh-toast-root");e||(e=document.createElement("div"),e.id="dsh-toast-root",e.className="dsh-toast-container",document.body.appendChild(e));const r=document.createElement("div");r.className=`dsh-toast ${n?"error":""}`,r.textContent=i,e.appendChild(r),setTimeout(()=>{r.style.opacity="0",r.style.transition="opacity 0.3s ease",setTimeout(()=>r.remove(),300)},3500)}function U(i,n){chrome.runtime.sendMessage({type:"SAVE_BUNDLE",payload:i},e=>{var r;if(e&&e.success)B(`✓ 已成功归档至 DSH: ${i.title.slice(0,25)}`),n==null||n({success:!0,savedPath:(r=e.data)==null?void 0:r.savedPath});else{const t=(e==null?void 0:e.error)||"未能成功写入磁盘";B(`✕ 保存失败: ${t}`,!0),n==null||n({success:!1,error:t})}})}let I=null;function jt(){document.addEventListener("mouseup",()=>{var a;const i=window.getSelection(),n=i==null?void 0:i.toString().trim();if(I&&(I.remove(),I=null),!n||n.length<5)return;const e=(a=i==null?void 0:i.anchorNode)==null?void 0:a.parentElement;if(e!=null&&e.closest('input, textarea, [contenteditable="true"]'))return;const r=i==null?void 0:i.getRangeAt(0);if(!r)return;const t=r.getBoundingClientRect();t.width===0&&t.height===0||(I=document.createElement("div"),I.className="dsh-floating-pill",I.innerHTML=`
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      存入 DSH
    `,I.style.top=`${window.scrollY+t.top-8}px`,I.style.left=`${window.scrollX+t.left+t.width/2-40}px`,I.onmousedown=o=>o.stopPropagation(),I.onclick=o=>{o.stopPropagation();const s=j(),l={id:`snip-${Date.now()}`,project:"",topic:"",title:`摘录: ${n.slice(0,30)}...`,url:s,urlType:G(s),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"snippet",tags:["Snippet","Quote"],markdownContent:`> ${n.replace(/\n+/g,`
> `)}

---
> 来源出处: [${document.title||s}](${s})`,mediaAttachments:[]};U(l),I&&(I.remove(),I=null)},document.body.appendChild(I))})}function Vt(){const i=j(),n=He.findAdapter(i);if(!n)return;console.log(`[DSH Sensor] 检测到匹配的 AI Chat 平台: ${n.name}`);const e=t=>{const a=j(),o={id:`chat-${Date.now()}`,project:"",topic:"AI-Chat",title:`${n.name}: ${t.prompt.slice(0,30)}`,url:a,urlType:G(a),sourcePlatform:n.id,capturedAt:new Date().toISOString(),documentType:"chat_turn",tags:["AIChat",n.name,t.modelName||"LLM"],markdownContent:t.markdown,aiMetadata:{modelName:t.modelName,hasThinkingChain:!!t.thinking,thinkingContent:t.thinking,promptContext:t.prompt},mediaAttachments:t.mediaAttachments||[]};U(o)};n.injectUI(e),new MutationObserver(()=>{n.injectUI(e)}).observe(document.body,{childList:!0,subtree:!0})}chrome.runtime.onMessage.addListener((i,n,e)=>{var r;if(i.type==="SHOW_TOAST"){const t=i.payload;B(t.message,t.isError),e({ok:!0})}if(i.type==="CAPTURE_FULL_PAGE"){const t=j();return $t(document).then(a=>{const o={id:`page-${Date.now()}`,project:"",topic:"",title:a.title,url:t,urlType:G(t),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"article",tags:["Article","Research"],markdownContent:a.markdown,mediaAttachments:a.mediaAttachments};U(o),e({success:!0,item:o})}).catch(a=>{B(`提取正文失败: ${a.message}`,!0),e({success:!1,error:a.message})}),!0}if(i.type==="CAPTURE_SELECTION"){const t=i.payload,a=(t==null?void 0:t.text)||((r=window.getSelection())==null?void 0:r.toString())||"";if(a){const o=j(),s={id:`snip-${Date.now()}`,project:"",topic:"",title:`摘录: ${a.slice(0,30)}...`,url:o,urlType:G(o),sourcePlatform:"web_article",capturedAt:new Date().toISOString(),documentType:"snippet",tags:["Snippet","Quote"],markdownContent:`> ${a.replace(/\n+/g,`
> `)}

---
> 来源出处: [${document.title||o}](${o})`,mediaAttachments:[]};U(s),e({success:!0})}}if(i.type==="CAPTURE_VIDEO_CUE"){const t=Bt();if(t){const a=t.url||j(),o={id:`vid-${Date.now()}`,project:"",topic:"Video",title:t.title||"视频线索",url:a,urlType:G(a),sourcePlatform:t.sourcePlatform||"bilibili",capturedAt:new Date().toISOString(),documentType:"media",tags:t.tags||["Video"],markdownContent:t.markdownContent||"",mediaAttachments:[]};U(o),e({success:!0,item:o})}else B("当前页面未检测到视频播放器或非支持平台",!0),e({success:!1,error:"未检测到视频"});return!0}if(i.type==="PING")return e({pong:!0}),!0;if(i.type==="START_SCREENSHOT_CAPTURE"){const t=i.payload;return Ht((a,o)=>{U(a,o)},a=>{B(`截图失败: ${a}`,!0)},t==null?void 0:t.project,t==null?void 0:t.topics),e({success:!0}),!0}if(i.type==="CAPTURE_CHAT_SESSION"){const t=j(),a=He.findAdapter(t);if(a){const o=a.extractSession();if(o){const s={id:`session-${Date.now()}`,project:"",topic:"AI-Chat",title:o.title,url:t,urlType:G(t),sourcePlatform:a.id,capturedAt:new Date().toISOString(),documentType:"chat_session",tags:["AISession",a.name,o.modelName||"LLM"],markdownContent:o.markdown,mediaAttachments:o.mediaAttachments||[]};U(s),e({success:!0,item:s})}else B("未能识别到完整的对话轮次",!0),e({success:!1,error:"未能识别对话"})}else B("当前页面不是受支持的 AI 对话平台",!0),e({success:!1,error:"未匹配适配器"});return!0}});Gt();jt();Vt();
