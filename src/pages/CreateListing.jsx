import {useState, useEffect} from 'react';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import { 
  getStorage,
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import {db} from  '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import {toast} from 'react-toastify';


const initialFormState = {
  type: "rent",
  name: "",
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  address: "",
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  images: {},
  latitude: 0,
  longitude: 0,
};


function CreateListing() {
  // State
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  // let'us destructure forData
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth();
  const navigate = useNavigate();
 
  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      if(user){
        setFormData({...initialFormState, userRef: user.uid});
      }else{
        navigate('/sign-in')
      }
    });

    return unsubscribe;

  }, [auth, navigate])


  
  // Functions
  // function Onsubmit to handle the form
  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    // checkin the price vs the offer
    if(discountedPrice >= regularPrice){
      setLoading(false)
      toast.error("L'offre doit être inférieur au prix normal.")
      return
    }
    // Max imgs to load
    if(images.length > 6){
      setLoading(false)
      toast.error('Maximum 6 images')
      return
    }

    // GEOLOCALISATION API
    let geolocation ={}
    let location 

    if(geolocationEnabled){
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
        )

      const data = await res.json();
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0 ;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0 ;

      location = data.status === 'ZERO_RESULTS' 
      ? undefined 
      : data.results[0]?.formatted_address 


      // to if location = to undifine
      if(location === undefined || location.includes('undefined')){
        setLoading(false);
        toast.error("Entrer une bonne adresse");
        return
      }

    }else{
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      location = address
      
    }

    // To Store image firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject)=>{
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/'+ fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = 
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        reject(error)
      }, 
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
         resolve(downloadURL);
        });
      }
    );

      })
    } 

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

  // Clean Up
  formDataCopy.location = address
  delete formDataCopy.images
  delete formDataCopy.address
  !formDataCopy.offer && delete formDataCopy.discountedPrice

    // Let's save to the Database
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    


    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)

  }

  // function onMutate
  const onMutate = (e)=>{
    let boolean = null;

    if(e.target.value === 'true'){
      boolean = true;
    }

    if(e.target.value === 'false'){
      boolean = false;
    }

    // Files
    if(e.target.files){
      setFormData((prevState)=> ({
        ...prevState,
        images: e.target.files
      }));
    }
    //Text/Boolean/numbers
    if(!e.target.files){
      setFormData((prevState)=>({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
  }

  if(loading){
    return <Spinner/>
  }

  // Rendered elements
  return (
    <div className='profile'>
      <header>
        <p className="pageHeader">Créer une liste </p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Vendre / Louer</label>
          <div className="formButtons">
            <button
            type='button'
            className={type === 'sale' ? 'formButtonActive' : 'formButton'}
            id='type'
            value='sale'
            onClick={onMutate}
            >
              Vendre
            </button>

            <button
            type='button'
            className={type === 'rent' ? 'formButtonActive' : 'formButton'}
            id='type'
            value='rent'
            onClick={onMutate}
            >
              Louer
            </button>
          </div>

          <label className='formLabel'>Nom</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Chambres</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Douches</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Oui
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Meublés</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}
            >
              Oui
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Adresse</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offre</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Oui
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Prix</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>€ / Mois</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Prix Réduit</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            La première image sera l'image d'accueil (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Créer la Liste
          </button>
        </form>
      </main>
    </div>
)
} 

export default CreateListing



