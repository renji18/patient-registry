import {ChangeEvent, FormEvent, useState} from "react";
import {toast} from "sonner";
import {runQuery} from "../utils/dbUtil.ts";

export default function PatientForm() {

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const {name, age, gender, contact} = form;

    if (!name || !age || !gender || !contact) {
      toast.info("Please fill out all fields");
      return;
    }

    const result = await runQuery(
      'INSERT INTO patients (name, age, gender, contact) VALUES ($1, $2, $3, $4)',
      [name, Number(age), gender, contact]
    );

    if (result) {
      setForm({name: '', age: '', gender: '', contact: ''});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-semibold">Register New Patient</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
        placeholder="Age"
        required
        className="w-full px-3 py-2 border rounded"
      />

      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <input
        name="contact"
        value={form.contact}
        onChange={handleChange}
        required
        placeholder="Contact Info"
        className="w-full px-3 py-2 border rounded"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit
      </button>
    </form>
  )
}