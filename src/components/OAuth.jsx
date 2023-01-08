import {useLocation, useNavigate} from 'react-router-dom';
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../firebase.config';
import {toast} from 'react-toastify';
import googleIcon from '../assets/svg/googleIcon.svg';


function OAuth() {
    const navigate = useNavigate();
    const location = useLocation()

    // functions
    // function on google click
    const onGoogleClick = async()=>{
        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider );
            const user = result.user;

            // Check for user in firestore
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            // if user doen't exist, create user
            if(!docSnap.exists()){
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp(),
                })
            }
            navigate('/')
        } catch (error) {
            toast.error("Impossible de s'inscrire ou de s'identifier avec Google, Réessayer")
        }
    }

    // rendered elements
    return (
        <div className='socialLogin'>
            <p>
                {location.pathname === '/sign-up' ? "S'insrire" : "S'identifier"} avec
            </p>
            <button 
            className="socialIconDiv"
            onClick={onGoogleClick}
            >
                <img 
                src={googleIcon} 
                alt="google"
                className='socialIconImg'
                />
            </button>
        </div>
    )
}

export default OAuth