import { useContext, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { ModelContext } from '../../AppContexts';

function CartEdit(props) {
    const model = useContext(ModelContext);
    const [state, setState] = useState({ summa: 0.00, platiba: 0.0000 });

    useEffect(() =>
        model.store.subscribe((event, data) => {
            console.log(event + "::" + data);
            if (data) {
                const summa = data.reduce((acc, item) => acc = + item.price, 0);
                setState({ summa });
            }
        })
    );

    return (
        <div style={props.style} className="p-d-flex">
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-outlined" />
            <span className="CartEdit-body">
                <div>
                    Kvadratūra:
                </div>
                <div>
                    {state && state.summa} EUR
                </div>
            </span>
        </div>
    );

}

export default CartEdit;