import { useCallback, useContext, useState } from 'react';
import useBus, { dispatch } from 'use-bus';
import { MetaContext } from '../AppContexts';
import { BusEvents } from '../Constants';
import ItemSlider from './ItemSlider';

function ItemPicker({ onHide }) {
    //TODO calculate slide width dynamically -> flex: X X auto?
    //TODO back button when collapsed categories goes to full category view (setCategoryId(null))
    //TODO custom close button 
    const meta = useContext(MetaContext);
    const [categoryId, setCategoryId] = useState();


    const renderCategory = useCallback((item) => {
        return (<div>
            {!categoryId && <img alt={item.title} title={item.title} src={`/images/categories/${item.code}-200.jpg`} />}
            <div className="ItemPicker-category-title">{item.title}</div>
        </div>
        );
    }, [categoryId]);

    const renderFunc2 = (item) => {
        return (<div>
            <div className="ItemPicker-category-title">{item.title}</div>
            <img alt={item.title} title={item.title} src={`/images/blocks/${item.code}-200.jpg`}
                onDoubleClick={onHide} onClick={dispatch({ type: BusEvents.ITEM_DIALOG_SELECTED, key: item.id })} />
        </div>
        );
    };

    return (
        <div>
            {categoryId && <ItemSlider className="ItemPicker-items"
                items={meta.categories.find((item) => item.id === categoryId).blocks}
                itemRenderFunc={renderFunc2} />}
            <ItemSlider className="ItemPicker-categories"
                items={meta.categories}
                itemRenderFunc={renderCategory}
                onSelect={setCategoryId} selectedKey={categoryId}
            />
        </div>
    );
}

export default ItemPicker;