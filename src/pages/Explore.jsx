import {Link} from 'react-router-dom';
import Slider from '../components/Slider';
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg';
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg';





function Explore() {
  return (
    <div className='explore'>
        <header>
          <p className ='pageHeader'>Explorer</p>
        </header>

        <main>
          <Slider/>

          <p className="exploreCategoryHeading">Categories</p>
          <div className="exploreCategories">
            <Link to='/category/rent'>
              <img 
              src={rentCategoryImage} 
              alt="rent" 
              className="exploreCategoryImg" 
              />
              <p className="exploreCategoryName">À Louer</p>
            </Link>

            <Link to='/category/sale'>
              <img 
              src={sellCategoryImage} 
              alt="sell" 
              className="exploreCategoryImg" 
              />
              <p className="exploreCategoryName">À Vendre</p>
            </Link>
          </div>
        </main>
    </div>
  )
}

export default Explore