# -*- coding: utf-8 -*-
import glob
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
path = glob.glob("*layz_test.html")[0]
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

s2 = s.replace(
    '  setApp(`\n    <div class="rc" style="border-color:${r.accent}22">',
    '  setApp(`\n    <div class="rc" data-laylay-region="layz-score" style="border-color:${r.accent}22">',
    1,
)

old = """    </div>

    <!-- 추천 행동 -->
    <div style="margin-bottom:14px">"""
new = """    </div>

    <div data-laylay-region="layz-rec">
    <!-- 추천 행동 -->
    <div style="margin-bottom:14px">"""
if old not in s2:
    raise SystemExit("block1 not found")
s2 = s2.replace(old, new, 1)

old2 = """        </div>`).join('')}
    </div>

    <!-- Actions -->
    <button class="btn btn-p" onclick="prepareCard()" style="margin-bottom:.75rem">결과 카드 만들어서 공유하기</button>"""
new2 = """        </div>`).join('')}
    </div>
    </div>

    <!-- Actions -->
    <button class="btn btn-p" onclick="prepareCard()" data-laylay-region="layz-share" style="margin-bottom:.75rem">결과 카드 만들어서 공유하기</button>"""
if old2 not in s2:
    raise SystemExit("block2 not found")
s2 = s2.replace(old2, new2, 1)

inject = """
window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-highlight')return;
  var rid=d.regionId;
  if(!rid)return;
  document.querySelectorAll('.laylay-shell-highlight').forEach(function(n){n.classList.remove('laylay-shell-highlight');});
  var el=document.querySelector('[data-laylay-region="'+rid+'"]');
  if(!el)return;
  el.classList.add('laylay-shell-highlight');
  clearTimeout(window._laylayHlT);
  window._laylayHlT=setTimeout(function(){el.classList.remove('laylay-shell-highlight');},3200);
});
"""

needle = """window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-dev-sync')return;"""
pos = s2.find(needle)
if pos == -1:
    raise SystemExit("dev-sync listener not found")
# insert inject right after opening of listener (after the if return line block closes })
# simpler: append before st = {cur:0...
anchor = "const st = {cur:0"
apos = s2.find(anchor)
if apos == -1:
    raise SystemExit("anchor st not found")
s2 = s2[:apos] + inject + s2[apos:]

if s2 == s:
    print("no diff")
else:
    with open(path, "w", encoding="utf-8") as f:
        f.write(s2)
    print("patched", repr(path))
