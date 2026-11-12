/* ============================================================
   SESIÓN Y UTILIDADES
============================================================ */
const sesion = JSON.parse(localStorage.getItem('inv_sesion'));
if (!sesion) window.location.href = 'index.html';

const getPiezas       = () => JSON.parse(localStorage.getItem('inv_piezas'));
const setPiezas       = (p) => localStorage.setItem('inv_piezas', JSON.stringify(p));
const getSolicitudes  = () => JSON.parse(localStorage.getItem('inv_solicitudes'));
const setSolicitudes  = (s) => localStorage.setItem('inv_solicitudes', JSON.stringify(s));
const getMovimientos  = () => JSON.parse(localStorage.getItem('inv_movimientos'));
const setMovimientos  = (m) => localStorage.setItem('inv_movimientos', JSON.stringify(m));
const getUsuarios     = () => USUARIOS;

function cerrarSesion() {
  localStorage.removeItem('inv_sesion');
  window.location.href = 'index.html';
}

function estadoStock(p) {
  if (p.cantidad === 0) return { clase: 'bad-danger', texto: 'Agotado' };
  if (p.cantidad <= p.stockMin) return { clase: 'bad-warn', texto: 'Stock bajo' };
  return { clase: 'bad-ok', texto: 'OK' };
}

function registrarMovimiento(tipo, codigo, cantidad, motivo, usuario) {
  const movs = getMovimientos();
  movs.unshift({
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    tipo, codigo, cantidad, motivo, usuario
  });
  setMovimientos(movs);
}

/* ============================================================
   RENDER SIDEBAR
============================================================ */
const MENUS = {
  administrador: [
    { id: 'dashboard',     label: '📊 Dashboard' },
    { id: 'piezas',        label: '📦 Piezas' },
    { id: 'usuarios',      label: '👥 Usuarios' },
    { id: 'movimientos',   label: '🔁 Movimientos' }
  ],
  gerente: [
    { id: 'dashboard',     label: '📊 Dashboard' },
    { id: 'piezas',        label: '📦 Inventario' },
    { id: 'solicitudes',   label: '📝 Solicitudes' },
    { id: 'reportes',      label: '📈 Reportes' },
    { id: 'movimientos',   label: '🔁 Movimientos' }
  ],
  tecnico: [
    { id: 'dashboard',     label: '📊 Dashboard' },
    { id: 'piezas',        label: '📦 Piezas disponibles' },
    { id: 'solicitudes',   label: '📝 Mis solicitudes' },
    { id: 'movimientos',   label: '🔁 Mis movimientos' }
  ]
};

function renderSidebar() {
  document.getElementById('userInfo').innerHTML = `
    <strong>${sesion.nombre}</strong><br>
    <span class="role-tag">${sesion.rol}</span>
  `;
  const menu = document.getElementById('menu');
  menu.innerHTML = MENUS[sesion.rol].map(m =>
    `<a href="#" data-view="${m.id}" onclick="navegar('${m.id}');return false;">${m.label}</a>`
  ).join('');
}

/* ============================================================
   NAVEGACIÓN
============================================================ */
function navegar(view) {
  document.querySelectorAll('#menu a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`#menu a[data-view="${view}"]`);
  if (link) link.classList.add('active');

  const cont = document.getElementById('mainContent');
  switch (view) {
    case 'dashboard':   renderDashboard(cont); break;
    case 'piezas':      renderPiezas(cont);    break;
    case 'usuarios':    renderUsuarios(cont);  break;
    case 'solicitudes': renderSolicitudes(cont);break;
    case 'reportes':    renderReportes(cont);  break;
    case 'movimientos': renderMovimientos(cont);break;
  }
}

/* ============================================================
   VISTA: DASHBOARD
============================================================ */
function renderDashboard(cont) {
  const piezas = getPiezas();
  const sols   = getSolicitudes();
  const total  = piezas.reduce((a, p) => a + p.cantidad, 0);
  const bajas  = piezas.filter(p => p.cantidad > 0 && p.cantidad <= p.stockMin);
  const agot   = piezas.filter(p => p.cantidad === 0);
  const pend   = sols.filter(s => s.estado === 'pendiente');

  cont.innerHTML = `
    <h1>Panel de control</h1>
    <p class="subtitle">Bienvenido/a, ${sesion.nombre} · Rol: <b>${sesion.rol}</b></p>

    <div class="cards">
      <div class="card"><span>Piezas registradas</span><h2>${piezas.length}</h2></div>
      <div class="card"><span>Total en stock</span><h2>${total}</h2></div>
      <div class="card card-warn"><span>Stock bajo</span><h2>${bajas.length}</h2></div>
      <div class="card card-danger"><span>Agotadas</span><h2>${agot.length}</h2></div>
      ${sesion.rol !== 'tecnico'
        ? `<div class="card card-info"><span>Solicitudes pendientes</span><h2>${pend.length}</h2></div>`
        : ''}
    </div>

    <h2 class="section-title">⚠️ Alertas de inventario</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Código</th><th>Nombre</th><th>Cantidad</th><th>Mínimo</th><th>Estado</th></tr></thead>
        <tbody>
          ${[...agot, ...bajas].map(p => {
            const e = estadoStock(p);
            return `<tr>
              <td>${p.codigo}</td><td>${p.nombre}</td>
              <td>${p.cantidad}</td><td>${p.stockMin}</td>
              <td><span class="badge ${e.clase}">${e.texto}</span></td>
            </tr>`;
          }).join('') || `<tr><td colspan="5">Sin alertas 🎉</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* ============================================================
   VISTA: PIEZAS
============================================================ */
function renderPiezas(cont) {
  const piezas = getPiezas();
  const puedeEditar = sesion.rol === 'administrador';

  cont.innerHTML = `
    <h1>Inventario de piezas</h1>
    <div class="toolbar">
      <input id="buscarPieza" class="input-search" placeholder="🔍 Buscar por código, nombre o categoría..." oninput="filtrarPiezas()">
      ${puedeEditar ? `<button class="btn-primary" onclick="formPieza()">+ Nueva pieza</button>` : ''}
    </div>
    <div class="table-wrap">
      <table id="tablaPiezas">
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th>Categoría</th>
            <th>Cantidad</th><th>Ubicación</th><th>Estado</th>
            ${puedeEditar ? '<th>Acciones</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${piezas.map(p => filaPieza(p, puedeEditar)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function filaPieza(p, editable) {
  const e = estadoStock(p);
  return `<tr data-search="${(p.codigo+p.nombre+p.categoria).toLowerCase()}">
    <td>${p.codigo}</td><td>${p.nombre}</td><td>${p.categoria}</td>
    <td>${p.cantidad}</td><td>${p.ubicacion}</td>
    <td><span class="badge ${e.clase}">${e.texto}</span></td>
    ${editable ? `<td>
      <button class="btn-sm" onclick="formPieza('${p.codigo}')">✏️</button>
      <button class="btn-sm btn-danger" onclick="eliminarPieza('${p.codigo}')">🗑️</button>
    </td>` : ''}
  </tr>`;
}

function filtrarPiezas() {
  const q = document.getElementById('buscarPieza').value.toLowerCase();
  document.querySelectorAll('#tablaPiezas tbody tr').forEach(tr => {
    tr.style.display = tr.dataset.search.includes(q) ? '' : 'none';
  });
}

/* ============================================================
   FORM PIEZA (crear / editar)
============================================================ */
function formPieza(codigo) {
  const piezas = getPiezas();
  const p = codigo ? piezas.find(x => x.codigo === codigo) : {};
  const overlay = document.getElementById('modalOverlay');
  const modal   = document.getElementById('modalContent');

  modal.innerHTML = `
    <h2>${codigo ? 'Editar' : 'Nueva'} pieza</h2>
    <form id="piezaForm">
      <label>Código</label>
      <input id="fCodigo" value="${p.codigo||''}" ${codigo?'disabled':''} required>
      <label>Nombre</label>
      <input id="fNombre" value="${p.nombre||''}" required>
      <label>Categoría</label>
      <input id="fCategoria" value="${p.categoria||''}" required>
      <label>Cantidad</label>
      <input id="fCantidad" type="number" min="0" value="${p.cantidad??0}" required>
      <label>Stock mínimo</label>
      <input id="fStockMin" type="number" min="0" value="${p.stockMin??5}" required>
      <label>Ubicación</label>
      <input id="fUbicacion" value="${p.ubicacion||''}" required>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Guardar</button>
      </div>
    </form>
  `;
  overlay.classList.add('show');

  document.getElementById('piezaForm').onsubmit = (e) => {
    e.preventDefault();
    const nueva = {
      codigo:   codigo || document.getElementById('fCodigo').value.trim(),
      nombre:   document.getElementById('fNombre').value.trim(),
      categoria:document.getElementById('fCategoria').value.trim(),
      cantidad: +document.getElementById('fCantidad').value,
      stockMin: +document.getElementById('fStockMin').value,
      ubicacion:document.getElementById('fUbicacion').value.trim()
    };
    if (codigo) {
      const idx = piezas.findIndex(x => x.codigo === codigo);
      piezas[idx] = nueva;
    } else {
      if (piezas.some(x => x.codigo === nueva.codigo)) {
        alert('El código ya existe'); return;
      }
      piezas.push(nueva);
      registrarMovimiento('entrada', nueva.codigo, nueva.cantidad, 'Registro inicial', sesion.nombre);
    }
    setPiezas(piezas);
    cerrarModal();
    navegar('piezas');
  };
}

function eliminarPieza(codigo) {
  if (!confirm(`¿Eliminar la pieza ${codigo}?`)) return;
  setPiezas(getPiezas().filter(p => p.codigo !== codigo));
  navegar('piezas');
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

/* ============================================================
   VISTA: USUARIOS (solo admin)
============================================================ */
function renderUsuarios(cont) {
  cont.innerHTML = `
    <h1>Usuarios del sistema</h1>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th></tr></thead>
        <tbody>
          ${getUsuarios().map(u => `
            <tr><td>${u.usuario}</td><td>${u.nombre}</td><td><span class="badge bad-ok">${u.rol}</span></td></tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <p class="subtitle" style="margin-top:1rem">Los usuarios están definidos en <code>js/data.js</code>.</p>
  `;
}

/* ============================================================
   VISTA: SOLICITUDES
============================================================ */
function renderSolicitudes(cont) {
  let sols = getSolicitudes();
  if (sesion.rol === 'tecnico') sols = sols.filter(s => s.solicitante === sesion.usuario);

  cont.innerHTML = `
    <h1>${sesion.rol === 'tecnico' ? 'Mis solicitudes' : 'Solicitudes de materiales'}</h1>
    ${sesion.rol === 'tecnico' ? `<button class="btn-primary" onclick="formSolicitud()">+ Nueva solicitud</button>` : ''}

    <div class="table-wrap" style="margin-top:1rem">
      <table>
        <thead>
          <tr><th>#</th><th>Fecha</th><th>Solicitante</th><th>Pieza</th><th>Cant.</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${sols.length === 0 ? `<tr><td colspan="8">Sin solicitudes</td></tr>` :
          sols.map(s => `
            <tr>
              <td>${s.id}</td><td>${s.fecha}</td><td>${s.solicitante}</td>
              <td>${s.piezaNombre} (${s.piezaCodigo})</td>
              <td>${s.cantidad}</td><td>${s.motivo}</td>
              <td><span class="badge ${badgeEstado(s.estado)}">${s.estado}</span></td>
              <td>
                ${sesion.rol === 'gerente' && s.estado === 'pendiente'
                  ? `<button class="btn-sm btn-ok" onclick="resolverSolicitud(${s.id}, 'aprobada')">✔</button>
                     <button class="btn-sm btn-danger" onclick="resolverSolicitud(${s.id}, 'rechazada')">✖</button>`
                  : '—'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function badgeEstado(e) {
  return e === 'pendiente' ? 'bad-warn' : e === 'aprobada' ? 'bad-ok' : 'bad-danger';
}

function formSolicitud() {
  const piezas = getPiezas();
  const modal  = document.getElementById('modalContent');
  modal.innerHTML = `
    <h2>Nueva solicitud de material</h2>
    <form id="solForm">
      <label>Pieza</label>
      <select id="sPieza" required>
        <option value="">-- Seleccione --</option>
        ${piezas.map(p => `<option value="${p.codigo}">${p.codigo} · ${p.nombre} (stock: ${p.cantidad})</option>`).join('')}
      </select>
      <label>Cantidad</label>
      <input id="sCantidad" type="number" min="1" required>
      <label>Motivo</label>
      <textarea id="sMotivo" rows="3" required></textarea>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Enviar</button>
      </div>
    </form>
  `;
  document.getElementById('modalOverlay').classList.add('show');

  document.getElementById('solForm').onsubmit = (e) => {
    e.preventDefault();
    const codigo = document.getElementById('sPieza').value;
    const pieza  = piezas.find(p => p.codigo === codigo);
    const sols   = getSolicitudes();
    sols.unshift({
      id: sols.length ? Math.max(...sols.map(x => x.id)) + 1 : 1,
      fecha: new Date().toLocaleString(),
      solicitante: sesion.usuario,
      piezaCodigo: codigo,
      piezaNombre: pieza.nombre,
      cantidad: +document.getElementById('sCantidad').value,
      motivo: document.getElementById('sMotivo').value,
      estado: 'pendiente'
    });
    setSolicitudes(sols);
    cerrarModal();
    navegar('solicitudes');
  };
}

function resolverSolicitud(id, estado) {
  const sols  = getSolicitudes();
  const sol   = sols.find(s => s.id === id);
  const piezas= getPiezas();

  if (estado === 'aprobada') {
    const pieza = piezas.find(p => p.codigo === sol.piezaCodigo);
    if (!pieza || pieza.cantidad < sol.cantidad) {
      alert('❌ No hay existencias suficientes para aprobar esta solicitud.');
      return;
    }
    pieza.cantidad -= sol.cantidad;
    setPiezas(piezas);
    registrarMovimiento('salida', pieza.codigo, sol.cantidad,
      `Solicitud #${id} aprobada (${sol.solicitante})`, sesion.nombre);
  }

  sol.estado = estado;
  setSolicitudes(sols);
  navegar('solicitudes');
}

/* ============================================================
   VISTA: MOVIMIENTOS
============================================================ */
function renderMovimientos(cont) {
  let movs = getMovimientos();
  if (sesion.rol === 'tecnico') movs = movs.filter(m => m.usuario === sesion.nombre);

  cont.innerHTML = `
    <h1>Movimientos de inventario</h1>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Pieza</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead>
        <tbody>
          ${movs.length === 0 ? `<tr><td colspan="6">Sin movimientos</td></tr>` :
          movs.map(m => `
            <tr>
              <td>${m.fecha}</td>
              <td><span class="badge ${m.tipo === 'entrada' ? 'bad-ok' : 'bad-danger'}">${m.tipo}</span></td>
              <td>${m.codigo}</td>
              <td>${m.cantidad}</td>
              <td>${m.motivo}</td>
              <td>${m.usuario}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ============================================================
   VISTA: REPORTES (gerente)
============================================================ */
function renderReportes(cont) {
  const piezas = getPiezas();
  const sols   = getSolicitudes();
  const movs   = getMovimientos();

  const aprobadas  = sols.filter(s => s.estado === 'aprobada').length;
  const rechazadas = sols.filter(s => s.estado === 'rechazada').length;
  const pendientes = sols.filter(s => s.estado === 'pendiente').length;
  const salidas    = movs.filter(m => m.tipo === 'salida').reduce((a, m) => a + m.cantidad, 0);
  const entradas   = movs.filter(m => m.tipo === 'entrada').reduce((a, m) => a + m.cantidad, 0);

  // top categorías
  const cats = {};
  piezas.forEach(p => cats[p.categoria] = (cats[p.categoria] || 0) + p.cantidad);
  const topCats = Object.entries(cats).sort((a,b) => b[1]-a[1]);

  cont.innerHTML = `
    <h1>Reportes y estadísticas</h1>
    <div class="cards">
      <div class="card card-info"><span>Solicitudes aprobadas</span><h2>${aprobadas}</h2></div>
      <div class="card card-warn"><span>Pendientes</span><h2>${pendientes}</h2></div>
      <div class="card card-danger"><span>Rechazadas</span><h2>${rechazadas}</h2></div>
      <div class="card"><span>Entradas totales</span><h2>${entradas}</h2></div>
      <div class="card"><span>Salidas totales</span><h2>${salidas}</h2></div>
    </div>

    <h2 class="section-title">Existencias por categoría</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Categoría</th><th>Total en stock</th></tr></thead>
        <tbody>
          ${topCats.map(([c,t]) => `<tr><td>${c}</td><td>${t}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ============================================================
   INIT
============================================================ */
renderSidebar();
navegar('dashboard');