import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {collection, getDocs, query, orderBy, limit} from 'firebase/firestore';
import {db} from '../firebase.config';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import Spinner from './Spinner';

function Slider() {
    // State 
    const [loading, setLoading] = useState(true);
    const [listings, setListing] = useState(null);

    const navigate = useNavigate();

    useEffect(()=>{
        const fetchListings = async ()=>{
            const listingsRef = collection(db, 'listings');
            const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
            const querySnap = await getDocs(q);

            let listings =[];

            querySnap.forEach((doc)=>{
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                })
        });
        setListing(listings);
        setLoading(false);
        }

        fetchListings();
        
    }, [])

    // let's check for loading
    if(loading){
        return <Spinner/>
    }

    if(listings.length === 0){
        return <></>
    }

    // Rendered elements
    return listings && (
        <>
            <p className="exploreHeading">Recommandés</p>

            <Swiper 
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            slidesPerView={1}
            pagination={true}
            navigation
            >
                {listings.map(({data, id})=>(
                    <SwiperSlide key={id} onClick={()=>navigate(`/category/${data.type}/${id}`)}>
                        <div 
                        style={{
                            background: `url(${data.imageUrls[0]}) center no-repeat`, 
                            backgroundSize: 'cover', 
                            minHeight: '20rem',
                        }}
                        className="SwiperSlideDiv"
                        >
                           <p className="swiperSlideText">{data.name}</p>
                           <p className="swiperSlidePrice">
                                {data.discountedPrice ?? data.regularPrice}€
                                {''} {data.type === 'rent' && '/ Mois'}
                            </p> 
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}

export default Slider