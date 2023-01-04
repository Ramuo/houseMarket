import {useState} from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg'



function SignIn() {
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const {email, password} = formData;

  const navigate = useNavigate();


  // Functions
  const onChange = (e)=>{
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  //Function submit sign in
  const onSubmit = async (e)=>{
    e.preventDefault();

    try {
      const auth = getAuth();


      const userCredential = await signInWithEmailAndPassword
      (auth, email, password)

      if(userCredential.user){
        navigate('/')
      }
      
    } catch (error) {
      toast.error('Email ou Mot de passe incorrect ')
    }

    
  } 


  // Rendered elements
  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">
            Welcome Back!
          </p>
        </header>

        <form onSubmit={onSubmit}>
          <input 
          type="text" 
          placeholder='Email'
          id='email'
          value={email}
          onChange={onChange}
          className="emailInput" 
          />

          <div className="passwordInputDiv">
            <input 
            type={showPassword ? 'text' : 'password'}
            className = 'passwordInput' placeholder='Mot de passe'
            id='password'
            value={password}
            onChange={onChange}
            />

            <img 
            src={visibilityIcon} 
            alt="show password" 
            className="showPassword" 
            onClick={()=> setShowPassword((prevState)=> !prevState)}
            />
          </div>

          <Link to='/forgot-password' className='forgotPasswordLink'>
            Mot de passe oublié
          </Link>

          <div className="signInBar">
            <p className="signInText">
              S'identifier
            </p>
            <button className="signInButton">
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
            </button>
          </div>
        </form>
        {/* Google OAuth*/}

        <Link to='/sign-up' className='registerLink'>
          S'inscrire
        </Link>
      </div>
    </>
  )
} 

export default SignIn