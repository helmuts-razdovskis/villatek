import { useContext, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { ModelContext } from '../../AppContexts';

function CartEdit(props) {
    const model = useContext(ModelContext);
    const [state, setState] = useState({ summa: 0.00, platiba: 0.0000 });

    useEffect(() =>
        model.store.subscribe((data) => {
            console.log("model.store.updated::" + data);
            if (data) {
                var summary = summarizeAll(data);
                setState(summary);
            }
        })
    );
    
    const summarizeAll = function(entry) {
        const snaps = entry.snaps.filter(c => c.state !== -1);
        const summa = entry.getVariant().price;
        const platiba = entry.getVariant().m2;
        const result =  { summa, platiba };
        return snaps.reduce((acc, con) => 
            {
                const sub = summarizeAll(con);
                acc.summa = acc.summa + sub.summa;
                acc.platiba += sub.platiba;
                return acc;
            }
            , result);
    }

    return (
        <div style={props.style} className="p-d-flex">
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-outlined" />
            <span className="CartEdit-body">
                <div>
                    Platība: {state && state.platiba } m2
                </div>
                <div>
                    Summa: {state && state.summa} EUR
                </div>
            </span>
        </div>
    );

}

export default CartEdit;