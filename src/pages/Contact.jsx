import {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../firebase.config';
import {toast} from 'react-toastify';

function Contact() {
    // State
    const [message, setMessage] = useState('');
    const [landlord, setLandlord] = useState(null);
    // eslint-disable-next-line 
    const [searchParams, setSearchParams] = useSearchParams();

    const params = useParams();

    useEffect(()=>{
        const getLandlord = async () => {
            const docRef = doc(db, 'users', params.landlordId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                setLandlord(docSnap.data())
            }else{
                toast.error("Information proriétaire indisponible")
            }
        }

        getLandlord();

    }, [params.landlordId])



    // Functions
    const onChange = (e) => {
        setMessage(e.target.value);
    }

    // Rendered elements
    return (
    <div className='pageContainer'>
        <header>
            <p className="pageHeader">Contact du Propriétaire</p>
        </header>

        {landlord !== null && (
            <main style={{minHeight: '100%'}}>
               <div className="contactLandlord">
                    <p className="landlordName">Contact {landlord?.name}</p>
                </div>

                 <form className="messageForm">
                    <div className="messageDiv">
                        <label htmlFor="message" className="messageLabel">
                            Message
                        </label>
                        <textarea 
                        name="message" 
                        id="message" 
                        className='textarea' 
                        value={message} 
                        onChange={onChange}
                        >
                        </textarea>
                    </div>

                    <a 
                    href={`mailto:${landlord.email}?Subject=${searchParams.get('listingName')}&body=${message}`}
                    >
                        <button type='button' className="primaryButton">Envoyer</button>
                    </a>
                 </form>
            </main>
        )}
    </div>
    )
}

export default Contact

