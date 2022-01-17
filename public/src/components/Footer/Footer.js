import { Divider } from 'primereact/divider';
import CartAddItem from "./CartAddItem";
import CartEdit from "./CartEdit";
import CartSend from "./CartSend";

function Footer(props) {

    return (
        <footer className="p-d-flex p-jc-evenly p-mb-2 p-mt-2">
            <CartAddItem style={{ "flexGrow": "0.3" }} />

            <Divider layout="vertical" />

            <CartEdit style={{ "flexGrow": "1" }} />

            <Divider layout="vertical" />

            <CartSend style={{ "flexGrow": "0.3" }} />
        </footer>
    );
}

export default Footer;