import {toast, Toaster} from "sonner";
import {useEffect} from "react";
import {initDB} from "../lib/db.ts";


// provider component for database initialization and Toaster
export default function Providers() {

  useEffect(() => {
    initDB()
      .then(() => toast.success("Database Connected"))
      .catch(error => {
        toast.error("Error connecting database", error);
      });
  }, [])

  return (
    <Toaster richColors/>
  )
}