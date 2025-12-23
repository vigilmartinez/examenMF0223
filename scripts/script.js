const form = document.querySelector('form');
const lista = document.getElementById('lista-pcs');

const API_URL = 'https://694a53e31282f890d2d854bb.mockapi.io/pcExamen';

let computers = [];

// Calcular el precio
function calcularPrecio(cpu, ram) {
    const cpuNum = parseInt(cpu, 10);
    const ramNum = parseInt(ram, 10);
    return cpuNum * 13 + ramNum * 5; 
}

// Cargar todos los PCs desde la API
async function cargarComputers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al cargar los datos');
    computers = await response.json();

    // Si algún PC no tiene precio
    computers = computers.map(pc => {
        pc.price = calcularPrecio(pc.CPU, pc.RAM);
        return pc;
    });

    mostrarLista();
  } catch (err) {
    console.error('Error cargando desde API:', err);
    lista.innerHTML = '<p style="color:red;">Error al conectar con el servidor. Intenta más tarde.</p>';
  }
}

// Mostrar tarjetas
function mostrarLista() {
  lista.innerHTML = '';

  if (computers.length === 0) {
    lista.innerHTML = '<p>No hay PCs registrados aún.</p>';
    return;
  }

  computers.forEach(pc => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('pc-card');

    tarjeta.innerHTML = `
      <h3 class="pc-name">${pc.serverName}</h3>
      <div class="pc-specs">
        <p><strong>CPU:</strong> ${pc.CPU} núcleos</p>
        <p><strong>RAM:</strong> ${pc.RAM} GB</p>
        <p><strong>Almacenamiento:</strong> ${pc.storage}</p>
        <p class="pc-price"><strong>Precio:</strong> ${pc.price}€</p>
      </div>
        <button class="btn-delete" data-id="${pc.id}">X</button>
    `;

    lista.appendChild(tarjeta);
  });

  // eventos de eliminar
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', eliminarPC);
  });
}

// Agregar un nuevo PC
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const serverName = document.getElementById('serverName').value.trim();
  const cpu = document.getElementById('cpu').value;
  const ram = document.getElementById('ram').value;
  const storage = document.getElementById('storage').value;

  if (!serverName || !cpu || !ram) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }

  const cpuNum = parseInt(cpu, 10);
  const ramNum = parseInt(ram, 10);

  if (cpuNum < 2 || ramNum < 4) {
    alert('CPU mínimo 2 núcleos y RAM mínima 4 GB.');
    return;
  }

  const precio = calcularPrecio(cpuNum, ramNum);

  if(precio>=700){
    alert('Precio supera 700€');
    return;
  }

  const nuevoPC = {
    serverName,
    CPU: cpuNum,
    RAM: ramNum,
    storage,
    price: precio
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoPC)
    });

    if (!response.ok) throw new Error('Error al guardar');

    // Volvemos a cargar la lista actualizada
    await cargarComputers();

    form.reset();
    alert('PC agregado correctamente');
  } catch (err) {
    console.error('Error al agregar:', err);
    alert('Error al guardar el PC');
  }
});

// Eliminar un PC
async function eliminarPC(event) {
  const id = event.target.dataset.id;

  if (!confirm('¿Seguro que quieres eliminar este PC?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Error al eliminar');

    await cargarComputers();
    alert('PC eliminado');
  } catch (err) {
    console.error('Error al eliminar:', err);
    alert('Error al eliminar el PC');
  }
}

// Inicializar la app
cargarComputers();