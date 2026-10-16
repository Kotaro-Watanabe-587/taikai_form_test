(() => {
  const PLAYERS_PER_TEAM = 4;
  const T = document.getElementById('teams');
  const msg = document.getElementById('msg');

  const rowHTML = n => `<tr><td class="no">${n}</td><td class="pn" data-label="氏名"><input type="text" aria-label="氏名"></td>
<td data-label="性別"><select aria-label="性別"><option value="">—</option><option>男</option><option>女</option></select></td>
<td data-label="加盟区分"><select class="kb" aria-label="加盟区分"><option value="">—</option><option value="m">加盟</option><option value="n">非加盟</option></select></td>
<td class="cb" data-label="カットマン"><input type="checkbox" aria-label="カットマン"></td>
<td class="cb" data-label="北区在住/在勤"><input type="checkbox" aria-label="北区在住/在勤"></td></tr>`;

  const first = T.firstElementChild;
  first.querySelector('tbody').innerHTML =
    Array.from({ length: PLAYERS_PER_TEAM }, (_, i) => rowHTML(i + 1)).join('');

  const tpl = first.cloneNode(true);
  tpl.querySelector('.tag').remove();
  tpl.querySelector('.kana').placeholder = 'フリガナ';
  tpl.querySelector('.name').placeholder = 'チーム名';
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'del';
  del.textContent = '削除';
  tpl.querySelector('.th').appendChild(del);

  const num = id => Math.max(0, Math.round(Number(document.getElementById(id).value) || 0));
  const yen = v => v.toLocaleString('ja-JP') + ' 円';
  const clearMsg = () => { msg.textContent = ''; msg.className = ''; };

  function calc() {
    let m = 0, n = 0, u = 0;
    [...T.children].forEach(t => {
      const b = t.querySelector('.bd');
      const v = [...t.querySelectorAll('.kb')].map(s => s.value);
      if (v.includes('n')) { n++; b.className = 'bd n'; b.textContent = '非加盟者あり'; }
      else if (v.includes('m')) { m++; b.className = 'bd m'; b.textContent = '全員加盟'; }
      else { u++; b.className = 'bd'; b.textContent = '未選択'; }
    });
    const a = num('u1') * m, b = num('u2') * n;
    document.getElementById('n1').textContent = m;
    document.getElementById('n2').textContent = n;
    document.getElementById('s1').textContent = yen(a);
    document.getElementById('s2').textContent = yen(b);
    document.getElementById('tot').textContent = yen(a + b);
    document.getElementById('warn').textContent =
      u ? `加盟区分が未選択のチームが ${u} つあります（合計に含まれていません）。` : '';
  }

  function renumber() {
    const ts = [...T.children];
    ts.forEach((t, i) => t.querySelectorAll('input[name]').forEach(r => { r.name = `tmp${i}_${r.name}`; }));
    ts.forEach((t, i) => {
      const k = i + 1;
      t.querySelector('.tn').textContent = `チーム ${k}`;
      t.querySelectorAll('.rl, .rn').forEach(r => { r.name = `r${k}`; });
      t.querySelectorAll('.lv').forEach(r => { r.name = `l${k}`; });
    });
  }

  document.querySelector('.f').addEventListener('input', clearMsg);

  T.addEventListener('change', e => {
    const t = e.target.closest('.team');
    if (e.target.classList.contains('lg') && e.target.value) t.querySelector('.rl').checked = true;
    if (e.target.classList.contains('rn')) t.querySelector('.lg').value = '';
    calc(); clearMsg();
  });

  T.addEventListener('click', e => {
    const d = e.target.closest('.del');
    if (!d) return;
    d.closest('.team').remove();
    renumber(); calc(); clearMsg();
  });

  ['u1', 'u2'].forEach(id => document.getElementById(id).addEventListener('input', calc));

  document.getElementById('add').addEventListener('click', () => {
    const b = tpl.cloneNode(true);
    b.querySelectorAll('input').forEach(i => { if (i.type === 'text') i.value = ''; else i.checked = false; });
    b.querySelectorAll('select').forEach(s => { s.value = ''; });
    T.appendChild(b);
    renumber(); calc(); clearMsg();
  });

  document.getElementById('send').addEventListener('click', () => {
    const e = [];
    if (!document.getElementById('club').value.trim()) e.push('クラブ名');
    if (!document.getElementById('rep').value.trim()) e.push('代表者名');
    [...T.children].forEach((t, i) => {
      const p = `チーム ${i + 1}：`;
      if (!t.querySelector('.name').value.trim()) e.push(p + 'チーム名');
      const rl = t.querySelector('.rl').checked, rn = t.querySelector('.rn').checked;
      if (!rl && !rn) e.push(p + 'ランク');
      else if (rl && !t.querySelector('.lg').value) e.push(p + '東京リーグの部');
      else if (rn && !t.querySelector('.lv:checked')) e.push(p + '上・中・下');
      if (![...t.querySelectorAll('.kb')].some(s => s.value)) e.push(p + '参加者の加盟区分');
    });
    if (e.length) {
      msg.className = 'err';
      msg.textContent = '未入力の項目があります：' + e.join('、');
    } else {
      msg.className = 'ok';
      msg.textContent = '入力内容に問題はありません（送信先は未設定です）。';
      // 送信処理はここに追加してください
    }
  });

  calc();
})();
