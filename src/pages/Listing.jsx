import {useState, useEffect} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import {getDoc, doc} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import {db} from '../firebase.config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';

function Listing() {
    // State
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);

    const navigate = useNavigate();
    const params = useParams();
    const auth = getAuth();

    useEffect(()=>{
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                //console.log(docSnap.data());
                setListing(docSnap.data());
                setLoading(false);
            }
        }

        fetchListing();
        
    }, [navigate, params.listingId])

    if(loading){
      return <Spinner/>
    }


    // Functions:


    // Rendered elements
    return (
    <main>
       <Swiper 
       slidesPerView={1}
       modules={[Navigation, Pagination, Scrollbar, A11y]} 
       pagination={true}
       navigation
       scrollbar={{ dragable: true }}
       >
        {listing.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imageUrls[index]}) center no-repeat`,
                backgroundSize: 'cover',
                minHeight: "20rem",
              }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
       </Swiper>


        <div className="shareIconDiv" 
            onClick={()=>{navigator.clipboard.writeText(window.location.href)
            setShareLinkCopied(true);
            setTimeout(()=>{
                setShareLinkCopied(false)
            }, 2000)
        }}>
            <img 
            src={shareIcon} 
            alt="" 
            />
        </div>
        
        {shareLinkCopied && <p className='linkCopied'>Lien copié!</p>}

        <div className="listingDetails">
            <p 
            className="listingName">
            {listing.name} - {listing.offer 
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }€
            </p>

            <p className="listingLocation">{listing.location}</p>

            <p className="listingType">
            À {listing.type === 'rent' ? 'Louer': 'Vendre' }
            </p>

            {listing.offer && (
                <p className="discountPrice">
                    {listing.regularPrice - listing.discountedPrice}€ remise

                </p>
            )}

            <ul className="listingDetailsList">
                <li>
                    {listing.bedrooms > 1 
                    ? `${listing.bedrooms} Chambres` 
                    : '1 Chambre'}
                </li>
                <li>
                    {listing.bathrooms > 1 
                    ? `${listing.bathrooms} Douches` 
                    : '1 Douche'}
                </li>
                <li>{listing.parking && 'Parking' }</li>
                <li>{listing.furnished && 'Meublé' }</li>
            </ul>

            <p className="listingLocationTitle">
                Lieu
            </p>

            <div className="leafletContainer">
                <MapContainer 
                style={{height: '100%', width: '100%'}}
                center={[listing.geolocation.lat, listing.geolocation.lng]}
                zoom={13}
                scrollWheelZoom={false}
                >
                    <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
                    />

                    <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
                        <Popup>{listing.location}</Popup>
                    </Marker>

                </MapContainer>
            </div>

            {auth.currentUser?.uid !== listing.userRef && (
                <Link 
                to={`/contact/${listing.userRef}?listingName=${listing.name}`} 
                className='primaryButton'>
                    Contact du Proriétaire
                </Link>
            )}
        </div>
    </main>
    )
}

export default Listing


// LINK TO SORTOUT LEAFLET BUG
// // https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat