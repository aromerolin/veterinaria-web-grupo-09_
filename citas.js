const STORAGE_key = 'citasVet';

function loadCitas() {
  try {
    const raw = localStorage.getItem(STORAGE_key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error leyendo localStorage", e);
    return [];
  }
}

function saveCitas(citas) {
  localStorage.setItem(STORAGE_key, JSON.stringify(citas));
}

function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function populateFilters() {
  const selEspecie = document.getElementById('filtroEspecie');
  const selServicio = document.getElementById('filtroServicio');

  if (!selEspecie || !selServicio) return;

  const todasLasEspecies = ["Perro", "Gato", "Ave", "Otro"];
  const todosLosServicios = [
    "Odontología", "Medicina Felina", "Ecografías", "Cirugías", 
    "Consultas Médicas", "Internamientos", "Cardiología", "Emergencias",
    "Endoscopia", "Oftalmología", "Traumatología", "Oncología",
    "Nutrición", "Anestesia Inhalatoria", "Laboratorio", "Hospedajes",
    "Baños y Cortes", "Comidas Premium"
  ];

  const currentEspecie = selEspecie.value;
  const currentServicio = selServicio.value;

  selEspecie.innerHTML = '<option value="">Todas las Especies</option>';
  todasLasEspecies.forEach(e => {
    selEspecie.innerHTML += `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`;
  });

  selServicio.innerHTML = '<option value="">Todos los Servicios</option>';
  todosLosServicios.forEach(s => {
    selServicio.innerHTML += `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`;
  });

  selEspecie.value = currentEspecie;
  selServicio.value = currentServicio;
}


function renderCitas() {
  const cont = document.getElementById('tablaCitas');
  const citasInfo = document.getElementById('citasInfo');
  if (!cont || !citasInfo) return;

  const citas = loadCitas();
  const filtroEspecie = document.getElementById('filtroEspecie').value;
  const filtroServicio = document.getElementById('filtroServicio').value;

  const filtradas = citas.filter(c => {
    const matchEspecie = !filtroEspecie || c.especie === filtroEspecie;
    const matchServicio = !filtroServicio || c.servicio === filtroServicio;
    return matchEspecie && matchServicio;
  }).sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora));

  if (filtradas.length === 0) {
    cont.innerHTML = '<p class="text-center text-muted small mt-3">No hay citas registradas que coincidan con los filtros.</p>';
    citasInfo.textContent = "Mostrando 0 citas.";
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-success">
          <tr>
            <th>Mascota (Especie)</th>
            <th>Servicio</th>
            <th>Fecha y Hora</th>
            <th>Propietario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtradas.map(c => `
            <tr class="${c.atendida ? 'table-light text-muted' : ''}">
              <td><strong>${escapeHtml(c.nombreMascota) || 'N/A'}</strong> (${escapeHtml(c.especie)})</td>
              <td>${escapeHtml(c.servicio)}</td>
              <td>${escapeHtml(c.fecha)} <br> ${escapeHtml(c.hora)}</td>
              <td>${escapeHtml(c.propietario)} <br> <small>${escapeHtml(c.email)}</small></td>
              <td>
                <span class="badge ${c.atendida ? 'bg-secondary' : 'bg-primary'}">
                  ${c.atendida ? 'Atendida' : 'Pendiente'}
                </span>
              </td>
              <td>
                <button class="btn btn-sm ${c.atendida ? 'btn-outline-secondary' : 'btn-success'}" onclick="toggleAtendida('${c.id}')">
                  ${c.atendida ? 'Revertir' : '✓ Marcar Atendida'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCita('${c.id}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  cont.innerHTML = html;
  citasInfo.textContent = `Mostrando ${filtradas.length} de ${citas.length} citas totales.`;
}

function deleteCita(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
    let citas = loadCitas();
    citas = citas.filter(c => c.id !== id);
    saveCitas(citas);
    renderCitas();
  }
}

function toggleAtendida(id) {
  let citas = loadCitas();
  const cita = citas.find(c => c.id === id);
  if (cita) {
    cita.atendida = !cita.atendida;
    saveCitas(citas);
    renderCitas();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const filtroEspecie = document.getElementById('filtroEspecie');
  const filtroServicio = document.getElementById('filtroServicio');

  if (filtroEspecie) filtroEspecie.addEventListener('change', renderCitas);
  if (filtroServicio) filtroServicio.addEventListener('change', renderCitas);
  
  populateFilters();
  renderCitas();
});
