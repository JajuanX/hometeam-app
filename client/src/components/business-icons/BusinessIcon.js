import React from 'react';
import Artist from '../../styles/assets/business-icons/artist.png';
import BarberShop from '../../styles/assets/business-icons/barber-shop.png';
import CarWash from '../../styles/assets/business-icons/car-wash.png';
import Church from '../../styles/assets/business-icons/church.png';
import Clothing from '../../styles/assets/business-icons/clothing.png';
import Coaching from '../../styles/assets/business-icons/coaching.png';
import EventPlanner from '../../styles/assets/business-icons/event-planner.png';
import Finance from '../../styles/assets/business-icons/finance.png';
import Fitness from '../../styles/assets/business-icons/fitness.png';
import GraphicDesign from '../../styles/assets/business-icons/graphic-designer.png';
import Beauty from '../../styles/assets/business-icons/hair-salon.png';
import MobileRepair from '../../styles/assets/business-icons/mobile-repair.png';
import Photography from '../../styles/assets/business-icons/photographer.png';
import PrintServices from '../../styles/assets/business-icons/print-services.png';
import RealEstate from '../../styles/assets/business-icons/real-estate.png';
import Restaurant from '../../styles/assets/business-icons/restaurant.png';
import TattooArtist from '../../styles/assets/business-icons/tattoo-artist.png';
import Teaching from '../../styles/assets/business-icons/teaching.png';
import Videography from '../../styles/assets/business-icons/videography.png';
import WebDesign from '../../styles/assets/business-icons/web-design.png';

const BusinessIcon = ({icon, size}) => {
	switch (icon) {
		case 'Restaurant' : return <img alt="Restaurant" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Restaurant}></img>
		case 'Beauty' : return <img alt='Beauty' style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Beauty}></img>
		case 'Church' : return <img alt='Church' style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Church}></img>
		case 'Teaching' : return <img alt="Teaching" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Teaching}></img>
		case 'Event Planning' : return <img alt="Event Planning" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={EventPlanner}></img>
		case 'Financial' : return <img alt="Financial" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Finance}></img>
		case 'Fitness' : return <img alt="Fitness" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Fitness}></img>
		case 'Graphic Design' : return <img alt="Graphic Design" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={GraphicDesign}></img>
		case 'Web Services' : return <img alt="Web Services" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={WebDesign}></img>
		case 'Videography' : return <img alt="Videography" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Videography}></img>
		case 'Photography' : return <img alt="Photography" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Photography}></img>
		case 'Clothing' : return <img alt="Clothing" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Clothing}></img>
		case 'Printing Services' : return <img alt="Printing Services" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={PrintServices}></img>
		case 'Car Wash' : return <img alt="Car Wash" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={CarWash}></img>
		case 'Real Estate' : return <img alt="Real Estate" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={RealEstate}></img>
		case 'Coaching' : return <img alt="Coaching" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Coaching}></img>
		case 'Tattoo Artist' : return <img alt="Tattoo Artist" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={TattooArtist}></img>
		case 'Art' : return <img alt="Art" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={Artist}></img>
		case 'Barbershop' : return <img alt="Barbershop" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={BarberShop}></img>
		case 'Mobile Repair' : return <img alt="Mobile Repair" style={{height: `${size}`, width: `${size}`, margin: 'auto'}} src={MobileRepair}></img>
		default : return null;
	}
}

export default BusinessIcon;