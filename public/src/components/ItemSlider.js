import React, { useEffect, useState, useCallback } from 'react'
import classNames from 'classnames'
import { useEmblaCarousel } from 'embla-carousel/react'

function ItemSlider(props) {
    const selectedClass = "is-selected";

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', selectedClass: "" })

    // useEffect(() => {
    //     if (emblaApi) {
    //         // Embla API is ready
    //         if (props.onSelected) {
    //             emblaApi.on("selected", props.onSelected);
    //             return () => emblaApi.off("selected", props.onSelected)
    //         }
    //     }
    // }, [emblaApi, props.onSelected]);


    const { onSelect } = props;

    const _onSelect = useCallback((e, key) => {
        if (key && emblaApi && emblaApi.clickAllowed) {
            if (onSelect)
                onSelect(key);
            // const slides = emblaApi.slideNodes();
            // slides.forEach((item) => {
            //     if (item.key === props.selectedKey) {
            //         item.classNames.add(selectedClass);
            //     } else {
            //         item.classNames.remove(selectedClass);
            //     }
            // });
        }
    }, [emblaApi, onSelect]);

    const slides = props.items.map((item) => (
        <div key={item.id} className={classNames("embla__slide", { "is-selected": item.id === props.selectedKey })} onClick={(e) => _onSelect(e, item.id)}>
            {props.itemRenderFunc(item)}
        </div>));

    const className = classNames([props.className, "embla"]);
    return (
        <div className={className} ref={emblaRef}>
            <div className="embla__container">
                {slides}
            </div>
        </div>
    );
}

export default ItemSlider