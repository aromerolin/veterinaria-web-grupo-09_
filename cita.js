const STORAGE_KEY = 'citasVet';

function loadCitas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

function isEmailValid(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).toLowerCase());
}

function isFechaHoraValida(fechaStr, horaStr) {
  if (!fechaStr || !horaStr) return false;
  const dt = new Date(`${fechaStr}T${horaStr}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  return dt >= today;
}

function haySolapamiento(nuevaCita, citas) {
  return citas.some(c => c.fecha === nuevaCita.fecha && c.hora === nuevaCita.hora && c.especie === nuevaCita.especie);
}

function setMinDateToday() {
  const inputFecha = document.getElementById('fecha');
  if (!inputFecha) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  inputFecha.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('citaForm');
  const btnLimpiar = document.getElementById('btnLimpiar');
  
  setMinDateToday();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const propietario = document.getElementById('propietario').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const email = document.getElementById('email').value.trim();
      const nombreMascota = document.getElementById('nombreMascota').value.trim();
      const especie = document.getElementById('especie').value;
      const servicio = document.getElementById('servicio').value;
      const fecha = document.getElementById('fecha').value;
      const hora = document.getElementById('hora').value;
      const observaciones = document.getElementById('observaciones').value.trim();

      if (!propietario || !email || !isEmailValid(email) || !especie || !servicio || !fecha || !hora) {
        alert("Complete todos los campos obligatorios correctamente.");
        return;
      }
      if (!isFechaHoraValida(fecha, hora)) {
        alert("La fecha y hora no pueden ser en el pasado.");
        return;
      }

      const nuevaCita = {
        id: String(Date.now()),
        propietario, telefono, email, nombreMascota, especie, servicio, fecha, hora, observaciones, atendida: false
      };

      const citas = loadCitas();
      if (haySolapamiento(nuevaCita, citas)) {
        alert("Ya existe una cita con la misma fecha, hora y especie.");
        return;
      }

      citas.push(nuevaCita);
      saveCitas(citas);

      alert("¡Cita registrada con éxito!");
      form.reset();
 
      window.location.href = 'citas.html';
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      if (form) form.reset();
    });
  }
});