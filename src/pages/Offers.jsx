import { useEffect, useState } from 'react'

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'



function Offers() {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastFetchLinsting, setLastFetchListing] = useState(null);

   

    useEffect(() => {
        const fetchListings = async () => {
          try {
            // Get reference
            const listingsRef = collection(db, 'listings')
    
            // Create a query
            const q = query(
              listingsRef,
              where('offer', '==', true),
              orderBy('timestamp', 'desc'),
              limit(10)
            )
    
            // Execute query
            const querySnap = await getDocs(q)

            // set visible listing
            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchListing(lastVisible);
    
            const listings = []
    
            querySnap.forEach((doc) => {
              return listings.push({
                id: doc.id,
                data: doc.data(),
              })
            })
    
            setListings(listings)
            setLoading(false)

          } catch (error) {
            toast.error("Une erreur s'est produite, réessayer")
          }
        }
    
        fetchListings()
      }, []);

      // Pagination/ Load More
      const onFetchMoreListings = async () => {
        try {
          // Get reference
          const listingsRef = collection(db, 'listings')
  
          // Create a query
          const q = query(
            listingsRef,
            where('offer', '==', true),
            orderBy('timestamp', 'desc'),
            startAfter(lastFetchLinsting),
            limit(10)
          )
  
          // Execute query
          const querySnap = await getDocs(q)

          // set visible listing
          const lastVisible = querySnap.docs[querySnap.docs.length - 1];
          setLastFetchListing(lastVisible);
  
          const listings = [];
            
          querySnap.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            })
          })
  
          setListings((prevState)=> [...prevState, ...listings]);
          setLoading(false);

        } catch (error) {
          toast.error("Une erreur s'est produite, réessayer")
        }
      }

    return (
    <div className='category'>
        <header>
            <p className='pageHeader'>
               Offres
            </p>
      </header>

      {loading ? <Spinner/> : listings && listings.length > 0 ? 
    <>
    <main>
        <ul className="categoryListings">
            {listings.map((listing)=> (
                <ListingItem 
                listing={listing.data} 
                id={listing.id} 
                key={listing.id}
                />
            ))}
        </ul>
    </main>

    <br />
    <br />
    {lastFetchLinsting && (
      <p className="loadMore" onClick={onFetchMoreListings}>Voir Plus</p>
    )}

    </>:  <p>Il n'y a pas d'offre pour le moment.</p>
    }
    </div>
    )
}

export default Offers


