import {useState} from 'react';
import {Link} from 'react-router-dom';
import {getAuth, sendPasswordResetEmail} from 'firebase/auth';
import {toast} from 'react-toastify';
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg';

function FogortPassword() {
  // State
  const [email, setEmail] = useState();


  // Functions
  const onChange = (e) => {
    setEmail(e.target.value)
  }

  const onSubmit = async (e) =>{
    e.preventDefault();
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success('Un Email de réinitialisation vous a été envoyé.')

    } catch (error) {
      toast.error("Une erreur s'est produite, réessayer")
    }

  }


  return (
    <div className = 'pageContainer'>
        <header>
          <p className="pageHeader">Mot de passe oublié</p>
        </header>

        <main>
          <form onSubmit={onSubmit}>
            <input 
            type="email" 
            placeholder='Email'
            id='email'
            value={email}
            className='emailInput'
            onChange={onChange}
            />

            <Link to='/sign-in' className='forgotPasswordLink'>
              S'inscrire
            </Link>

            <div className="signInBar">
              <div className="signInText">Réinitialiser</div>
              <button className="signInButton">
                <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
              </button>
            </div>
          </form>
        </main>
    </div>
  )
}

export default FogortPassword