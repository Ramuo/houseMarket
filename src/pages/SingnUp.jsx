import {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import {setDoc, doc, serverTimestamp} from 'firebase/firestore';
import {db} from '../firebase.config';
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg'



function SignUp() {
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const {name, email, password} = formData;

  const navigate = useNavigate();


  // Functions
  const onChange = (e)=>{
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onSubmit = async (e)=>{
    e.preventDefault();

    try {
      const auth = getAuth()

      const userCredential = await createUserWithEmailAndPassword
      (
        auth, 
        email, 
        password
      );

      const user = userCredential.user;

      updateProfile(auth.currentUser, {
        displayName: name
      })

      const formDataCopy = {...formData};
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), formDataCopy)

      navigate('/')

    } catch (error) {
      toast.error("Une erreur est survenue, réessayez ")
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
          placeholder='Nom'
          id='name'
          value={name}
          onChange={onChange}
          className="nameInput" 
          />
          <input 
          type="email" 
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

          <div className="signUpBar">
            <p className="signUpText">
              S'inscrire
            </p>
            <button className="signUpButton">
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
            </button>
          </div>
        </form>
        {/* Google OAuth*/}

        <Link to='/sign-in' className='registerLink'>
          S'identifier
        </Link>
      </div>
    </>
  )
} 

export default SignUp