import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SingnUp';
import ForgortPassword from './pages/FogortPassword';



function App() { 
  return (
    <>
      <Router>
        <Routes>
          <Route path = '/' element={<Explore/>}/>
          <Route path = '/offers' element={<Offers/>}/>
          <Route path = '/profile' element={<Profile/>}/>
          <Route path = '/sign-in' element={<SignIn/>}/>
          <Route path = '/sign-up' element={<SignUp/>}/>
          <Route path = '/forgot-password' element={<ForgortPassword/>}/>
        </Routes>
        <Navbar/>
      </Router>

      <ToastContainer/>
    </>
  );
}

export default App;
