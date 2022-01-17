import img_phone from "../../assets/images/social/phone-64.png";
import img_email from "../../assets/images/social/email-64.png";
import img_facebook from "../../assets/images/social/facebook-64.png";
import img_instagram from "../../assets/images/social/instagram-64.png";
import MenuButton from "./MenuButton";
import LangButton from "./LangButton";

function Header(props) {
    return (
    <header className="App-header">
        <MenuButton />
        <span>Villatek</span>
        <LangButton className="right-group-first" />
        <img src={img_phone} alt={props.info.phone} title={props.info.phone} className="social-icon" />
        <img src={img_email} alt={props.info.email} title={props.info.email} className="social-icon" />
        <img src={img_facebook} alt={props.info.facebook} title={props.info.facebook} className="social-icon" />
        <img src={img_instagram}alt={props.info.instagram} title={props.info.instagram} className="social-icon" />
    </header>)
}

export default Header;