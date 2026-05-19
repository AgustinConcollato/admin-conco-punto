import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { AppRouter } from './routes/AppRouter'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  )
}

export default App
