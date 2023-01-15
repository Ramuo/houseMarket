import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {getAuth, updateProfile} from 'firebase/auth';
import {
  updateDoc, 
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase.config'
import {toast} from 'react-toastify';
import ListingItem from '../components/ListingItem';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';





function Profile() {
  const auth = getAuth();

  // State
  const [changeDetails, setChangeDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  useEffect(()=>{
    const fetchUserListings = async ()=>{
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnap = await getDocs(q)

      let listings = [];

      querySnap.forEach((doc) =>{
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      });

      setListings(listings);
      setLoading(false);
    }

    fetchUserListings();

  }, [auth.currentUser.uid]);

  // Functions
  // logOut function
  const onLogout = ()=>{
    auth.signOut();
    navigate('/');
  }

  // function to change profile details then update in firebase
  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        })

        // Update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
    } catch (error) {
      console.log(error)
      toast.error('Impossible de mettre à jour le profil, Réessayer!')
    }
  }

  // function to updateFormData state
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  // On delete function
  const onDelete = async (listingId)=>{
    if(window.confirm('Êtes vous sûr de supprimer?')){
      await deleteDoc(doc(db, 'listings', listingId))

      const updatedListings = listings.filter((listing)=> listing.id !== listingId);
      setListings(updatedListings);
      toast.success('Supprimé avec succès!');
    }
  }
  // on edit function
  const onEdit = (listingId)=>{
    navigate(`/edit-listing/${listingId}`)
  }

  // rendered elements
  return <div className='profile'>
        <header className="profileHeader">
          <p className="pageHeader">Mon Profil</p>
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

          <Link to='/create-listing' className='createListing'>
            <img 
            src={homeIcon}
            alt="home" 
            />

            <p>Louer ou Vender votre maison</p>

            <img 
            src={arrowRight} 
            alt="arrow right" 
            />
          </Link>

          {!loading && listings?.length > 0 && (
            <>
              <p className="listingText">Votre Liste</p>
              <ul className="listingsList">
                {listings.map((listing)=>(
                  <ListingItem 
                  key={listing.id} 
                  listing={listing.data}
                  id={listing.id}
                  onDelete={()=>onDelete(listing.id)}
                  onEdit={()=>onEdit(listing.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </main>
    </div>
}

export default Profile