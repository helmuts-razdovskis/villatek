import { Button } from 'primereact/button';

function CartSend(props) {
    return (
        <div style={props.style}>
            <Button icon="pi pi-send" className="p-button-rounded p-button-outlined" />
        </div>
    );

}

export default CartSend;