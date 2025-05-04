import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Providers from "./utils/Providers.tsx";

createRoot(document.getElementById('root')!).render(
  <>
    <App/>
    <Providers/>
  </>,
)
