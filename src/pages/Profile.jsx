import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {getAuth, updateProfile} from 'firebase/auth';
import {updateDoc, doc} from 'firebase/firestore';
import {db} from '../firebase.config';
import {toast} from 'react-toastify';



function Profile() {
  const auth = getAuth();

  // State
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const {name, email} = formData;

  const navigate = useNavigate();

  // Functions
  // logOut function
  const onLogout = ()=>{
    auth.signOut();
    navigate('/');
  }

  // function to change profile details then update in firebase
  const onSubmit = async ()=>{
    try {
      if(auth.currentUser.displayName !== name){
        //Update display name in firebase
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
        // Update in Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name: name
        })
      }
    } catch (error) {
      toast.error('Impossible de mettre à jour le profil, Réessayer!')
      
    }
  }

  // function to updateFormData state
  const onChange = (e)=>{
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // rendered elements
  return <div className='profile'>
        <header className="profileHeader">
          <p className="pageHeader">My Profile</p>
          <button 
          type='button' 
          className="logOut"
          onClick={onLogout}
          >
            Se déconnecter
          </button>
        </header>

        <main>
          <div className="profileDetailsHeader">
            <p className="profileDetailsText">Informations Personnelles</p>
            <p 
            className="changePersonalDetails"
            onClick={()=>{
              changeDetails && onSubmit()
              setChangeDetails((prevState)=> !prevState)
            }}
            >
              {changeDetails ? 'Terminé' : 'Modifié'}
            </p>
          </div>

          <div className="profileCard">
            <form >
              <input 
              type="text" 
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
              />

              <input 
              type="text" 
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
              />
            </form>
          </div>
        </main>
    </div>
}

export default Profile