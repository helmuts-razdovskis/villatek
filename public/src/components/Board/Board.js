import Konva from 'konva';
import React, { useContext, useEffect, useRef } from 'react';
import useBus from 'use-bus';
import { ProgressBar } from 'primereact/progressbar';
import { MetaContext, ModelContext } from '../../AppContexts';
import { BusEvents } from '../../Constants';
import { ImageUrl } from '../../Configuratoin';
import { ModelEntry } from './Model';

function Board(props) {
    const OPACITY_TEMP = 0.5;
    // mode: 0 - default view, 1 - adding module
    // const state = useState({mode: 0})
    const element = useRef("element");

    const meta = useContext(MetaContext);
    const model = useContext(ModelContext);

    // componentDidMount 
    useEffect(() => {
        if (meta && meta.available) {
            const root = meta.blocks.find(b => b.mcategoryId === 1);
            const block = root && root.variants[0];
            const from = { variantTo: block };
            model.store.setData(new ModelEntry(from));

            return initStage(element, model.store.getData());
        }
    }, [meta]);

    useBus(BusEvents.ITEM_DIALOG_SELECTED, (message) => {
        console.log("Board: processing ITEM_DIALOG_SELECTED " + message.key);
        itemSelected(message.key);
    });
    useBus(BusEvents.ITEM_DIALOG_CANCEL, () => deselect());

    const loadImage = function (url, kimage, klayer) {
        console.log("LoadImage: " + url);
        var image = new Image();
        image.onload = function () {
            kimage.image(image);
            zoomToFit();
        };
        image.src = url;
        klayer.add(kimage);
        return kimage;
    }

    const itemAdd = function (entry /* ModelEntry */) {
        if (!(entry && element && element.current && element.current._layer_blocks))
            return;
        const layer = element.current._layer_blocks;

        let { transform, x, y } = entry.from;
        const url = ImageUrl.PLANS + entry.getVariant().code + ".png"
            + ((transform) ? "?r=" + transform : "");

        if (entry.getTo() && entry.getTo()._kimage) {
            x = + entry.getTo()._kimage.x;
            y = + entry.getTo()._kimage.y;
        }
        entry._kimage = loadImage(url,
            new Konva.Image({
                x: x || 0, y:
                    y || 0,
                opacity: entry.getState() === -1 ? OPACITY_TEMP : 1,
            }),
            layer);
        entry._kimage._model_entry = entry;

        entry._kimage.on('click', (ev) => {
            const entry = ev.target._model_entry;
            ev.target.opacity(1);
            entry.setState(0);
            deselect();
        });

        if (entry.getState() === -1) {
            entry._kimage.on('mouseenter', (ev) => {
                if (ev.target._model_entry && ev.target._model_entry.getState() === -1) {
                    ev.target.opacity(1);
                    ev.target.getLayer().batchDraw();
                }
            });
            entry._kimage.on('mouseleave', (ev) => {
                if (ev.target._model_entry && ev.target._model_entry.getState() === -1) {
                    ev.target.opacity(OPACITY_TEMP);
                    ev.target.getLayer().batchDraw();
                }
            });
        }
        entry.getSnaps().forEach(item => itemAdd(item));
    };

    let lastBlockId = 0;

    const deselect = function () {
        lastBlockId = 0;
        const m = model.store.getData();
        const entries = m.removeTempConnections();
        entries.forEach(entry => {
            if (entry._kimage) {
                const kimg = entry._kimage;
                //TODO handle Add button removal
                kimg.off("*");
                kimg.destroy();
            }
        });
        zoomToFit();
    }

    const itemSelected = function (blockId) {
        if (lastBlockId === blockId)
            return;
        lastBlockId = blockId;

        deselect();
        const m = model.store.getData();
        const entires = m.addTempConnections(blockId);
        entires.forEach(entry => itemAdd(entry));
        zoomToFit();
        if (element && element.current && element.current._layer_blocks)
            element.current._layer_blocks.batchDraw();
    };

    const itemRemove = function (key) {

    };

    const initStage = function (element, root) {
        console.log("InitStage: " + root.getVariant().code)

        const _stage = new Konva.Stage({
            container: element.current,
            draggable: false,
            width: element.current.offsetWidth,
            height: element.current.offsetHeight,
        });


        const layer = new Konva.Layer({
            draggable: true,

            dragBoundFunc: function (pos) {
                // const stage = this.getStage();
                const stage = element.current._stage;
                const stageW = stage.x() + stage.width();
                const stageY = stage.y() + stage.height();
                const { x, y, width, height } = this.getClientRect();
                //TODO make bounds more usable
                const newY = Math.abs(pos.y) > stageY - height / 4 ? (stageY - height / 4) * Math.sign(pos.y) : pos.y;
                const newX = Math.abs(pos.x) > stageW - width / 4 ? (stageW - width / 4) * Math.sign(pos.x) : pos.x;;
                return {
                    x: newX,
                    y: newY,
                };
            },
        });

        _stage.add(layer);
        element.current._stage = _stage;
        element.current._layer_blocks = layer;

        root && itemAdd(root);

        window.addEventListener("resize", handleWindowResize);
        _stage.on('wheel', (e) => {
            e.evt.preventDefault();
            if (e.evt.deltaY < 0) { zoomIn(); } else { zoomOut(); }
        });

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        }
    }

    const handleWindowResize = function () {
        const stage = element.current._stage;
        stage.width(element.current.offsetWidth);
        stage.height(element.current.offsetHeight);
        stage.draw();
    }

    const getLayerSize = function () {
        if (!(element && element.current && element.current._layer_blocks))
            return { x: 0, y: 0, width: 0, height: 0 };
        const layer = element.current._layer_blocks;
        const box = layer.getClientRect({ relativeTo: element.current._stage });
        const { width, height } = box;
        return { width, height };
        // return layer.children.reduce((acc, item) => {
        //     const r = item.getClientRect();
        //     if (r.x + r.width > acc.x)
        //         acc.x = r.x + r.width;
        //     if (r.y + r.height > acc.y)
        //         acc.y = r.y + r.height;
        // }, { x: 0, y: 0});
    }

    //TODO autoscale
    const zoomToFit = function () {
        if (!(element && element.current && element.current._stage))
            return;

        // do we need padding?
        const padding = 5;
        const stage = element.current._stage;
        const layer = element.current._layer_blocks;
        // get bounding rectangle
        const box = layer.getClientRect({ relativeTo: stage });
        const scale = Math.min(
            stage.width() / (box.width + padding * 2),
            stage.height() / (box.height + padding * 2)
        );


        const x = -box.x * scale + padding * scale;
        const y = -box.y * scale + padding * scale;
        stage.to({
            duration: 0.35,
            easing: Konva.Easings.EaseInOut,
            scaleX: scale,
            scaleY: scale,
            x,
            y,
        });
    }

    const ZOOM_INCREMENT = 0.05;
    const ZOOM_MIN = 0.2;
    const ZOOM_MAX = 5.0;

    const zoomIn = function () {
        const stage = element.current._stage;
        let scale = stage.scale();
        scale.x = scale.y = (scale.x >= ZOOM_MAX) ? ZOOM_MAX : scale.x + ZOOM_INCREMENT;
        stage.scale(scale);
        stage.batchDraw();
        // stage.to({
        //     duration: 0.1,
        //     easing: Konva.Easings.EaseInOut,
        //     scaleX: scale.x,
        //     scaleY: scale.x,
        // });
    }
    const zoomOut = function () {
        const stage = element.current._stage;
        let scale = stage.scale();
        scale.x = scale.y = (scale.x <= ZOOM_MIN) ? ZOOM_MIN : scale.x - ZOOM_INCREMENT;
        stage.scale(scale);
        stage.batchDraw();
    }

    return (
        <div className="fullsize App-Board" >
            { !meta.available && <ProgressBar style={{ height: '2px' }} mode="indeterminate" />}
            <div className="fullsize board-content" ref={element} ></div>
            <div className="App-Board-button App-Board-zoomin pi pi-plus" onClick={() => zoomIn()}></div>
            <div className="App-Board-button App-Board-zoomout pi pi-minus" onClick={() => zoomOut()}></div>
        </div>
    );
}

export default Board;