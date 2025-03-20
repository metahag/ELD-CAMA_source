{/*This file conatins the code responible for sending different images to the study cards depending on the study id*/}

import bild0 from "../../assets/images/studiebild0.jpg";
import bild1 from "../../assets/images/studiebild1.png";
import bild2 from "../../assets/images/studiebild2.jpg";
import bild3 from "../../assets/images/studiebild3.jpg";
import bild4 from "../../assets/images/studiebild4.jpg";
import bild5 from "../../assets/images/studiebild5.jpg";
import bild6 from "../../assets/images/studiebild6.png";
import bild7 from "../../assets/images/studiebild7.png";
import bild8 from "../../assets/images/studiebild8.png";
import bild9 from "../../assets/images/studiebild9.webp";
import bild10 from "../../assets/images/studiebild10.webp";
import bild11 from "../../assets/images/studiebild11.webp";
import bild12 from "../../assets/images/studiebild12.webp";
import bild13 from "../../assets/images/studiebild13.webp";
import bild14 from "../../assets/images/studiebild14.webp";
import bild15 from "../../assets/images/studiebild15.webp";
import bild16 from "../../assets/images/studiebild16.webp";
import bild17 from "../../assets/images/studiebild17.webp";


const images = [bild0, bild1, bild2, bild3, bild4, bild5, bild6, bild7, bild8, bild9, bild10, bild11, bild12, bild13, bild14, bild15, bild16, bild17];

function getImageIn(id:any){
    return images[id%17]
}

export default getImageIn