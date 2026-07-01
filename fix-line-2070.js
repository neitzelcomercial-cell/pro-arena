var fs = require("fs");
var p = "C:/Users/neitz/Desktop/Pro. arena/index.html";
var lines = fs.readFileSync(p, "utf-8").split("\n");

// The correct line 2070
// The JS source needs to produce this HTML in the page:
// <div style="width:100%;height:200px;overflow:hidden;border-radius:var(--radius-sm);margin-bottom:10px;background:var(--dark-3)"><img src="ACTUAL_IMG_SRC" style="width:100%;height:100%;object-fit:cover" alt="PROD_NAME" loading="lazy" onerror="this.style.display='none';this.parentNode.innerHTML='<div style=height:200px;display:flex;align-items:center;justify-content:center;font-size:64px>ACTUAL_ICO</div>'"></div>

// In JS, the source uses single-quoted strings with + concat for variables.
// Inside HTML attributes, double quotes delimit the attribute value.
// Inside the onerror attribute value, we need literal single quotes.
// JS: '...onerror="this.style.display='none';..."'
// The ' in the JS source produces a literal ' in the HTML attribute value.

var q = "'"; // JS single quote character
var correct =
  "    html += " + q +
  '<div style="width:100%;height:200px;overflow:hidden;border-radius:var(--radius-sm);margin-bottom:10px;background:var(--dark-3)"><img src="' +
  q + " + imgSrc + " + q +
  '" style="width:100%;height:100%;object-fit:cover" alt="' +
  q + " + p.nome + " + q +
  '" loading="lazy" onerror="this.style.display='none';this.parentNode.innerHTML='<div style=height:200px;display:flex;align-items:center;justify-content:center;font-size:64px>' + p.ico + '</div>'"></div>' +
  q + ";";

lines[2069] = correct;
fs.writeFileSync(p, lines.join("\n"), "utf-8");
console.log("Line 2070 rewritten");

// Verify
var newContent = fs.readFileSync(p, "utf-8");
var newLines = newContent.split("\n");
var l = newLines[2069];
var count = 0;
for (var j = 0; j < l.length; j++) {
  if (l[j] === "'") count++;
}
console.log("Literal single quotes:", count, "(should be 8 -> even)");
console.log(l);
