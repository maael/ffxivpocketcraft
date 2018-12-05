module.exports = `
javascript: (function () {
  var l = '';
  document.querySelectorAll('.item-list--footer.sys_item_list .item-list__name--inline').forEach(function (el) {
    l += el.innerText + String.fromCharCode(13, 10);
  });
  if (l) {
    var o = document.createElement('div');
    var m = document.createElement('div');
    var t = document.createElement('textarea');
    var p = document.createElement('p');
    var ostyle = {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(20, 20, 20, 0.7)',
      zIndex: 10010
    };
    var mstyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(20, 20, 20, 0.5)',
      height: '60vh',
      width: '80vw',
    };
    var tstyle = {
      width: 'calc(100% - 40px)',
      padding: '10px',
      height: '80%',
      margin: '20px',
      boxSizing: 'border-box',
      color: 'white',
      backgroundColor: 'rgba(150, 150, 150, 0.8)',
    };
    var pstyle = {
      position: 'absolute',
      bottom: '10px',
      left: '20px',
      fontWeight: 'bold'
    };
    function applyStyle(el, s) { Object.keys(s).forEach(function (k) { el.style[k] = s[k]; }); }
    applyStyle(p, pstyle);
    applyStyle(t, tstyle);
    applyStyle(m, mstyle);
    applyStyle(o, ostyle);
    t.value = l;
    var c = l.split(String.fromCharCode(13, 10)).filter(Boolean).length;
    p.innerHTML = 'Please copy the ' + c + ' items above and paste into Pocketcraft';
    o.onclick = function (e) { if (e.target === o) o.remove(); };
    m.appendChild(t);
    m.appendChild(p);
    o.appendChild(m);
    document.body.appendChild(o);
  }
})()
`;
