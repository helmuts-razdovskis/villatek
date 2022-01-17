import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import useBus, { dispatch } from 'use-bus';
import { useState } from 'react';
import { BusEvents } from '../../Constants';
import ItemPicker from '../ItemPicker';

function CartAddItem(props) {

    const [state, setState] = useState(false);
    useBus(BusEvents.ITEM_DIALOG_SHOW, () => {
        setState(true);
    });

    const onHide = () => {
        dispatch(BusEvents.ITEM_DIALOG_CANCEL);
        setState(false);
    }

    // const renderFooter = (name) => {
    //     return (
    //         <div>
    //             <Button label="No" icon="pi pi-times" onClick={() => onHide()} className="p-button-text" />
    //             <Button label="Yes" icon="pi pi-check" onClick={() => onHide()} autoFocus />
    //         </div>
    //     );
    // }
    return (

        <div style={props.style}>
            <Button icon="pi pi-plus" className="p-button-rounded p-button-outlined" onClick={() => dispatch(BusEvents.ITEM_DIALOG_SHOW)} />
            <Dialog visible={state} position="bottom" style={{ width: '100vw' }} onHide={() => onHide()}
                draggable={false} resizable={false} closable={true} closeOnEscape={true} modal={false} baseZIndex={1000}>
                <ItemPicker onHide={() => onHide()} />
            </Dialog>
        </div>

    );

}

export default CartAddItem;