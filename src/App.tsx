import PatientForm from "./components/PatientForm.tsx";
import SQLConsole from "./components/SQLConsole.tsx";

export default function App() {

  return (
    <main className="min-h-screen bg-gray-100 flex flex-wrap items-center justify-start gap-8 py-12 px-4">
      <PatientForm/>
      <SQLConsole/>
    </main>
  )
}