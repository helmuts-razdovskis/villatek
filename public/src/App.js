import { useEffect, useState } from 'react'
import Board from './components/Board/Board'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import DataStore from './DataStore'
import { UserContext, MetaContext, ModelContext } from './AppContexts'

import 'primeflex/primeflex.css';
import './App.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ItemPicker from './components/ItemPicker';

// const API_ENDPOINT = '/api/';
const API_ENDPOINT = 'http://localhost:3001/';

function App() {

  const CONTACT_INFO = {
    phone: "+371 29269968",
    email: "info@villatek.com",
    facebook: "facebook.com/villatek",
    instagram: "instagram.com/villatek",
  }
  const [meta, setMeta] = useState({ available: false });
  const [model, setModel] = useState({ available: true, store: new DataStore() });

  const fetchMeta = async function () {
    const [jvariants, jblocks, jconnections, jcategories] = await Promise.all([
      fetch(API_ENDPOINT + "mvariants?sort=mblockId"),
      fetch(API_ENDPOINT + "mblocks?sort=mcategoryId"),
      fetch(API_ENDPOINT + "mconnections?sort=mvariantId"),
      fetch(API_ENDPOINT + "mcategories?sort=id"),
    ]);
    const [variants, blocks, connections, categories] = await Promise.all([jvariants.json(), jblocks.json(), jconnections.json(), jcategories.json()]);
    // map some data for faster access
    const p0 = new Promise((resolve) => {
      categories.forEach((item) => {
        item.blocks = blocks.filter(b => b.mcategoryId === item.id);
        item.blocks.forEach((b) => { b.category = item });
      });
      resolve();
    });
    const p1 = new Promise((resolve) => {
      blocks.forEach((item) => {
        item.variants = variants.filter(v => v.mblockId === item.id);
        item.variants.forEach((v) => { v.block = item });
      });
      resolve();
    });
    const p2 = new Promise((resolve) => {
      variants.forEach((item) => {
        item.connections = connections.filter(c => c.mvariantId === item.id);
        item.connections.forEach((c) => { c.variant = item });
      });
      resolve();
    });
    const p3 = new Promise((resolve) => {
      variants.forEach((item) => {
        item.connectionsTo = connections.filter(c => c.mvariantToId === item.id);
        item.connectionsTo.forEach((c) => { c.variantTo = item });
      });
      resolve();
    });
    await Promise.all([p0, p1, p2, p3]);
    setMeta({ variants, blocks, connections, categories, available: true });
  }

  useEffect(() => {
    fetchMeta();
  }, []);

  return (
    <MetaContext.Provider value={meta} >
      <ModelContext.Provider value={model} >
          <div className="App">
            <Header info={CONTACT_INFO} />
            <Board />
            <Footer />
          </div>
      </ModelContext.Provider>
    </MetaContext.Provider>
  );
}

export default App;
