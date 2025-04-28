const API      = '../backend/';
const selector = document.getElementById('tablaSelect');
const empSec   = document.getElementById('empleadosSection');
const pstSec   = document.getElementById('puestosSection');
const empForm  = document.getElementById('empleadosForm');
const pstForm  = document.getElementById('puestosForm');
const empTbody = document.getElementById('tablaEmpleados');
const pstTbody = document.getElementById('tablaPuestos');

// 1) Mostrar sección por defecto al cargar
document.addEventListener('DOMContentLoaded', () => {
  const active = localStorage.getItem('activeTable') || 'empleados';  
  selector.value = active;                                       // Lee con getItem 
  toggleSections(active);
  fetchData(active);
});

// 2) Cambiar sección y guardar en localStorage
selector.addEventListener('change', e => {
  const t = e.target.value;
  localStorage.setItem('activeTable', t);                        // Guarda con setItem 
  toggleSections(t);
  fetchData(t);
});

// Helper para mostrar/ocultar secciones
function toggleSections(table) {
  if (table === 'empleados') {
    empSec.style.display = ''; pstSec.style.display = 'none';
  } else {
    empSec.style.display = 'none'; pstSec.style.display = '';
  }
}

// 3) Fetch de datos genérico
async function fetchData(table) {
  try {
    const res  = await fetch(`${API}read.php?table=${table}`);   // Fetch API moderna 
    const data = await res.json();
    if (table === 'empleados') renderEmpleados(data);
    else                   renderPuestos(data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// 4) Renderizar Empleados
function renderEmpleados(data) {
  empTbody.innerHTML = data.map(p => `
    <tr data-id="${p.ID_Empleado}">
      <td>${p.ID_Empleado}</td>
      <td contenteditable="true">${p.Clave_Empleado}</td>     
      <td contenteditable="true">${p.Nombre}</td>
      <td contenteditable="true">${p.A_paterno}</td>
      <td contenteditable="true">${p.A_materno}</td>
      <td contenteditable="true">${p.ID_Puesto}</td>
      <td contenteditable="true">${p.Fecha_Ingreso}</td>
      <td contenteditable="true">${p.Fecha_Baja || ''}</td>
      <td contenteditable="true">${p.Estatus}</td>
      <td>
        <button onclick="inlineSave('empleados', ${p.ID_Empleado})">Guardar</button>
        <button onclick="deleteItem('empleados', ${p.ID_Empleado})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// 5) Renderizar Puestos
function renderPuestos(data) {
  pstTbody.innerHTML = data.map(p => `
    <tr data-id="${p.ID_Puesto}">
      <td>${p.ID_Puesto}</td>
      <td contenteditable="true">${p.Puesto}</td>               
      <td>
        <button onclick="inlineSave('puestos', ${p.ID_Puesto})">Guardar</button>
        <button onclick="deleteItem('puestos', ${p.ID_Puesto})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// 6) Crear/Actualizar vía formulario
empForm.addEventListener('submit', e =>
  handleForm(e, 'empleados', {
    ID_Empleado:    'ID_Empleado',
    Clave_Empleado: 'Clave_Empleado',
    Nombre:         'Nombre',
    A_paterno:      'A_paterno',
    A_materno:      'A_materno',
    ID_Puesto:      'ID_Puesto',
    Fecha_Ingreso:  'Fecha_Ingreso',
    Fecha_Baja:     'Fecha_Baja',
    Estatus:        'Estatus'
}));

pstForm.addEventListener('submit', e =>
  handleForm(e, 'puestos', {
    ID_Puesto_P: 'ID_Puesto_P',                                  
    Puesto:      'Puesto'
}));

async function handleForm(e, table, fields) {
  e.preventDefault();
  const payload = { table };
  for (const key in fields) {
    payload[key] = document.getElementById(fields[key]).value;  // Leer inputs por ID
  }
  const isEdit = Boolean(payload[ Object.keys(fields)[0] ]);
  const url    = isEdit ? 'update.php' : 'create.php';
  const res    = await fetch(API + url, {
    method: 'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(payload)                                // JSON.stringify 
  });
  const json = await res.json();
  if (json.success) {
    alert(isEdit ? 'Usuario Editado con éxito' : 'Empleado Creado Con Éxito');
    e.target.reset();
    fetchData(table);
  } else {
    alert('Error al guardar');
  }
}

// 7) Guardado inline de toda la fila
window.inlineSave = async (table, id) => {
  const tbody  = table === 'empleados' ? empTbody : pstTbody;
  const tr     = tbody.querySelector(`tr[data-id="${id}"]`);
  const tds    = tr.querySelectorAll('td');                     
  const payload = { table };

  if (table === 'empleados') {
    payload.ID_Empleado    = id;
    payload.Clave_Empleado = tds[1].textContent.trim();
    payload.Nombre         = tds[2].textContent.trim();
    payload.A_paterno      = tds[3].textContent.trim();
    payload.A_materno      = tds[4].textContent.trim();
    payload.ID_Puesto      = tds[5].textContent.trim();
    payload.Fecha_Ingreso  = tds[6].textContent.trim();
    payload.Fecha_Baja     = tds[7].textContent.trim();
    payload.Estatus        = tds[8].textContent.trim();
  } else {
    payload.ID_Puesto_P = id;                                     
    payload.Puesto      = tds[1].textContent.trim();
  }

  const res  = await fetch(API + 'update.php', {
    method: 'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (json.success) {
    alert('Usuario Editado con éxito');
    fetchData(table);
  } else {
    console.error('Update failed:', json.error);
  }
};

// 8) Eliminar registros
async function deleteItem(table, id) {
  if (!confirm('¿Eliminar?')) return;
  const payload = { table };
  if (table === 'empleados') {
    payload.ID_Empleado = id;
  } else {
    payload.ID_Puesto   = id;                                     
  }

  const res  = await fetch(API + 'delete.php', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (json.success) fetchData(table);
}
