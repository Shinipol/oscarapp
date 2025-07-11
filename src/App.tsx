import { useState, useEffect } from "react";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";


/* ---------- Tipos (opcionales pero útiles) ---------- */
type Clase = {
  fecha: string;
  asistencia: "Clase tomada" | "Clase no tomada";
  tareaRealizada: "Sí" | "No";
  tarea: string;
  observacion: string;
};

type Alumno = {
  nombre: string;
  correo: string;
  telefono: string;
  modalidad: "Mensual" | "Bimestral" | "Pago completo";
  fechaInicio: string;
  estado: "Activo" | "Inactivo";
  clases: Clase[];
  pagos: {
    modalidad: Alumno["modalidad"];
    estado: ("PENDIENTE" | "PAGADO")[];
  };
};

/* ---------- Datos iniciales ---------- */
const alumnosIniciales: Alumno[] = [
  {
    nombre: "Elena González",
    correo: "elena.gonzalez@example.com",
    telefono: "987-654-3210",
    modalidad: "Mensual",
    fechaInicio: "2024-07-01",
    estado: "Activo",
    clases: [
      {
        fecha: "2024-07-01",
        asistencia: "Clase tomada",
        tareaRealizada: "Sí",
        tarea: "Escala de Do",
        observacion: "Bien hecha",
      },
      {
        fecha: "2024-07-08",
        asistencia: "Clase tomada",
        tareaRealizada: "Sí",
        tarea: "Arpegios",
        observacion: "Traer pentagrama",
      },
      {
        fecha: "2024-07-15",
        asistencia: "Clase no tomada",
        tareaRealizada: "No",
        tarea: "Lectura musical",
        observacion: "",
      },
    ],
    pagos: {
      modalidad: "Mensual",
      estado: ["PENDIENTE", "PENDIENTE", "PENDIENTE", "PENDIENTE"] as ("PENDIENTE" | "PAGADO")[],
    },
  },
];

/* ---------- Helpers ---------- */
function generarFechasPago(fechaInicio: string, modalidad: string): string[] {
  const base = new Date(fechaInicio);
  const fechas: string[] = [];
  const opciones = { year: "numeric", month: "2-digit", day: "2-digit" } as const;

  if (modalidad === "Mensual") {
    for (let i = 0; i < 4; i++) {
      const nueva = new Date(base);
      nueva.setMonth(nueva.getMonth() + i);
      fechas.push(nueva.toLocaleDateString("es-MX", opciones));
    }
  } else if (modalidad === "Bimestral") {
    for (let i = 0; i < 2; i++) {
      const nueva = new Date(base);
      nueva.setMonth(nueva.getMonth() + i * 2);
      fechas.push(nueva.toLocaleDateString("es-MX", opciones));
    }
  } else if (modalidad === "Pago completo") {
    fechas.push(new Date(base).toLocaleDateString("es-MX", opciones));
  }

  return fechas;
}

/* ---------- Componente principal ---------- */
export default function App() {
  const [alumnos, setAlumnos] = useState<Alumno[]>(() => {
    const data = localStorage.getItem("alumnos");
    return data ? JSON.parse(data) : alumnosIniciales;
  });

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno>(
    alumnos[0]
  );

  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    modalidad: "Mensual",
    fechaInicio: "",
  });

  const fechasPago = generarFechasPago(
    alumnoSeleccionado.fechaInicio,
    alumnoSeleccionado.pagos.modalidad
  );
  

  /* ---------- Persistencia ---------- */
  useEffect(() => {
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
  }, [alumnos]);

  /* ---------- Handlers ---------- */
  const marcarComoPagado = (idx: number) => {
    const nuevosAlumnos = [...alumnos];
    const index = nuevosAlumnos.findIndex(
      (a) => a.nombre === alumnoSeleccionado.nombre
    );
    nuevosAlumnos[index].pagos.estado[idx] = "PAGADO";
    setAlumnos(nuevosAlumnos);
    setAlumnoSeleccionado(nuevosAlumnos[index]);
  };

  const agregarAlumno = () => {
    if (!nuevoAlumno.nombre || !nuevoAlumno.fechaInicio) return;

    const estadosPago =
      nuevoAlumno.modalidad === "Mensual"
        ? ["PENDIENTE", "PENDIENTE", "PENDIENTE", "PENDIENTE"]
        : nuevoAlumno.modalidad === "Bimestral"
        ? ["PENDIENTE", "PENDIENTE"]
        : ["PENDIENTE"];

    const nuevo: Alumno = {
      nombre: nuevoAlumno.nombre,
      correo: nuevoAlumno.correo,
      telefono: nuevoAlumno.telefono,
      modalidad: nuevoAlumno.modalidad as Alumno["modalidad"],
      fechaInicio: nuevoAlumno.fechaInicio,
      estado: "Activo",
      clases: [],
      pagos: {
        modalidad: nuevoAlumno.modalidad as Alumno["modalidad"],
        estado: estadosPago,
      },
    };

    const actualizados = [...alumnos, nuevo];
    setAlumnos(actualizados);
    setAlumnoSeleccionado(nuevo);
    setNuevoAlumno({
      nombre: "",
      correo: "",
      telefono: "",
      modalidad: "Mensual",
      fechaInicio: "",
    });
  };

  const eliminarAlumno = (nombre: string) => {
    const confirmar = window.confirm(`¿Seguro que quieres eliminar a ${nombre}?`);
    if (!confirmar) return;
  
    const nuevosAlumnos = alumnos.filter((a) => a.nombre !== nombre);
    setAlumnos(nuevosAlumnos);
  
    if (alumnoSeleccionado.nombre === nombre) {
      setAlumnoSeleccionado(nuevosAlumnos[0] || alumnosIniciales[0]);
    }
  };
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  

  /* ---------- UI ---------- */
  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen">
      {/* Sidebar */}
      <div className="bg-white shadow p-4">
        <h2 className="text-xl font-bold mb-4">OscarApp</h2>

        <div className="mb-2 font-semibold">Alumnos</div>
        <input
          placeholder="Buscar"
          className="mb-4 border px-2 py-1 w-full rounded"
        />
<button
  onClick={() => setMostrarInactivos((prev) => !prev)}
  className="mb-2 text-sm text-blue-600 hover:underline"
>
  {mostrarInactivos ? "Ocultar inactivos" : "Mostrar historial 🗃"}
</button>


{alumnos
  .filter((a) => mostrarInactivos || a.estado === "Activo")
  .map((alumno) => (

  <div
    key={alumno.nombre}
    className={`p-2 rounded cursor-pointer flex justify-between items-center ${
      alumnoSeleccionado.nombre === alumno.nombre
        ? "bg-blue-100 font-semibold"
        : "hover:bg-gray-100"
    }`}
  >
    
    <span
      className="flex-1"
      onClick={() => setAlumnoSeleccionado(alumno)}
    >
      {alumno.nombre}
    </span>
    
    <button
      className="ml-2 text-red-500 hover:text-red-700 text-sm"
      onClick={() => eliminarAlumno(alumno.nombre)}
    >
      ✕
    </button>
  </div>
))}

        {/* Formulario para nuevo alumno */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold mb-2">Agregar nuevo alumno</h3>
          <input
            placeholder="Nombre"
            value={nuevoAlumno.nombre}
            onChange={(e) =>
              setNuevoAlumno({ ...nuevoAlumno, nombre: e.target.value })
            }
            className="mb-2 border px-2 py-1 w-full rounded"
          />
          <input
            placeholder="Correo"
            value={nuevoAlumno.correo}
            onChange={(e) =>
              setNuevoAlumno({ ...nuevoAlumno, correo: e.target.value })
            }
            className="mb-2 border px-2 py-1 w-full rounded"
          />
          <input
            placeholder="Teléfono"
            value={nuevoAlumno.telefono}
            onChange={(e) =>
              setNuevoAlumno({ ...nuevoAlumno, telefono: e.target.value })
            }
            className="mb-2 border px-2 py-1 w-full rounded"
          />
          <select
            value={nuevoAlumno.modalidad}
            onChange={(e) =>
              setNuevoAlumno({ ...nuevoAlumno, modalidad: e.target.value })
            }
            className="mb-2 border px-2 py-1 w-full rounded"
          >
            <option value="Mensual">Mensual</option>
            <option value="Bimestral">Bimestral</option>
            <option value="Pago completo">Pago completo</option>
          </select>
          <input
            type="date"
            value={nuevoAlumno.fechaInicio}
            onChange={(e) =>
              setNuevoAlumno({ ...nuevoAlumno, fechaInicio: e.target.value })
            }
            className="mb-2 border px-2 py-1 w-full rounded"
          />
          <button
            onClick={agregarAlumno}
            className="w-full bg-green-500 text-white px-3 py-2 rounded"
          >
            Guardar alumno
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Datos del alumno */}
        <h1 className="text-2xl font-bold mb-4">Clases</h1>

        <div className="mb-6 bg-white p-4 rounded shadow grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">{alumnoSeleccionado.nombre}</p>
            <p>{alumnoSeleccionado.correo}</p>
            <p>{alumnoSeleccionado.telefono}</p>
          </div>
          <div>
            <p>Modalidad: {alumnoSeleccionado.modalidad}</p>
            <p>Inicio: {alumnoSeleccionado.fechaInicio}</p>
            <p>
              Estado:{" "}
              <span className="text-green-600 font-semibold">
                {alumnoSeleccionado.estado}
              </span>
            </p>
          </div>
          <button
  onClick={() => {
    const nuevosAlumnos = [...alumnos];
    const i = nuevosAlumnos.findIndex(
      (a) => a.nombre === alumnoSeleccionado.nombre
    );
    nuevosAlumnos[i].estado =
      nuevosAlumnos[i].estado === "Activo" ? "Inactivo" : "Activo";
    setAlumnos(nuevosAlumnos);
    setAlumnoSeleccionado(nuevosAlumnos[i]);
  }}
  className={`mt-4 px-3 py-2 rounded text-white ${
    alumnoSeleccionado.estado === "Activo"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {alumnoSeleccionado.estado === "Activo"
    ? "Mover a historial"
    : "Reactivar alumno"}
</button>

        </div>

        {/* Tabla de clases */}
        <table className="w-full text-sm border mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Asistencia</th>
              <th className="border p-2">Tarea realizada</th>
              <th className="border p-2">Tarea siguiente</th>
              <th className="border p-2">Observaciones</th>
              <th className="border p-2">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {alumnoSeleccionado.clases.map((clase, idx) => (
              <tr key={idx}>
                <td className="border p-2">
                  <input
                    type="date"
                    value={clase.fecha}
                    onChange={(e) => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases[idx].fecha = e.target.value;
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className="w-full rounded border px-1 py-1"
                  />
                </td>

                {/* Asistencia */}
                <td className="border p-2 text-center">
                  <select
                    value={clase.asistencia}
                    onChange={(e) => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases[idx].asistencia = e.target.value as Clase["asistencia"];
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className={`w-full rounded text-center px-1 py-1 ${
                      clase.asistencia === "Clase tomada"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="Clase tomada">Clase tomada</option>
                    <option value="Clase no tomada">Clase no tomada</option>
                  </select>
                </td>

                {/* Tarea realizada */}
                <td className="border p-2 text-center">
                  <select
                    value={clase.tareaRealizada}
                    onChange={(e) => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases[idx].tareaRealizada = e.target
                        .value as Clase["tareaRealizada"];
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className={`w-full rounded text-center px-1 py-1 ${
                      clase.tareaRealizada === "Sí"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </td>

                {/* Tarea siguiente */}
                <td className="border p-2">
                  <input
                    type="text"
                    value={clase.tarea}
                    onChange={(e) => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases[idx].tarea = e.target.value;
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className="w-full rounded border px-1 py-1"
                  />
                </td>

                {/* Observaciones */}
                <td className="border p-2">
                  <input
                    type="text"
                    value={clase.observacion}
                    onChange={(e) => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases[idx].observacion = e.target.value;
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className="w-full rounded border px-1 py-1"
                  />
                </td>

                {/* Eliminar */}
                <td className="border p-2 text-center">
                  <button
                    onClick={() => {
                      const nuevosAlumnos = [...alumnos];
                      const i = nuevosAlumnos.findIndex(
                        (a) => a.nombre === alumnoSeleccionado.nombre
                      );
                      nuevosAlumnos[i].clases.splice(idx, 1);
                      setAlumnos(nuevosAlumnos);
                      setAlumnoSeleccionado(nuevosAlumnos[i]);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Botón agregar clase */}
        <button
          className="mb-8 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            const nuevaClase: Clase = {
              fecha: new Date().toISOString().split("T")[0],
              asistencia: "Clase no tomada",
              tareaRealizada: "No",
              tarea: "",
              observacion: "",
            };
            const nuevosAlumnos = [...alumnos];
            const i = nuevosAlumnos.findIndex(
              (a) => a.nombre === alumnoSeleccionado.nombre
            );
            nuevosAlumnos[i].clases.push(nuevaClase);
            setAlumnos(nuevosAlumnos);
            setAlumnoSeleccionado(nuevosAlumnos[i]);
          }}
        >
          + Agregar clase
        </button>

        {/* Pagos */}
        <h2 className="text-xl font-bold mb-4">Pagos</h2>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {fechasPago.map((fecha, idx) => (
              <tr key={idx}>
                <td className="border p-2">{fecha}</td>
                <td
                  className={`border p-2 text-center ${
                    alumnoSeleccionado.pagos.estado[idx] === "PAGADO"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {alumnoSeleccionado.pagos.estado[idx]}
                </td>
                <td className="border p-2 text-center">
                  {alumnoSeleccionado.pagos.estado[idx] !== "PAGADO" && (
                    <button
                      onClick={() => marcarComoPagado(idx)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Marcar como pagado
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
