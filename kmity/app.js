import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ================= pomocné ================= */
const PI = Math.PI, TAU = 2 * PI;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const deg = r => r * 180 / PI;
function fmt(v, d = 3) {
  if (v == null || !isFinite(v)) return '–';
  if (Math.abs(v) < 1e-12) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) {
    const e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
    return (Number(m.toPrecision(d)) + '').replace('.', ',') + '·10<sup>' + e + '</sup>';
  }
  return (Number(v.toPrecision(d)) + '').replace('.', ',').replace('-', '−');
}
function fmtPi(v) {
  const q = v / PI;
  if (Math.abs(q) < 1e-9) return '0';
  for (const d of [1, 2, 3, 4, 6, 12]) {
    const n = Math.round(q * d);
    if (n !== 0 && Math.abs(q * d - n) < 1e-6) {
      const num = n === 1 ? '' : n === -1 ? '−' : String(n).replace('-', '−');
      return d === 1 ? num + 'π' : num + 'π/' + d;
    }
  }
  return fmt(q) + 'π';
}
const C_Y = '#0F6F78', C_V = '#D9663A', C_A = '#C99A2E', C_S = '#8B92A0';
const COL = { teal: 0x0f6f78, orange: 0xd9663a, gold: 0xc99a2e, ink: 0x1d2433, steel: 0x9aa3ae, soft: 0xb8bec8 };
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.12 }, o));

/* ================= 3D scéna ================= */
const view = $('#view');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f1ea);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
camera.position.set(3, 1.2, 8);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 40;
controls.minDistance = 2;
scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3ae, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(4, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
scene.add(sun);
const FLOOR = -2.6;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.16 }));
floor.rotation.x = -PI / 2; floor.position.y = FLOOR; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(30, 60, 0xd6cfc0, 0xe6e0d4); grid.position.y = FLOOR + 0.001; scene.add(grid);

function mkLine(color, n = 2, dashed = false, opacity = 1) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.09, gapSize: 0.07, transparent: opacity < 1, opacity })
                   : new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  const l = new THREE.Line(g, m); l.frustumCulled = false; l.userData.n = n; return l;
}
function setLine(l, pts) {
  const a = l.geometry.attributes.position, n = Math.min(pts.length, l.userData.n);
  for (let i = 0; i < n; i++) a.setXYZ(i, pts[i][0], pts[i][1], pts[i][2]);
  a.needsUpdate = true; l.geometry.setDrawRange(0, n);
  if (l.material.isLineDashedMaterial) l.computeLineDistances();
}
function label(text, color = '#1D2433', size = 0.2) {
  const c = document.createElement('canvas'), x = c.getContext('2d'), fs = 64;
  x.font = '600 ' + fs + 'px "Segoe UI", Arial, sans-serif';
  const w = Math.ceil(x.measureText(text).width) + 16;
  c.width = w; c.height = Math.round(fs * 1.35);
  x.font = '600 ' + fs + 'px "Segoe UI", Arial, sans-serif';
  x.fillStyle = color; x.textBaseline = 'middle'; x.fillText(text, 8, c.height / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(size * w / c.height, size, 1); s.renderOrder = 10; return s;
}
function ball(r, color) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat(color)); m.castShadow = true; return m; }
function arrow(color) { return new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, color, 0.16, 0.1); }
function setArrow(a, from, to) {
  const d = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]), L = d.length();
  a.position.set(from[0], from[1], from[2]);
  a.visible = L > 1e-4; if (!a.visible) return;
  a.setDirection(d.normalize()); a.setLength(L, Math.min(0.16, L * 0.4), Math.min(0.1, L * 0.25));
}
function rk4(M, h) {
  const x = M.x, v = M.v, t = M.t;
  const a1 = M.acc(x, v, t);
  const x2 = x + v * h / 2, v2 = v + a1 * h / 2, a2 = M.acc(x2, v2, t + h / 2);
  const x3 = x + v2 * h / 2, v3 = v + a2 * h / 2, a3 = M.acc(x3, v3, t + h / 2);
  const x4 = x + v3 * h, v4 = v + a3 * h, a4 = M.acc(x4, v4, t + h);
  M.x = x + h / 6 * (v + 2 * v2 + 2 * v3 + v4);
  M.v = v + h / 6 * (a1 + 2 * a2 + 2 * a3 + a4);
  M.t = t + h;
}
function integrate(M, dt, wmax) {
  if (dt <= 0) return;
  const n = Math.min(4000, Math.ceil(dt / Math.min(0.01, 0.03 / Math.max(wmax, 1e-6))));
  const h = dt / n;
  for (let i = 0; i < n; i++) rk4(M, h);
}

/* ================= PRUŽINA (i rezonance) ================= */
const springGeo = (() => {
  class H extends THREE.Curve { getPoint(t, o = new THREE.Vector3()) { const a = t * 14 * TAU; return o.set(0.2 * Math.cos(a), t, 0.2 * Math.sin(a)); } }
  return new THREE.TubeGeometry(new H(), 700, 0.02, 8, false);
})();

function springModel(drive) {
  const DS = 10, TOP = 2.4, g = new THREE.Group();
  const M = { group: g, P: {}, mark: null, x: 0, v: 0, t: 0 };
  M.cam = { pos: [2.6, 1.0, 7.6], target: [0, 0.7, 0] };
  M.defaults = drive ? () => ({ m: 0.2, k: 8, fd: 0.5, d: 0.006, b: 0.12, A: 0, phi: 0 })
                     : () => ({ m: 0.2, k: 8, A: 0.08, phi: PI / 2, b: 0 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = drive ? [
    { id: 'm', label: 'Hmotnost závaží <i>m</i>', min: 0.05, max: 2, log: true, unit: 'kg' },
    { id: 'k', label: 'Tuhost pružiny <i>k</i>', min: 1, max: 100, log: true, unit: 'N/m' },
    { id: 'fd', label: 'Budicí frekvence <i>f</i><sub>b</sub>', min: 0.05, max: 3, log: true, unit: 'Hz' },
    { id: 'd', label: 'Rozkmit úchytu (budiče)', min: 0.001, max: 0.02, mul: 100, unit: 'cm', step: 0.0005 },
    { id: 'b', label: 'Tlumení <i>b</i>', min: 0.02, max: 3, log: true, unit: 'kg/s' }
  ] : [
    { id: 'm', label: 'Hmotnost závaží <i>m</i>', min: 0.001, max: 2, log: true, unit: 'kg' },
    { id: 'k', label: 'Tuhost pružiny <i>k</i>', min: 0.5, max: 300, log: true, unit: 'N/m' },
    { id: 'A', label: 'Amplituda <i>y</i><sub>m</sub>', min: 0, max: 0.15, mul: 100, unit: 'cm', step: 0.001 },
    { id: 'phi', label: 'Počáteční fáze <i>φ</i><sub>0</sub>', min: 0, max: TAU, pi: true, step: PI / 12 },
    { id: 'b', label: 'Tlumení <i>b</i> (0 = netlumené)', min: 0, max: 2, unit: 'kg/s', step: 0.01 }
  ];
  M.about = drive
    ? '<p><b>Nucené kmity a rezonance.</b> Horní úchyt pružiny kmitá s budicí frekvencí <span class="f">f</span><sub>b</sub>. Po chvíli kmitá závaží se stejnou frekvencí jako budič.</p><p>Když se <span class="f">f</span><sub>b</sub> blíží vlastní frekvenci <span class="f">f</span><sub>0</sub> = (1/2π)·√(k/m), amplituda prudce roste. To je <b>rezonance</b>. Větší tlumení rezonanci zmenšuje.</p><p>Graf pod hodnotami ukazuje amplitudu podle budicí frekvence, tečka je současný stav. Zkus posuvník <span class="f">f</span><sub>b</sub> pomalu dostat na vrchol křivky.</p>'
    : '<p><b>Pružinový oscilátor.</b> Závaží kmitá kolem rovnovážné polohy. Síla pružiny <span class="f">F = −k·y</span> ho vrací zpět.</p><p><span class="f">ω = √(k/m)</span>, <span class="f">T = 2π√(m/k)</span>, <span class="f">f = 1/T</span>. Perioda nezávisí na amplitudě.</p><p><span class="f">y = y<sub>m</sub>·sin(ωt + φ<sub>0</sub>)</span>, <span class="f">v = ω·y<sub>m</sub>·cos(ωt + φ<sub>0</sub>)</span>, <span class="f">a = −ω²·y</span>. V krajní poloze je největší zrychlení, v rovnovážné poloze největší rychlost.</p><p>Energie se přelévá mezi polohovou <span class="f">½ky²</span> a pohybovou <span class="f">½mv²</span>, součet zůstává stejný. Posuvníkem <i>b</i> zapneš tlumené kmity. <b>Závaží můžeš chytit myší, povytáhnout a pustit.</b></p>';

  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.9), mat(COL.ink)); beam.castShadow = true; g.add(beam);
  const spring = new THREE.Mesh(springGeo, mat(COL.steel, { metalness: 0.7, roughness: 0.3 })); spring.castShadow = true; g.add(spring);
  const mass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.62), mat(COL.orange)); mass.castShadow = true; g.add(mass);
  const eq = mkLine(COL.teal, 2, true); setLine(eq, [[-1.5, 0, -0.5], [1.5, 0, -0.5]]); g.add(eq);
  const lEq = label('rovnovážná poloha', '#0F6F78', 0.17); lEq.center.set(0, 0.5); lEq.position.set(1.55, 0, -0.5); g.add(lEq);
  const up = mkLine(COL.gold, 2, true), dn = mkLine(COL.gold, 2, true); g.add(up, dn);
  const lUp = label('+ yₘ', '#C99A2E', 0.17), lDn = label('− yₘ', '#C99A2E', 0.17);
  lUp.center.set(0, 0.5); lDn.center.set(0, 0.5); g.add(lUp, lDn);
  let rod = null;
  if (drive) {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.36, 32), mat(COL.ink)); motor.rotation.x = PI / 2; motor.position.set(0, TOP + 1.0, 0); g.add(motor);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12), mat(COL.gold)); wheel.rotation.x = PI / 2; wheel.position.set(0, TOP + 1.0, 0); g.add(wheel);
    rod = mkLine(COL.ink, 2); g.add(rod);
    lEq.visible = false; eq.visible = false;
  }
  const ys = t => drive ? P.d * Math.sin(TAU * P.fd * t) : 0;
  M.acc = (x, v, t) => (-P.k * (x - ys(t)) - P.b * v) / P.m;
  M.reset = () => { const w = Math.sqrt(P.k / P.m); M.t = 0; M.x = P.A * Math.sin(P.phi); M.v = P.A * w * Math.cos(P.phi); };
  M.changed = id => { if (id === 'A' || id === 'phi') M.reset(); };
  M.update = dt => {
    if (M.dragging) { M.t += dt; M.v = 0; return; }
    integrate(M, dt, Math.max(Math.sqrt(P.k / P.m), drive ? TAU * P.fd : 0));
  };
  M.sync3d = () => {
    const sy = TOP + ys(M.t) * DS;
    beam.position.set(0, sy + 0.07, 0);
    const my = clamp(M.x, -0.2, 0.2) * DS;
    mass.position.set(0, my, 0);
    const top = my + 0.25, len = Math.max(0.05, sy - top);
    spring.position.set(0, top, 0); spring.scale.set(1, len, 1);
    const A = P.A, show = !drive && A > 0.002;
    up.visible = dn.visible = lUp.visible = lDn.visible = show;
    if (show) {
      setLine(up, [[-1, A * DS, -0.5], [1, A * DS, -0.5]]); setLine(dn, [[-1, -A * DS, -0.5], [1, -A * DS, -0.5]]);
      lUp.position.set(1.05, A * DS, -0.5); lDn.position.set(1.05, -A * DS, -0.5);
    }
    if (rod) setLine(rod, [[0, TOP + 1.0, 0], [0, sy + 0.14, 0]]);
  };
  M.channels = () => drive ? [
    { name: 'výchylka závaží', unit: 'cm', color: C_Y, strip: 0 },
    { name: 'pohyb úchytu', unit: 'cm', color: C_S, strip: 0 },
    { name: 'rychlost v', unit: 'm/s', color: C_V, strip: 1 },
    { name: 'zrychlení a', unit: 'm/s²', color: C_A, strip: 2 }
  ] : [
    { name: 'výchylka y', unit: 'cm', color: C_Y, strip: 0 },
    { name: 'rychlost v', unit: 'm/s', color: C_V, strip: 1 },
    { name: 'zrychlení a', unit: 'm/s²', color: C_A, strip: 2 }
  ];
  M.sample = () => {
    const a = M.dragging ? 0 : M.acc(M.x, M.v, M.t);
    return drive ? [M.x * 100, ys(M.t) * 100, M.v, a] : [M.x * 100, M.v, a];
  };
  M.window = () => {
    const T = TAU * Math.sqrt(P.m / P.k);
    return drive ? clamp(4 * Math.max(T, 1 / P.fd), 3, 40) : clamp(3 * T, 1.5, 30);
  };
  M.energy = () => ({ Ek: 0.5 * P.m * M.v * M.v, Ep: 0.5 * P.k * Math.pow(M.x - ys(M.t), 2) });
  M.readouts = () => {
    const w = Math.sqrt(P.k / P.m), T = TAU / w;
    if (drive) {
      const wd = TAU * P.fd, X = P.d * P.k / Math.sqrt(Math.pow(P.k - P.m * wd * wd, 2) + Math.pow(P.b * wd, 2));
      return [
        ['vlastní frekvence <i>f</i><sub>0</sub>', fmt(1 / T) + ' Hz'],
        ['budicí frekvence <i>f</i><sub>b</sub>', fmt(P.fd) + ' Hz'],
        ['poměr <i>f</i><sub>b</sub> / <i>f</i><sub>0</sub>', fmt(P.fd * T)],
        ['ustálená amplituda závaží', fmt(X * 100) + ' cm'],
        ['zesílení oproti budiči', fmt(X / P.d) + '×']
      ];
    }
    return [
      ['<i>ω</i> = √(<i>k</i>/<i>m</i>)', fmt(w) + ' rad·s<sup>−1</sup>'],
      ['<i>T</i> = 2π√(<i>m</i>/<i>k</i>)', fmt(T) + ' s'],
      ['<i>f</i> = 1/<i>T</i>', fmt(1 / T) + ' Hz'],
      ['<i>v</i><sub>max</sub> = <i>ω</i>·<i>y</i><sub>m</sub>', fmt(w * P.A) + ' m·s<sup>−1</sup>'],
      ['<i>a</i><sub>max</sub> = <i>ω</i>²·<i>y</i><sub>m</sub>', fmt(w * w * P.A) + ' m·s<sup>−2</sup>'],
      ['<i>E</i> = ½·<i>k</i>·<i>y</i><sub>m</sub>²', fmt(0.5 * P.k * P.A * P.A) + ' J'],
      ['prodloužení v rovnováze Δ<i>l</i> = <i>mg</i>/<i>k</i>', fmt(P.m * 9.81 / P.k * 100) + ' cm'],
      ['teď: <i>y</i>', fmt(M.x * 100) + ' cm'],
      ['teď: <i>v</i>, <i>a</i>', fmt(M.v) + ' m/s · ' + fmt(M.dragging ? 0 : M.acc(M.x, M.v, M.t)) + ' m/s²']
    ];
  };
  M.drag = {
    mesh: mass,
    start() { M.dragging = true; },
    move(p) { M.x = clamp(p.y / DS, -0.15, 0.15); M.v = 0; },
    end() { M.dragging = false; if (!drive) { P.A = Math.abs(M.x); P.phi = M.x >= 0 ? PI / 2 : 1.5 * PI; syncSliders(); } }
  };
  if (drive) {
    M.curve = cv => {
      const dpr = Math.min(window.devicePixelRatio, 2), W = cv.clientWidth, H = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      const w0 = Math.sqrt(P.k / P.m), R = r => { const wd = r * w0; return P.k / Math.sqrt(Math.pow(P.k - P.m * wd * wd, 2) + Math.pow(P.b * wd, 2)); };
      let ymax = 0; for (let i = 1; i <= 300; i++) ymax = Math.max(ymax, R(i / 100));
      ymax = Math.min(ymax * 1.1, 80);
      const L = 34, B = H - 22, Wp = W - L - 8, Hp = B - 8;
      x.strokeStyle = '#E0DBD0'; x.lineWidth = 1; x.beginPath(); x.moveTo(L, 8); x.lineTo(L, B); x.lineTo(W - 8, B); x.stroke();
      x.setLineDash([4, 4]); x.beginPath(); x.moveTo(L + Wp / 3, 8); x.lineTo(L + Wp / 3, B); x.stroke(); x.setLineDash([]);
      x.strokeStyle = C_Y; x.lineWidth = 2.2; x.beginPath();
      for (let i = 0; i <= 300; i++) { const r = i / 100, yy = B - Math.min(R(r), ymax) / ymax * Hp; i ? x.lineTo(L + r / 3 * Wp, yy) : x.moveTo(L, yy); }
      x.stroke();
      const r = P.fd * TAU / w0;
      if (r <= 3) { x.fillStyle = C_V; x.beginPath(); x.arc(L + r / 3 * Wp, B - Math.min(R(r), ymax) / ymax * Hp, 6, 0, TAU); x.fill(); }
      x.fillStyle = '#5E6675'; x.font = '12px Segoe UI, sans-serif';
      x.fillText('f_b / f_0', W - 60, H - 5); x.fillText('1', L + Wp / 3 - 3, H - 5); x.fillText('0', L - 4, H - 5); x.fillText('3', W - 14, H - 5);
      x.save(); x.translate(12, B - 4); x.rotate(-PI / 2); x.fillText('zesílení', 0, 0); x.restore();
    };
  }
  M.reset();
  return M;
}

/* ================= KYVADLO ================= */
function pendulumModel() {
  const TOP = 2.6, g = new THREE.Group();
  const M = { group: g, P: {}, mark: null, x: 0, v: 0, t: 0 };
  M.cam = { pos: [2.4, 1.2, 8], target: [0, 1.1, 0] };
  M.defaults = () => ({ l: 1, m: 0.5, th0: 15, g: 9.81, a: 0 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = [
    { id: 'l', label: 'Délka závěsu <i>l</i>', min: 0.05, max: 30, log: true, unit: 'm' },
    { id: 'm', label: 'Hmotnost kuličky <i>m</i>', min: 0.05, max: 5, log: true, unit: 'kg' },
    { id: 'th0', label: 'Počáteční výchylka <i>α</i><sub>0</sub>', min: 1, max: 80, step: 1, unit: '°' },
    { id: 'g', label: 'Tíhové zrychlení <i>g</i>', min: 0.5, max: 25, step: 0.01, unit: 'm/s²', buttons: [['Země', 9.81], ['Mars', 3.71], ['Měsíc', 1.62], ['Jupiter', 24.8]] },
    { id: 'a', label: 'Výtah: zrychlení <i>a</i> (+ nahoru)', min: -5, max: 5, step: 0.1, unit: 'm/s²', buttons: [['stojí / stálá rychlost', 0]] }
  ];
  M.about = '<p><b>Matematické kyvadlo:</b> malá kulička na lehkém závěsu délky <span class="f">l</span>.</p><p>Pro malé výchylky (asi do 5°) kmitá harmonicky s periodou <span class="f">T = 2π√(l/g)</span>. Perioda nezávisí na hmotnosti ani na amplitudě. Takovým kmitům říkáme <b>izochronní</b>.</p><p><b>Doba kyvu</b> je cesta z jedné krajní polohy do druhé, tedy <b>polovina periody</b>.</p><p>Ve výtahu, který zrychluje nahoru se zrychlením <span class="f">a</span>, kyvadlo „cítí“ <span class="f">g′ = g + a</span>. Při stálé rychlosti se nic nemění.</p><p>Simulace počítá přesně i velké výchylky, proto se u velkých úhlů skutečná perioda trochu liší od vzorce. <b>Kuličku můžeš chytit a vychýlit.</b></p>';

  const ceil = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.8), mat(COL.ink)); ceil.position.y = TOP + 0.07; ceil.castShadow = true; g.add(ceil);
  const pin = ball(0.05, COL.gold); pin.position.y = TOP; g.add(pin);
  const rod = mkLine(COL.ink, 2); g.add(rod);
  const bob = ball(1, COL.orange); g.add(bob);
  const vert = mkLine(COL.teal, 2, true); g.add(vert);
  const arc = mkLine(COL.gold, 64, true); g.add(arc);
  const cabin = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 3.6, 1.8)), new THREE.LineBasicMaterial({ color: COL.soft }));
  cabin.position.y = 1.05; g.add(cabin);
  const accA = arrow(COL.orange); g.add(accA);
  const lAcc = label('zrychlení výtahu', '#D9663A', 0.16); lAcc.center.set(0, 0.5); g.add(lAcc);
  const geff = () => Math.max(0.05, P.g + P.a);
  const sc = () => P.l > 2.6 ? 2.6 / P.l : P.l < 0.4 ? 0.4 / P.l : 1;
  M.acc = (x) => -(geff() / P.l) * Math.sin(x);
  M.reset = () => { M.t = 0; M.x = P.th0 * PI / 180; M.v = 0; };
  M.changed = id => { if (id === 'th0') M.reset(); };
  M.update = dt => { if (M.dragging) { M.t += dt; M.v = 0; return; } integrate(M, dt, Math.sqrt(geff() / P.l)); };
  M.sync3d = () => {
    const L = P.l * sc(), th = M.x;
    const bx = L * Math.sin(th), by = TOP - L * Math.cos(th);
    const r = 0.09 + 0.07 * Math.cbrt(P.m);
    bob.scale.setScalar(r); bob.position.set(bx, by, 0);
    setLine(rod, [[0, TOP, 0], [bx, by, 0]]);
    setLine(vert, [[0, TOP, 0], [0, TOP - L - 0.35, 0]]);
    const a0 = P.th0 * PI / 180, pts = [];
    for (let i = 0; i < 64; i++) { const a = -a0 + 2 * a0 * i / 63; pts.push([L * Math.sin(a), TOP - L * Math.cos(a), 0]); }
    setLine(arc, pts);
    const el = Math.abs(P.a) > 0.01;
    cabin.visible = accA.visible = lAcc.visible = el;
    if (el) { const len = 0.35 + 0.12 * Math.abs(P.a); setArrow(accA, [2.3, 1.2, 0], [2.3, 1.2 + Math.sign(P.a) * len, 0]); lAcc.position.set(2.45, 1.2 + Math.sign(P.a) * len * 0.5, 0); }
  };
  M.channels = () => [
    { name: 'úhel α', unit: '°', color: C_Y, strip: 0 },
    { name: 'rychlost kuličky v', unit: 'm/s', color: C_V, strip: 1 },
    { name: 'tečné zrychlení', unit: 'm/s²', color: C_A, strip: 2 }
  ];
  M.sample = () => [deg(M.x), P.l * M.v, M.dragging ? 0 : P.l * M.acc(M.x)];
  M.window = () => clamp(3 * TAU * Math.sqrt(P.l / geff()), 2, 40);
  M.energy = () => ({ Ek: 0.5 * P.m * Math.pow(P.l * M.v, 2), Ep: P.m * geff() * P.l * (1 - Math.cos(M.x)) });
  M.readouts = () => {
    const ge = geff(), T = TAU * Math.sqrt(P.l / ge), a0 = P.th0 * PI / 180, h = P.l * (1 - Math.cos(a0)), s = sc();
    const out = [
      ['<i>T</i> = 2π√(<i>l</i>/<i>g′</i>)', fmt(T) + ' s'],
      ['<i>f</i> = 1/<i>T</i>', fmt(1 / T) + ' Hz'],
      ['doba kyvu = <i>T</i>/2', fmt(T / 2) + ' s'],
      ['<i>g′</i> = <i>g</i> + <i>a</i>', fmt(ge) + ' m·s<sup>−2</sup>'],
      ['výška zdvihu <i>h</i> = <i>l</i>(1 − cos <i>α</i><sub>0</sub>)', fmt(h) + ' m'],
      ['Δ<i>E</i><sub>p</sub> = <i>m</i>·<i>g′</i>·<i>h</i>', fmt(P.m * ge * h) + ' J'],
      ['<i>v</i><sub>max</sub> = √(2<i>g′h</i>)', fmt(Math.sqrt(2 * ge * h)) + ' m·s<sup>−1</sup>'],
      ['max. tečné zrychlení <i>g′</i>·sin <i>α</i><sub>0</sub>', fmt(ge * Math.sin(a0)) + ' m·s<sup>−2</sup>']
    ];
    if (Math.abs(s - 1) > 1e-6) out.push(['na obrazovce ' + (s < 1 ? 'zmenšeno' : 'zvětšeno'), (s < 1 ? '1 : ' + fmt(1 / s, 2) : fmt(s, 2) + ' : 1')]);
    return out;
  };
  M.drag = {
    mesh: bob,
    start() { M.dragging = true; },
    move(p) { M.x = clamp(Math.atan2(p.x, TOP - p.y), -80 * PI / 180, 80 * PI / 180); M.v = 0; },
    end() { M.dragging = false; P.th0 = Math.max(1, Math.round(Math.abs(deg(M.x)))); syncSliders(); }
  };
  M.reset();
  return M;
}

/* ================= KRUH A FÁZE ================= */
function circleModel() {
  const g = new THREE.Group(), C = [-1.4, 0.3, 0];
  const M = { group: g, P: {}, mark: null, t: 0 };
  M.cam = { pos: [0.2, 0.6, 8], target: [0, 0.3, 0] };
  M.defaults = () => ({ A: 5, w: 1.5, phi: 0 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = [
    { id: 'A', label: 'Amplituda <i>y</i><sub>m</sub> (poloměr)', min: 1, max: 10, step: 0.1, unit: 'cm' },
    { id: 'w', label: 'Úhlová frekvence <i>ω</i>', min: 0.2, max: 30, log: true, unit: 'rad/s' },
    { id: 'phi', label: 'Počáteční fáze <i>φ</i><sub>0</sub>', min: 0, max: TAU, pi: true, step: PI / 12 }
  ];
  M.about = '<p><b>Kmitání a rovnoměrný pohyb po kružnici.</b> Oranžová kulička obíhá po kružnici stálou úhlovou rychlostí <span class="f">ω</span>. Modrá kulička vpravo je její průmět: kmitá nahoru a dolů a to je přesně <b>harmonický kmit</b>.</p><p>Šipka je <b>fázor</b> (otáčivý vektor) délky <span class="f">y<sub>m</sub></span>. Úhel, který svírá s vodorovnou osou, je <b>fáze</b> <span class="f">φ = ωt + φ<sub>0</sub></span>. Výška jeho konce je okamžitá výchylka <span class="f">y = y<sub>m</sub>·sin(ωt + φ<sub>0</sub>)</span>.</p><p>Fáze běží od 0 do <b>2π</b>. Pak je kulička zpátky na začátku a všechno se opakuje. Jedna otočka trvá jednu periodu <span class="f">T = 2π/ω</span>.</p>';
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 128), mat(COL.soft)); ring.position.set(...C); g.add(ring);
  const center = ball(0.035, COL.ink); center.position.set(...C); g.add(center);
  const b = ball(0.1, COL.orange); g.add(b);
  const ph = arrow(COL.orange); g.add(ph);
  const pr = ball(0.11, COL.teal); g.add(pr);
  const track = mkLine(COL.teal, 2, false, 0.5); g.add(track);
  const link = mkLine(COL.orange, 2, true); g.add(link);
  const axis = mkLine(COL.soft, 2, true); setLine(axis, [[C[0] - 1.8, C[1], 0], [1.8, C[1], 0]]); g.add(axis);
  const arcL = mkLine(COL.gold, 64); g.add(arcL);
  const lPh = label('φ', '#C99A2E', 0.24); g.add(lPh);
  const lY = label('y', '#0F6F78', 0.24); lY.center.set(0, 0.5); g.add(lY);
  M.reset = () => { M.t = 0; };
  M.changed = () => {};
  M.update = dt => { M.t += dt; };
  const phase = () => P.w * M.t + P.phi;
  M.sync3d = () => {
    const R = P.A * 0.15, f = phase();
    ring.scale.setScalar(R);
    const tip = [C[0] + R * Math.cos(f), C[1] + R * Math.sin(f), 0];
    b.position.set(...tip); setArrow(ph, C, tip);
    pr.position.set(1.3, tip[1], 0);
    setLine(track, [[1.3, C[1] - R, 0], [1.3, C[1] + R, 0]]);
    setLine(link, [tip, [1.3, tip[1], 0]]);
    const fm = ((f % TAU) + TAU) % TAU, rr = 0.25 * R + 0.12, pts = [];
    for (let i = 0; i < 64; i++) { const a = fm * i / 63; pts.push([C[0] + rr * Math.cos(a), C[1] + rr * Math.sin(a), 0]); }
    setLine(arcL, pts);
    lPh.position.set(C[0] + (rr + 0.16) * Math.cos(fm / 2), C[1] + (rr + 0.16) * Math.sin(fm / 2), 0);
    lY.position.set(1.48, tip[1], 0);
  };
  M.channels = () => [
    { name: 'výchylka y', unit: 'cm', color: C_Y, strip: 0 },
    { name: 'rychlost v', unit: 'm/s', color: C_V, strip: 1 },
    { name: 'zrychlení a', unit: 'm/s²', color: C_A, strip: 2 }
  ];
  M.sample = () => { const f = phase(), A = P.A / 100; return [100 * A * Math.sin(f), A * P.w * Math.cos(f), -A * P.w * P.w * Math.sin(f)]; };
  M.window = () => clamp(2.5 * TAU / P.w, 1.5, 30);
  M.energy = null;
  M.readouts = () => {
    const f = phase(), fm = ((f % TAU) + TAU) % TAU;
    return [
      ['rovnice', '<span class="f">y = ' + fmt(P.A) + '·sin(' + fmt(P.w) + 't + ' + fmtPi(P.phi) + ')</span> cm'],
      ['<i>T</i> = 2π/<i>ω</i>', fmt(TAU / P.w) + ' s'],
      ['<i>f</i> = <i>ω</i>/2π', fmt(P.w / TAU) + ' Hz'],
      ['fáze teď <i>φ</i> = <i>ωt</i> + <i>φ</i><sub>0</sub>', fmt(fm / PI) + 'π rad = ' + fmt(deg(fm), 3) + '°'],
      ['výchylka teď <i>y</i>', fmt(P.A * Math.sin(f)) + ' cm']
    ];
  };
  M.drag = null;
  return M;
}

/* ================= SKLÁDÁNÍ KMITŮ ================= */
function sumModel() {
  const g = new THREE.Group(), C = [-1.7, 0.3, 0], S = 0.18;
  const M = { group: g, P: {}, mark: null, t: 0 };
  M.cam = { pos: [0.3, 0.6, 8.4], target: [0.1, 0.3, 0] };
  M.defaults = () => ({ f1: 1, f2: 1, A1: 2, A2: 2, p1: 0, p2: PI / 2 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = [
    { id: 'f1', label: 'Frekvence 1. kmitu <i>f</i><sub>1</sub>', min: 0.1, max: 6, step: 0.05, unit: 'Hz' },
    { id: 'A1', label: 'Amplituda 1. kmitu', min: 0, max: 5, step: 0.1, unit: 'cm' },
    { id: 'p1', label: 'Fáze 1. kmitu <i>φ</i><sub>1</sub>', min: 0, max: TAU, pi: true, step: PI / 12 },
    { id: 'f2', label: 'Frekvence 2. kmitu <i>f</i><sub>2</sub>', min: 0.1, max: 6, step: 0.05, unit: 'Hz' },
    { id: 'A2', label: 'Amplituda 2. kmitu', min: 0, max: 5, step: 0.1, unit: 'cm' },
    { id: 'p2', label: 'Fáze 2. kmitu <i>φ</i><sub>2</sub>', min: 0, max: TAU, pi: true, step: PI / 12 }
  ];
  M.about = '<p><b>Skládání kmitů stejného směru.</b> Bod kmitá dvěma kmity zároveň a jejich výchylky se v každém okamžiku <b>sčítají</b>: <span class="f">y = y<sub>1</sub> + y<sub>2</sub></span> (princip superpozice).</p><p>Při <b>stejné frekvenci</b> vznikne zase harmonický kmit se stejnou frekvencí. Jeho fázor (oranžová šipka) je <b>vektorový součet</b> obou fázorů. Stejná fáze = amplitudy se sečtou, opačná fáze (rozdíl π) = odečtou se.</p><p>Při <b>blízkých frekvencích</b> vznikají <b>rázy</b>: amplituda pravidelně roste a klesá s frekvencí <span class="f">f<sub>1</sub> − f<sub>2</sub></span>. Zkus nastavit <span class="f">f<sub>2</sub></span> = 1,1 Hz.</p>';
  const a1 = arrow(COL.teal), a2 = arrow(COL.gold), aR = arrow(COL.orange); g.add(a1, a2, aR);
  const center = ball(0.035, COL.ink); center.position.set(...C); g.add(center);
  const axis = mkLine(COL.soft, 2, true); setLine(axis, [[C[0] - 1.9, C[1], 0], [2.4, C[1], 0]]); g.add(axis);
  const X = [0.5, 1.2, 2.0], cols = [COL.teal, COL.gold, COL.orange];
  const balls = cols.map(c => { const m = ball(0.1, c); g.add(m); return m; });
  const tracks = cols.map(c => { const l = mkLine(c, 2, false, 0.45); g.add(l); return l; });
  const link = mkLine(COL.orange, 2, true); g.add(link);
  ['y₁', 'y₂', 'y = y₁ + y₂'].forEach((t, i) => { const l = label(t, ['#0F6F78', '#C99A2E', '#D9663A'][i], 0.17); l.position.set(X[i], C[1] - 2.05, 0); g.add(l); });
  M.reset = () => { M.t = 0; };
  M.changed = () => {};
  M.update = dt => { M.t += dt; };
  const ang = () => [TAU * P.f1 * M.t + P.p1, TAU * P.f2 * M.t + P.p2];
  M.sync3d = () => {
    const [q1, q2] = ang();
    const t1 = [C[0] + P.A1 * S * Math.cos(q1), C[1] + P.A1 * S * Math.sin(q1), 0];
    const t2 = [t1[0] + P.A2 * S * Math.cos(q2), t1[1] + P.A2 * S * Math.sin(q2), 0];
    setArrow(a1, C, t1); setArrow(a2, t1, t2); setArrow(aR, C, t2);
    const ys = [P.A1 * Math.sin(q1), P.A2 * Math.sin(q2)]; ys.push(ys[0] + ys[1]);
    const amp = [P.A1, P.A2, P.A1 + P.A2];
    ys.forEach((y, i) => { balls[i].position.set(X[i], C[1] + y * S, 0); setLine(tracks[i], [[X[i], C[1] - amp[i] * S, 0], [X[i], C[1] + amp[i] * S, 0]]); });
    setLine(link, [t2, [X[2], t2[1], 0]]);
  };
  M.channels = () => [
    { name: 'y₁', unit: 'cm', color: C_Y, strip: 0 },
    { name: 'y₂', unit: 'cm', color: C_A, strip: 0 },
    { name: 'výsledný kmit y = y₁ + y₂', unit: 'cm', color: C_V, strip: 1 }
  ];
  M.sample = () => { const [q1, q2] = ang(), y1 = P.A1 * Math.sin(q1), y2 = P.A2 * Math.sin(q2); return [y1, y2, y1 + y2]; };
  M.window = () => {
    const df = Math.abs(P.f1 - P.f2), fm = Math.min(P.f1, P.f2);
    return clamp(df > 1e-6 ? Math.max(2.2 / df, 3 / fm) : 3 / fm, 1, 40);
  };
  M.energy = null;
  M.readouts = () => {
    const df = Math.abs(P.f1 - P.f2);
    if (df < 1e-6) {
      const A = Math.sqrt(P.A1 * P.A1 + P.A2 * P.A2 + 2 * P.A1 * P.A2 * Math.cos(P.p2 - P.p1));
      let ph = Math.atan2(P.A1 * Math.sin(P.p1) + P.A2 * Math.sin(P.p2), P.A1 * Math.cos(P.p1) + P.A2 * Math.cos(P.p2));
      if (ph < 0) ph += TAU;
      return [
        ['frekvence stejné, výsledek je harmonický kmit', ''],
        ['výsledná amplituda <i>A</i> = √(<i>A</i><sub>1</sub>² + <i>A</i><sub>2</sub>² + 2<i>A</i><sub>1</sub><i>A</i><sub>2</sub>cos Δ<i>φ</i>)', fmt(A) + ' cm'],
        ['výsledná fáze <i>φ</i>', fmtPi(ph)],
        ['rozdíl fází Δ<i>φ</i>', fmtPi(((P.p2 - P.p1) % TAU + TAU) % TAU)],
        ['rovnice', '<span class="f">y = ' + fmt(A, 2) + '·sin(' + fmtPi(TAU * P.f1) + '·t + ' + fmtPi(ph) + ')</span> cm']
      ];
    }
    return [
      ['frekvence se liší → <b>rázy</b>', ''],
      ['frekvence rázů |<i>f</i><sub>1</sub> − <i>f</i><sub>2</sub>|', fmt(df) + ' Hz'],
      ['perioda rázů', fmt(1 / df) + ' s'],
      ['amplituda kolísá mezi', fmt(Math.abs(P.A1 - P.A2)) + ' a ' + fmt(P.A1 + P.A2) + ' cm']
    ];
  };
  M.drag = null;
  return M;
}

/* ================= LISSAJOUS ================= */
function lissModel() {
  const g = new THREE.Group(), C = [0, 0.4, 0], R = 1.5, N = 2400;
  const M = { group: g, P: {}, mark: null, t: 0, trail: [] };
  M.cam = { pos: [0.6, 0.6, 7.6], target: [0, 0.3, 0] };
  M.defaults = () => ({ fx: 1, fy: 2, phi: PI / 2 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = [
    { id: 'fx', label: 'Vodorovný kmit <i>f</i><sub>x</sub>', min: 0.25, max: 4, step: 0.05, unit: 'Hz' },
    { id: 'fy', label: 'Svislý kmit <i>f</i><sub>y</sub>', min: 0.25, max: 4, step: 0.05, unit: 'Hz' },
    { id: 'phi', label: 'Fázový rozdíl', min: 0, max: TAU, pi: true, step: PI / 12 }
  ];
  M.about = '<p><b>Skládání navzájem kolmých kmitů</b> (rozšiřující). Kulička kmitá zároveň vodorovně a svisle. Výsledná dráha je <b>Lissajousův obrazec</b>.</p><p>Poměr 1 : 1 s fázovým rozdílem π/2 dává kružnici, s jiným rozdílem elipsu nebo úsečku. Poměr 1 : 2 dává osmičku. Když je poměr frekvencí podíl celých čísel, obrazec je uzavřený. Když se frekvence trochu liší, obrazec se pomalu „točí“.</p>';
  const frame = mkLine(COL.soft, 5); setLine(frame, [[-R, C[1] - R, 0], [R, C[1] - R, 0], [R, C[1] + R, 0], [-R, C[1] + R, 0], [-R, C[1] - R, 0]]); g.add(frame);
  const trail = mkLine(COL.teal, N); g.add(trail);
  const b = ball(0.11, COL.orange); g.add(b);
  const bx = ball(0.07, COL.gold), by = ball(0.07, COL.gold); g.add(bx, by);
  const pos = t => [C[0] + R * Math.sin(TAU * P.fx * t + P.phi), C[1] + R * Math.sin(TAU * P.fy * t), 0];
  M.reset = () => { M.t = 0; M.trail = []; };
  M.changed = () => { M.trail = []; };
  M.update = dt => {
    const n = Math.max(1, Math.ceil(dt * Math.max(P.fx, P.fy) * 120));
    for (let i = 0; i < n; i++) { M.t += dt / n; M.trail.push(pos(M.t)); }
    if (M.trail.length > N) M.trail.splice(0, M.trail.length - N);
  };
  M.sync3d = () => {
    const p = pos(M.t); b.position.set(...p);
    bx.position.set(p[0], C[1] - R - 0.25, 0); by.position.set(-R - 0.25, p[1], 0);
    setLine(trail, M.trail.length ? M.trail : [p]);
  };
  M.channels = () => [{ name: 'vodorovná výchylka x', unit: '', color: C_A, strip: 0 }, { name: 'svislá výchylka y', unit: '', color: C_Y, strip: 1 }];
  M.sample = () => [Math.sin(TAU * P.fx * M.t + P.phi), Math.sin(TAU * P.fy * M.t)];
  M.window = () => clamp(3 / Math.min(P.fx, P.fy), 1, 20);
  M.energy = null;
  M.readouts = () => [['poměr frekvencí <i>f</i><sub>x</sub> : <i>f</i><sub>y</sub>', fmt(P.fx) + ' : ' + fmt(P.fy)], ['fázový rozdíl', fmtPi(P.phi)]];
  M.drag = null;
  return M;
}

/* ================= FOUCAULTOVO KYVADLO ================= */
function foucaultModel() {
  const TOP = 3.4, L = 5.4, g = new THREE.Group(), N = 2500, FY = FLOOR + 0.02;
  const M = { group: g, P: {}, mark: null, t: 0, trail: [] };
  M.cam = { pos: [5.5, 4.2, 8.5], target: [0, 0, 0] };
  M.defaults = () => ({ lat: 50, boost: 3000, amp: 14 });
  Object.assign(M.P, M.defaults());
  const P = M.P;
  M.defs = [
    { id: 'lat', label: 'Zeměpisná šířka', min: -90, max: 90, step: 1, unit: '°', buttons: [['Pardubice', 50], ['pól', 90], ['rovník', 0], ['Paříž', 49]] },
    { id: 'boost', label: 'Zrychlení otáčení Země', min: 1, max: 20000, log: true, unit: '×' },
    { id: 'amp', label: 'Rozkyv', min: 3, max: 25, step: 1, unit: '°' }
  ];
  M.about = '<p><b>Foucaultovo kyvadlo</b> je dlouhé a těžké kyvadlo, které kmitá mnoho hodin. Rovina, ve které se kývá, zůstává v prostoru stálá, ale <b>Země se pod ní otáčí</b>. Proto to vypadá, že se rovina kyvu pomalu stáčí. Je to důkaz rotace Země.</p><p>Na severní polokouli se stáčí po směru hodinových ručiček, a to rychlostí <span class="f">15°·sin φ</span> za hodinu (<span class="f">φ</span> je zeměpisná šířka). Na pólu se otočí za den, na rovníku vůbec.</p><p>Kyv i otáčení jsou tu zrychlené, ať je efekt vidět. Stopa na podlaze ukazuje, kudy kyvadlo chodilo.</p>';
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.2), mat(COL.ink)); ceil.position.y = TOP + 0.07; g.add(ceil);
  const rod = mkLine(COL.ink, 2); g.add(rod);
  const bob = ball(0.24, COL.gold); bob.material.metalness = 0.6; g.add(bob);
  const disk = new THREE.Mesh(new THREE.CircleGeometry(2.3, 96), mat(0xffffff, { roughness: 0.9 })); disk.rotation.x = -PI / 2; disk.position.y = FLOOR + 0.005; disk.receiveShadow = true; g.add(disk);
  const ticks = new THREE.Group();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, l = mkLine(i % 6 ? COL.soft : COL.ink, 2); setLine(l, [[2.0 * Math.cos(a), FLOOR + 0.01, 2.0 * Math.sin(a)], [2.3 * Math.cos(a), FLOOR + 0.01, 2.3 * Math.sin(a)]]); ticks.add(l); }
  g.add(ticks);
  [['S', 0, -2.6], ['J', 0, 2.6], ['V', 2.6, 0], ['Z', -2.6, 0]].forEach(([t, x, z]) => { const s = label(t, '#5E6675', 0.3); s.position.set(x, FLOOR + 0.2, z); g.add(s); });
  const trail = mkLine(COL.orange, N, false, 0.8); g.add(trail);
  const OM = TAU / 86164;
  const pos = t => {
    const psi = OM * P.boost * Math.sin(P.lat * PI / 180) * t, th = P.amp * PI / 180 * Math.cos(TAU * t / 4), r = L * Math.sin(th);
    return [r * Math.cos(psi), TOP - L * Math.cos(th), r * Math.sin(psi)];
  };
  M.reset = () => { M.t = 0; M.trail = []; };
  M.changed = id => { if (id === 'lat') M.trail = []; };
  M.update = dt => {
    const n = Math.max(1, Math.ceil(dt * 60));
    for (let i = 0; i < n; i++) { M.t += dt / n; const p = pos(M.t); M.trail.push([p[0], FY, p[2]]); }
    if (M.trail.length > N) M.trail.splice(0, M.trail.length - N);
  };
  M.sync3d = () => { const p = pos(M.t); bob.position.set(...p); setLine(rod, [[0, TOP, 0], p]); setLine(trail, M.trail.length ? M.trail : [[p[0], FY, p[2]]]); };
  M.channels = () => [{ name: 'úhel kyvu', unit: '°', color: C_Y, strip: 0 }];
  M.sample = () => [P.amp * Math.cos(TAU * M.t / 4)];
  M.window = () => 12;
  M.energy = null;
  M.readouts = () => {
    const s = Math.sin(P.lat * PI / 180), rate = 360 / 23.934 * s;
    return [
      ['stáčení roviny kyvu = 15,04°·sin <i>φ</i>', fmt(Math.abs(rate)) + ' ° za hodinu'],
      ['směr', Math.abs(s) < 1e-3 ? 'nestáčí se' : (s > 0 ? 'po směru hodinových ručiček' : 'proti směru')],
      ['celá otočka za', Math.abs(s) < 1e-3 ? 'nikdy' : fmt(23.934 / Math.abs(s)) + ' h']
    ];
  };
  M.drag = null;
  return M;
}

/* ================= modely a záložky ================= */
const models = {
  pruzina: springModel(false), kyvadlo: pendulumModel(), kruh: circleModel(), skladani: sumModel(),
  rezonance: springModel(true), foucault: foucaultModel(), lissajous: lissModel()
};
const TABS = [['pruzina', 'Pružina'], ['kyvadlo', 'Kyvadlo'], ['kruh', 'Kruh a fáze'], ['skladani', 'Skládání kmitů'], ['rezonance', 'Rezonance'], ['foucault', 'Foucaultovo kyvadlo'], ['lissajous', 'Lissajousovy obrazce']];
Object.values(models).forEach(m => { m.group.visible = false; scene.add(m.group); });
let cur = null, hist = [], emax = 0, playing = true, speed = 1;

function toPos(d, v) { return d.log ? 1000 * Math.log(v / d.min) / Math.log(d.max / d.min) : 1000 * (v - d.min) / (d.max - d.min); }
function fromPos(d, p) {
  let v = d.log ? d.min * Math.pow(d.max / d.min, p / 1000) : d.min + (d.max - d.min) * p / 1000;
  v = d.step ? Math.round(v / d.step) * d.step : Number(v.toPrecision(3));
  return clamp(v, d.min, d.max);
}
function showVal(d, v) { return d.pi ? fmtPi(v) + ' rad' : fmt(v * (d.mul || 1)) + (d.unit ? ' ' + d.unit : ''); }
function syncSliders() { cur.defs.forEach(d => d._sync && d._sync()); }
function buildSliders() {
  const box = $('#sliders'); box.innerHTML = '';
  cur.defs.forEach(d => {
    const row = document.createElement('div'); row.className = 'sl';
    row.innerHTML = '<label><span>' + d.label + '</span><output></output></label><input type="range" min="0" max="1000" step="1">' + (d.buttons ? '<div class="btns"></div>' : '');
    const inp = row.querySelector('input'), out = row.querySelector('output');
    d._sync = () => { inp.value = clamp(toPos(d, cur.P[d.id]), 0, 1000); out.innerHTML = showVal(d, cur.P[d.id]); };
    inp.addEventListener('input', () => { cur.P[d.id] = fromPos(d, +inp.value); out.innerHTML = showVal(d, cur.P[d.id]); cur.changed(d.id); });
    if (d.buttons) d.buttons.forEach(([t, v]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.onclick = () => { cur.P[d.id] = v; d._sync(); cur.changed(d.id); };
      row.querySelector('.btns').appendChild(b);
    });
    d._sync(); box.appendChild(row);
  });
}
function selectTab(name, fromTask) {
  if (cur) cur.group.visible = false;
  cur = models[name]; cur.group.visible = true;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === name));
  $('#about').innerHTML = cur.about;
  buildSliders();
  camera.position.set(...cur.cam.pos); controls.target.set(...cur.cam.target); controls.update();
  $('#energy').style.display = cur.energy ? '' : 'none';
  $('#rcurve').style.display = cur.curve ? 'block' : 'none';
  if (!fromTask) { cur.mark = null; $('#task').innerHTML = ''; }
  hist = []; emax = 0; updateReadouts();
}
TABS.forEach(([k, t]) => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.dataset.k = k;
  b.onclick = () => selectTab(k); $('#tabs').appendChild(b);
});

/* ================= ovládání ================= */
$('#play').onclick = () => { playing = !playing; $('#play').textContent = playing ? '⏸ Pauza' : '▶ Spustit'; };
$('#reset').onclick = () => { cur.reset(); hist = []; emax = 0; };
$('#speed').onchange = e => { speed = +e.target.value; };
function setSpeed(v) { speed = v; const s = $('#speed'); s.value = String(v); if (s.value !== String(v)) s.value = '1'; speed = +s.value; }

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
let dragging = null;
const cvs = renderer.domElement;
function setNdc(e) { const r = cvs.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera); }
cvs.addEventListener('pointerdown', e => {
  if (!cur.drag) return;
  setNdc(e);
  if (ray.intersectObject(cur.drag.mesh, true).length) {
    e.stopImmediatePropagation(); dragging = cur; controls.enabled = false;
    cvs.setPointerCapture(e.pointerId); cvs.style.cursor = 'grabbing'; cur.drag.start();
  }
}, { capture: true });
cvs.addEventListener('pointermove', e => {
  setNdc(e);
  if (dragging) { if (ray.ray.intersectPlane(dragPlane, hit)) dragging.drag.move(hit); return; }
  cvs.style.cursor = cur.drag && ray.intersectObject(cur.drag.mesh, true).length ? 'grab' : '';
});
const endDrag = () => { if (!dragging) return; dragging.drag.end(); dragging = null; controls.enabled = true; cvs.style.cursor = ''; };
cvs.addEventListener('pointerup', endDrag);
cvs.addEventListener('pointercancel', endDrag);

function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(view); resize();

/* ================= graf ================= */
const gc = $('#graph'), gx = gc.getContext('2d');
function drawGraph() {
  const dpr = Math.min(window.devicePixelRatio, 2), W = gc.clientWidth, H = gc.clientHeight;
  if (gc.width !== Math.round(W * dpr) || gc.height !== Math.round(H * dpr)) { gc.width = Math.round(W * dpr); gc.height = Math.round(H * dpr); }
  gx.setTransform(dpr, 0, 0, dpr, 0, 0); gx.clearRect(0, 0, W, H);
  const ch = cur.channels(), ns = Math.max(...ch.map(c => c.strip)) + 1, sh = H / ns, win = cur.window(), t0 = cur.t - win;
  gx.font = '12px "Segoe UI", sans-serif';
  for (let s = 0; s < ns; s++) {
    const y0 = s * sh, mid = y0 + sh / 2, idx = ch.map((c, i) => c.strip === s ? i : -1).filter(i => i >= 0);
    let mx = 0;
    for (const h of hist) for (const i of idx) mx = Math.max(mx, Math.abs(h.v[i]));
    if (s === 0 && cur.mark != null) mx = Math.max(mx, Math.abs(cur.mark));
    const sc = mx > 1e-9 ? mx * 1.15 : 1, amp = sh / 2 - 8;
    if (s) { gx.strokeStyle = '#E0DBD0'; gx.lineWidth = 1; gx.beginPath(); gx.moveTo(0, y0); gx.lineTo(W, y0); gx.stroke(); }
    gx.strokeStyle = '#EFEBE2'; gx.setLineDash([4, 4]); gx.beginPath(); gx.moveTo(0, mid); gx.lineTo(W, mid); gx.stroke(); gx.setLineDash([]);
    if (s === 0 && cur.mark != null) {
      const my = mid - cur.mark / sc * amp;
      gx.strokeStyle = '#D9663A'; gx.setLineDash([6, 5]); gx.beginPath(); gx.moveTo(0, my); gx.lineTo(W, my); gx.stroke(); gx.setLineDash([]);
      gx.fillStyle = '#D9663A'; gx.fillText(String(cur.mark).replace('.', ',') + ' ' + ch[idx[0]].unit, W - 64, my - 4);
    }
    for (const i of idx) {
      gx.strokeStyle = ch[i].color; gx.lineWidth = 2; gx.beginPath(); let first = true;
      for (const h of hist) { if (h.t < t0) continue; const x = (h.t - t0) / win * W, y = mid - h.v[i] / sc * amp; first ? gx.moveTo(x, y) : gx.lineTo(x, y); first = false; }
      gx.stroke();
    }
    let lx = 10;
    for (const i of idx) {
      const t = ch[i].name + (ch[i].unit ? ' [' + ch[i].unit + ']' : '');
      gx.fillStyle = ch[i].color; gx.fillText(t, lx, y0 + 15); lx += gx.measureText(t).width + 16;
    }
    gx.fillStyle = '#8B92A0';
    const top = fmt(sc / 1.15, 2).replace(/<[^>]+>/g, '');
    gx.fillText('max ' + top, W - 80, y0 + 15);
  }
  gx.fillStyle = '#8B92A0'; gx.fillText('posledních ' + fmt(win, 2) + ' s', W - 120, H - 6);
}

/* ================= hodnoty a energie ================= */
function updateReadouts() {
  $('#readouts').innerHTML = '<table class="ro">' + cur.readouts().map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</table>';
  if (cur.energy) {
    const e = cur.energy(), E = e.Ek + e.Ep; emax = Math.max(emax * 0.999, E, 1e-12);
    $('#ebk').style.width = (100 * e.Ek / emax) + '%'; $('#ebp').style.width = (100 * e.Ep / emax) + '%'; $('#ebe').style.width = (100 * E / emax) + '%';
    $('#evk').innerHTML = fmt(e.Ek) + ' J'; $('#evp').innerHTML = fmt(e.Ep) + ' J'; $('#eve').innerHTML = fmt(E) + ' J';
  }
}

/* ================= úlohy z testu ================= */
const TASKS = [
  { k: 'Test 1', t: 'Rozsah fáze', scene: 'kruh', set: { A: 5, w: 1.5, phi: 0 },
    z: 'Rozsah fáze harmonicky proměnné veličiny je od 0 do: a) π/2, b) π, c) 3π/2, d) 2π.',
    tip: 'Sleduj v hodnotách „fáze teď“ a úhel u středu kružnice. Po jaké hodnotě začne znovu od nuly?',
    s: ['Fáze je úhel, který opíše fázor (šipka) na kružnici: <span class="f">φ = ωt + φ<sub>0</sub></span>.', 'Za jednu periodu udělá fázor celou otočku, tedy 360° = 2π rad.', 'Potom je kulička zase na začátku a všechno se opakuje, proto stačí rozsah 0 až 2π.'],
    r: 'd) 2π' },
  { k: 'Test 2', t: 'Pružina s více závažími', scene: 'pruzina', set: { m: 0.2, k: 8, A: 0.06, phi: PI / 2 },
    z: 'Na pružině je nejprve zavěšeno jedno závaží a pak dvě stejná závaží. Jak se změní frekvence kmitů? a) perioda 2× vzroste, b) perioda 2× klesne, c) perioda √2× vzroste, d) perioda √2× klesne.',
    tip: 'Nastav m = 0,1 kg a zapamatuj si T. Pak dej m = 0,2 kg (dvě závaží) a porovnej.',
    s: ['Perioda pružinového oscilátoru: <span class="f">T = 2π√(m/k)</span>.', 'Dvě závaží = dvojnásobná hmotnost: <span class="f">T′ = 2π√(2m/k) = √2 · 2π√(m/k) = √2·T</span>.', 'Hmotnost je pod odmocninou, proto se perioda nezvětší 2×, ale jen √2× (asi 1,41×). Frekvence <span class="f">f = 1/T</span> naopak √2× klesne.', 'Pozor: kdyby se myslelo celkem tři závaží, vyšlo by √3×. Taková možnost ale v nabídce není.'],
    r: 'c) perioda √2krát vzroste' },
  { k: 'Úloha 1', t: 'Napiš rovnici kmitu', scene: 'pruzina', set: { m: 0.1, k: 6.1685, A: 0.05, phi: 0 },
    z: 'Těleso kmitá harmonicky s periodou 0,80 s, jeho amplituda je 5,0 cm a počáteční fáze nulová. Napište rovnici kmitavého pohybu.',
    tip: 'Laboratoř kmitá přesně s T = 0,80 s. V hodnotách zkontroluj ω.',
    s: ['Obecná rovnice: <span class="f">y = y<sub>m</sub>·sin(ωt + φ<sub>0</sub>)</span>.', 'Úhlová frekvence: <span class="f">ω = 2π/T = 2π/0,8 = 2,5π s<sup>−1</sup></span> (asi 7,85 s<sup>−1</sup>).', 'Amplituda v metrech: 5,0 cm = 0,05 m. Počáteční fáze je 0.'],
    r: 'y = 0,05·sin(2,5πt) m' },
  { k: 'Úloha 2', t: 'Perioda a frekvence z rovnice', scene: 'pruzina', set: { m: 0.1, k: 14.4, A: 0.02, phi: 0 },
    z: 'Těleso kmitá podle rovnice y = 0,02·sin(12t) m. Určete jeho periodu a frekvenci.',
    tip: 'Laboratoř je nastavená na ω = 12 rad/s. Odečti periodu z grafu: vzdálenost dvou vrcholů.',
    s: ['Porovnej s <span class="f">y = y<sub>m</sub>·sin(ωt)</span>: číslo u t je úhlová frekvence, <span class="f">ω = 12 rad·s<sup>−1</sup></span>.', '<span class="f">T = 2π/ω = 2π/12 ≈ 0,52 s</span>.', '<span class="f">f = 1/T = ω/2π ≈ 1,9 Hz</span>.'],
    r: 'T ≈ 0,52 s, f ≈ 1,9 Hz' },
  { k: 'Úloha 3', t: 'Která rovnice je harmonická?', scene: 'kruh', set: { A: 5, w: 2, phi: 0 },
    z: 'Která z rovnic popisuje harmonický kmitavý pohyb? a) y = r·sin t², b) y = ω²·sin t, c) y = ω·sin ωt, d) y = r·ω²·sin ωt.',
    tip: 'Rozhoduje tvar i jednotky. Výchylka y musí vyjít v metrech.',
    s: ['Harmonický kmit má tvar <span class="f">y = y<sub>m</sub>·sin(ωt + φ<sub>0</sub>)</span>. Před sinem je <b>amplituda</b> (délka v metrech) a uvnitř úhel, který roste <b>rovnoměrně</b> s časem.', 'a) <span class="f">sin t²</span>: úhel neroste rovnoměrně, ale se čtvercem času. Není to harmonický kmit.', 'b) <span class="f">ω²·sin t</span>: před sinem je ω² v s<sup>−2</sup>, to není délka. Uvnitř chybí ω.', 'c) <span class="f">ω·sin ωt</span>: před sinem je ω v s<sup>−1</sup>, zase to není délka.', 'd) <span class="f">r·ω²·sin ωt</span>: jednotka je m·s<sup>−2</sup>, to je <b>zrychlení</b>, ne výchylka.'],
    r: 'žádná správná možnost' },
  { k: 'Úloha 4', t: 'Kdy je výchylka +3 cm?', scene: 'pruzina', set: { m: 0.1, k: 63.165, A: 0.04, phi: PI / 3 }, speed: 0.25, mark: 3,
    z: 'Těleso kmitá harmonicky s periodou 0,25 s, amplitudou 4,0 cm a počáteční fází π/3. Určete první tři časy, kdy je okamžitá výchylka +3,0 cm.',
    tip: 'Na grafu výchylky je oranžová čára +3 cm. Sleduj, kdy ji křivka protne (čas je zpomalený).',
    s: ['<span class="f">ω = 2π/T = 8π s<sup>−1</sup></span>, tedy <span class="f">y = 0,04·sin(8πt + π/3)</span>.', 'Dosadíme y = 0,03: <span class="f">sin(8πt + π/3) = 0,75</span>.', 'arcsin 0,75 = 0,848 rad. Sinus má stejnou hodnotu i pro π − 0,848 = 2,294 rad. Obě řešení se opakují po 2π.', 'Úhel 8πt + π/3 začíná na π/3 = 1,047, proto hledáme první tři hodnoty větší než 1,047: <b>2,294</b>, <b>0,848 + 2π = 7,131</b>, <b>2,294 + 2π = 8,577</b>.', 'Z každé spočítáme t = (úhel − π/3)/8π: 0,050 s, 0,242 s, 0,300 s.'],
    r: 't = 0,050 s; 0,242 s; 0,300 s' },
  { k: 'Úloha 5', t: 'Frekvence z energie', scene: 'pruzina', set: { m: 0.002, k: 200, A: 0.1, phi: PI / 2 }, speed: 0.01,
    z: 'Jaká je frekvence netlumeného harmonického pohybu hmotného bodu o hmotnosti 2,0 g, je-li amplituda kmitů 10 cm a celková energie 1,0 J?',
    tip: 'Bod kmitá tak rychle, že je čas zpomalený 100×. Celkovou energii najdeš v hodnotách.',
    s: ['Celková energie = největší pohybová energie: <span class="f">E = ½·m·v<sub>max</sub>² = ½·m·ω²·y<sub>m</sub>²</span>.', 'Vyjádříme ω: <span class="f">ω = √(2E/(m·y<sub>m</sub>²)) = √(2·1/(0,002·0,1²)) = √100 000 ≈ 316 s<sup>−1</sup></span>.', '<span class="f">f = ω/2π ≈ 50 Hz</span>.'],
    r: 'f ≈ 50 Hz' },
  { k: 'Úloha 6', t: 'Frekvence pružiny', scene: 'pruzina', set: { m: 0.09, k: 4, A: 0.05, phi: PI / 2 },
    z: 'Vypočtěte s jakou frekvencí by kmitalo na pružině těleso o hmotnosti 90 g, jestliže tuhost pružiny je 4,0 N·m⁻¹.',
    tip: 'Zkus posuvníkem zvětšit hmotnost a sleduj, jak frekvence klesá.',
    s: ['<span class="f">f = 1/T = (1/2π)·√(k/m)</span>.', 'Hmotnost v kg: 90 g = 0,09 kg.', '<span class="f">f = (1/2π)·√(4/0,09) = (1/2π)·6,67 ≈ 1,06 Hz</span>.'],
    r: 'f ≈ 1,06 Hz' },
  { k: 'Úloha 7', t: 'Maximální zrychlení, rychlost a energie', scene: 'pruzina', set: { m: 0.15, k: 23.687, A: 0.04, phi: PI / 2 }, speed: 0.25,
    z: 'Těleso o hmotnosti 150 g kmitá harmonicky s amplitudou 4,0 cm a periodou 0,50 s. Určete maximální zrychlení a ve které fázi pohybu je. Jaká je maximální rychlost a kde? Jaká je maximální potenciální energie oscilátoru?',
    tip: 'V grafu porovnej, kde má maximum výchylka, kde rychlost a kde zrychlení. Sleduj i sloupce energie.',
    s: ['<span class="f">ω = 2π/T = 4π s<sup>−1</sup> ≈ 12,6 s<sup>−1</sup></span>.', 'Zrychlení: <span class="f">a<sub>max</sub> = ω²·y<sub>m</sub> = 157,9·0,04 ≈ 6,32 m·s<sup>−2</sup></span>. Je v <b>krajní poloze</b> (amplitudě), kde je pružina nejvíc napnutá nebo stlačená.', 'Rychlost: <span class="f">v<sub>max</sub> = ω·y<sub>m</sub> ≈ 0,50 m·s<sup>−1</sup></span>. Je v <b>rovnovážné poloze</b>.', 'Energie: největší potenciální energie se rovná celkové energii, <span class="f">E = ½·m·v<sub>max</sub>² = ½·0,15·0,503² ≈ 18,9 mJ</span>.'],
    r: 'a = 6,32 m·s⁻² v amplitudě; v = 0,50 m·s⁻¹ v rovnovážné poloze; E = 18,9 mJ' },
  { k: 'Úloha 8', t: 'O kolik se pružina prodlouží', scene: 'pruzina', set: { m: 0.1, k: 12.791, A: 0.03, phi: PI / 2, b: 0.12 },
    z: 'Nezatížená pružina se nachází v rovnovážné poloze. Rozkmitáme těleso na ní upevněné, kmitá s frekvencí 1,8 Hz. O kolik bude pružina prodloužena proti rovnovážné poloze až se kmity utlumí?',
    tip: 'Tlumení je zapnuté, kmity postupně zmizí a závaží zůstane v rovnovážné poloze. Prodloužení najdeš v hodnotách.',
    s: ['Až se kmity utlumí, závaží visí v klidu. Síla pružiny vyrovnává tíhu: <span class="f">k·Δl = m·g</span>, tedy <span class="f">Δl = mg/k</span>.', 'Z frekvence známe <span class="f">ω² = k/m</span>, tedy <span class="f">m/k = 1/ω²</span>.', '<span class="f">Δl = g/ω² = 9,81/(2π·1,8)² = 9,81/127,9 ≈ 0,077 m</span>. Hmotnost ani tuhost znát nemusíme.'],
    r: 'Δl ≈ 7,7 cm' },
  { k: 'Úloha 9', t: 'Délka kyvadla s T = 1 s', scene: 'kyvadlo', set: { l: 0.2485, m: 0.5, th0: 10, g: 9.81, a: 0 },
    z: 'Vypočtěte délku závěsu matematického kyvadla, které má dobu kmitu 1,0 s, je-li g = 9,81 m·s⁻².',
    tip: 'Zkus délku změnit na čtyřnásobek a sleduj, jak se změní perioda.',
    s: ['<span class="f">T = 2π√(l/g)</span>, umocníme: <span class="f">T² = 4π²·l/g</span>.', '<span class="f">l = g·T²/(4π²) = 9,81·1/39,48 ≈ 0,25 m</span>.'],
    r: 'l ≈ 0,25 m' },
  { k: 'Úloha 10', t: 'Kyvadlo na Marsu (chyták!)', scene: 'kyvadlo', set: { l: 1.2, m: 0.5, th0: 10, g: 3.66, a: 0 },
    z: 'Matematické kyvadlo o délce 1,2 m má na Marsu dobu kyvu 1,8 s. Vypočtěte tíhové zrychlení na Marsu.',
    tip: 'V hodnotách porovnej „doba kyvu“ a periodu T. Zkus i tlačítko Země.',
    s: ['Pozor: <b>doba kyvu</b> je cesta z jedné krajní polohy do druhé. To je jen <b>polovina periody</b>. Celá perioda je tam a zpátky.', '<span class="f">T = 2·1,8 = 3,6 s</span>.', '<span class="f">g = 4π²·l/T² = 39,48·1,2/3,6² ≈ 3,66 m·s<sup>−2</sup></span>.', 'Kdo dosadí 1,8 s jako periodu, dostane 14,6 m·s<sup>−2</sup>, a to je špatně.'],
    r: 'g ≈ 3,66 m·s⁻²' },
  { k: 'Úloha 11', t: 'Rozkývaný předmět na jeřábu', scene: 'kyvadlo', set: { l: 28, m: 2, th0: 8, g: 9.81, a: 0 },
    z: 'Na stavebním jeřábu se nárazem větru rozkýval zavěšený předmět na závěsu o délce 28 m. Určete dobu kmitu, jestliže hmotnost předmětu je podstatně větší než hmotnost závěsu.',
    tip: 'Zkus změnit hmotnost: perioda se nezmění.',
    s: ['Předmět je mnohem těžší než lano, takže ho bereme jako matematické kyvadlo.', '<span class="f">T = 2π√(l/g) = 2π√(28/9,81) ≈ 10,6 s</span>.', 'Hmotnost předmětu na periodu nemá vliv.'],
    r: 'T ≈ 10,6 s' },
  { k: 'Úloha 12', t: 'Kyvadlo vychýlené o 30°', scene: 'kyvadlo', set: { l: 1, m: 1, th0: 30, g: 9.81, a: 0 }, speed: 0.5,
    z: 'Matematické kyvadlo s vláknem délky 1,0 m a kuličkou o hmotnosti 1,0 kg vykloníme o úhel 30°. Vypočtěte přírůstek potenciální energie kuličky, rychlost v rovnovážné poloze a maximální tečné zrychlení kyvadla.',
    tip: 'Sleduj sloupce energie: polohová se v nejnižším bodě celá změní na pohybovou.',
    s: ['Kulička se zvedne o <span class="f">h = l·(1 − cos 30°) = 1·(1 − 0,866) ≈ 0,134 m</span>.', '<span class="f">ΔE<sub>p</sub> = m·g·h = 1·9,81·0,134 ≈ 1,31 J</span>.', 'V rovnovážné poloze se celá změní na pohybovou: <span class="f">½mv² = mgh</span>, takže <span class="f">v = √(2gh) ≈ 1,62 m·s<sup>−1</sup></span>.', 'Tečné zrychlení je největší v krajní poloze: <span class="f">a<sub>t</sub> = g·sin 30° ≈ 4,9 m·s<sup>−2</sup></span>.'],
    r: 'ΔEp ≈ 1,31 J; v ≈ 1,62 m·s⁻¹; aₜ ≈ 4,9 m·s⁻²' },
  { k: 'Úloha 13', t: 'Kyvadlo ve výtahu', scene: 'kyvadlo', set: { l: 0.8408, m: 0.5, th0: 10, g: 9.8, a: 0.5 },
    z: 'Jestliže se výtah pohybuje stálou rychlostí 3,0 m·s⁻¹ směrem vzhůru, kmitá v něm zavěšené kyvadlo o délce 80 cm s dobou kmitu T₀. Jak je třeba upravit délku závěsu, aby při zrychlení výtahu 0,50 m·s⁻² směrem vzhůru byla doba kmitu opět T₀? g = 9,8 m·s⁻².',
    tip: 'Klikni u výtahu na „stojí / stálá rychlost“ a dej délku 0,8 m. Zapamatuj si T. Pak vrať a = 0,5 a l = 0,84 m.',
    s: ['Při stálé rychlosti se kyvadlo chová, jako by výtah stál: <span class="f">T<sub>0</sub> = 2π√(l/g)</span>.', 'Při zrychlení vzhůru kyvadlo „cítí“ větší tíhové zrychlení <span class="f">g′ = g + a = 10,3 m·s<sup>−2</sup></span>. Perioda by se zkrátila.', 'Aby zůstala stejná, musí platit <span class="f">l′/g′ = l/g</span>, tedy <span class="f">l′ = l·(g + a)/g = 0,8·10,3/9,8 ≈ 0,841 m</span>.'],
    r: 'Prodloužit asi o 4,0 cm (na 0,84 m)' },
  { k: 'Úloha 14', t: 'Složení dvou kmitů', scene: 'skladani', set: { f1: 4, f2: 4, A1: 2, A2: 2, p1: 0, p2: PI / 2 }, speed: 0.1,
    z: 'Dva izochronní harmonické kmity téhož směru mají frekvenci 4,0 Hz, stejnou amplitudu výchylky 2,0 cm a rozdíl fází π/2. Napište rovnici složených kmitů.',
    tip: 'Podívej se na šipky: modrá a žlutá jsou na sebe kolmé a oranžová (výsledek) je úhlopříčka čtverce.',
    s: ['Izochronní = se stejnou frekvencí. Výsledek je harmonický kmit se stejnou frekvencí: <span class="f">ω = 2πf = 8π s<sup>−1</sup></span>.', 'Fázory sčítáme jako vektory. Jsou kolmé (rozdíl π/2) a stejně dlouhé, takže výsledná amplituda je úhlopříčka čtverce: <span class="f">A = √(2² + 2²) = 2√2 ≈ 2,8 cm</span>.', 'Úhlopříčka leží přesně v polovině mezi fázory, výsledná počáteční fáze je <span class="f">π/4</span> (první kmit má fázi 0).'],
    r: 'y = 2,8·sin(8πt + π/4) cm' }
];
function showTask(T) {
  $('#task').innerHTML = '<div class="tcard"><button class="x" type="button" aria-label="Zavřít">×</button><div class="tk">' + T.k + '</div><h3>' + T.t + '</h3><p>' + T.z + '</p><p class="tip">💡 ' + T.tip + '</p>' +
    '<details><summary>Postup řešení</summary><ol>' + T.s.map(x => '<li>' + x + '</li>').join('') + '</ol></details>' +
    '<details><summary>Výsledek</summary><p class="res">' + T.r + '</p></details></div>';
  $('#task .x').onclick = () => { $('#task').innerHTML = ''; cur.mark = null; };
}
function applyTask(T) {
  const m = models[T.scene];
  Object.keys(m.P).forEach(k => delete m.P[k]);
  Object.assign(m.P, m.defaults(), T.set || {});
  m.mark = T.mark != null ? T.mark : null;
  selectTab(T.scene, true);
  m.reset(); hist = []; emax = 0;
  setSpeed(T.speed || 1);
  if (!playing) $('#play').click();
  showTask(T);
  $('#tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
TASKS.forEach(T => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tc';
  b.innerHTML = '<div class="tk">' + T.k + '</div><h3>' + T.t + '</h3><p>' + (T.z.length > 110 ? T.z.slice(0, 107) + '…' : T.z) + '</p>';
  b.onclick = () => applyTask(T);
  $('#tasklist').appendChild(b);
});

/* ================= smyčka ================= */
selectTab('pruzina');
const clock = new THREE.Clock();
let lastUI = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (playing) {
    cur.update(dt * speed);
    hist.push({ t: cur.t, v: cur.sample() });
    const win = cur.window() * 1.05;
    while (hist.length && hist[0].t < cur.t - win) hist.shift();
  }
  cur.sync3d();
  controls.update();
  renderer.render(scene, camera);
  drawGraph();
  const now = performance.now();
  if (now - lastUI > 120) { lastUI = now; updateReadouts(); if (cur.curve) cur.curve($('#rcurve')); }
}
loop();
