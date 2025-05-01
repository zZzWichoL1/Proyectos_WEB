const API      = '../backend/endpoint.php';
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
  selector.value = active;                                      
  toggleSections(active);
  fetchData(active);
});

// 2) Cambiar sección y guardar en localStorage
selector.addEventListener('change', e => {
  const t = e.target.value;
  localStorage.setItem('activeTable', t);                       
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

// 3) Fetch de datos genérico - Usa el nuevo endpoint con action=read
async function fetchData(table) {
  try {
    const res  = await fetch(`${API}?action=read&table=${table}`);
    const data = await res.json();
    if (table === 'empleados') renderEmpleados(data);
    else renderPuestos(data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// 4) Renderizar Empleados
function renderEmpleados(data) {
  empTbody.innerHTML = data.map(emp => `
    <tr data-id="${emp.ID_Empleado}">
      <td>${emp.ID_Empleado}</td>
      <td contenteditable="true">${emp.Clave_Empleado}</td>
      <td contenteditable="true">${emp.Nombre}</td>
      <td contenteditable="true">${emp.A_paterno}</td>
      <td contenteditable="true">${emp.A_materno}</td>
      <td contenteditable="true">${emp.ID_Puesto}</td>
      <td contenteditable="true">${emp.Fecha_Ingreso}</td>
      <td contenteditable="true">${emp.Fecha_Baja}</td>
      <td contenteditable="true">${emp.Estatus}</td>
      <td>
        <div class="action-buttons">
          <button onclick="inlineSave('empleados', ${emp.ID_Empleado})"><i class="fas fa-save"></i></button>
          <button onclick="deleteItem('empleados', ${emp.ID_Empleado})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
  const table = document.getElementById('tablaEmpleadosTable');
  table.classList.remove('table-blur-animate');
  void table.offsetWidth;
  table.classList.add('table-blur-animate');
}

// 5) Renderizar Puestos
function renderPuestos(data) {
  pstTbody.innerHTML = data.map(pst => `
    <tr data-id="${pst.ID_Puesto}">
      <td>${pst.ID_Puesto}</td>
      <td contenteditable="true">${pst.Puesto}</td>
      <td>
        <button onclick="inlineSave('puestos', ${pst.ID_Puesto})"><i class="fas fa-save"></i></button>
        <button onclick="deleteItem('puestos', ${pst.ID_Puesto})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
  const table = document.getElementById('tablaPuestosTable');
  table.classList.remove('table-blur-animate');
  void table.offsetWidth;
  table.classList.add('table-blur-animate');
}

// 6) Crear/Actualizar vía formulario usando el endpoint con action create/update
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

  // Construir el payload a partir de los campos del formulario
  const payload = { table };
  for (const key in fields) {
    const input = e.target.elements[fields[key]];
    if (input) payload[key] = input.value;
  }

  // Crear nuevo Usuario
  const res = await fetch(`${API}?action=create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (json.success && json.data) {
    // Agrega la nueva fila solo
    if (table === 'empleados') {
      const emp = json.data;
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-id', emp.ID_Empleado);
      newRow.innerHTML = `
        <td>${emp.ID_Empleado}</td>
        <td contenteditable="true">${emp.Clave_Empleado}</td>
        <td contenteditable="true">${emp.Nombre}</td>
        <td contenteditable="true">${emp.A_paterno}</td>
        <td contenteditable="true">${emp.A_materno}</td>
        <td contenteditable="true">${emp.ID_Puesto}</td>
        <td contenteditable="true">${emp.Fecha_Ingreso}</td>
        <td contenteditable="true">${emp.Fecha_Baja}</td>
        <td contenteditable="true">${emp.Estatus}</td>
        <td>
          <div class="action-buttons">
            <button onclick="inlineSave('empleados', ${emp.ID_Empleado})"><i class="fas fa-save"></i></button>
            <button onclick="deleteItem('empleados', ${emp.ID_Empleado})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      empTbody.appendChild(newRow);
    } else if (table === 'puestos') {
      const pst = json.data;
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-id', pst.ID_Puesto);
      newRow.innerHTML = `
        <td>${pst.ID_Puesto}</td>
        <td contenteditable="true">${pst.Puesto}</td>
        <td>
          <div class="action-buttons">
            <button onclick="inlineSave('puestos', ${pst.ID_Puesto})"><i class="fas fa-save"></i></button>
            <button onclick="deleteItem('puestos', ${pst.ID_Puesto})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      pstTbody.appendChild(newRow);
    }
    alert('Registro creado');
    e.target.reset();
  } else {
    alert('Error al crear');
  }
}

// 7) Guardado inline de toda la fila para Actualizaar Datos
window.inlineSave = async (table, id) => {
  const tbody = table === 'empleados' ? empTbody : pstTbody;
  const tr = tbody.querySelector(`tr[data-id="${id}"]`);
  const tds = tr.querySelectorAll('td');
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
    payload.Puesto    = tds[1].textContent.trim();
  }

  const res = await fetch(`${API}?action=update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (json.success) {
    // Opcional: resalta la fila editada
    tr.style.backgroundColor = "#d4edda";
    setTimeout(() => tr.style.backgroundColor = "", 800);
    // No recargues toda la tabla
    alert('Registro actualizado');
  } else {
    alert('Error al actualizar');
  }
};

// 8) Eliminar registros
window.deleteItem = async (table, id) => {
  if (!confirm('¿Eliminar?')) return;
  const payload = { table };
  if (table === 'empleados') payload.ID_Empleado = id;
  else payload.ID_Puesto = id;

  const res = await fetch(`${API}?action=delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (json.success) {
    // Elimina solo la fila
    const tbody = table === 'empleados' ? empTbody : pstTbody;
    const tr = tbody.querySelector(`tr[data-id="${id}"]`);
    if (tr) tr.remove();
    alert('Registro eliminado');
  }
};

// 9) Modo claro por defecto y modo oscuro
document.body.classList.remove('dark-mode');
const themeToggle = document.getElementById('theme-toggle');
function setThemeIcon() {
  themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}
setThemeIcon();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  setThemeIcon();
});
