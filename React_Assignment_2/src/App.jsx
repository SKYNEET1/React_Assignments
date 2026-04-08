import './App.css'
import AutoFocusInput from './components/AutoFocusInput';
import ColorHighlight from './components/colorHighlight';
import MappingUsers from './components/MappingUsers';
import MessageAutoScroll from './components/MessageAutoScroll';
import Product from './components/Product';

function App() {

  return (
    <>
     <div><h1>React Assignment : 2</h1></div>
     <br />
     <br />
     <br />
     <br />
     <h3>Q1 : - </h3>
     <AutoFocusInput/>
     <br />
     <br />
     <br />
     <br />
     <h3>Q2 : - </h3>
     <MappingUsers/>
     <br />
     <br />
     <br />
     <br />
     <h3>Q3 : - </h3>
     <MessageAutoScroll/>
     <br />
     <br />
     <br />
     <br />
     <h3>Q4 : - </h3>
     <Product name={'swagat'} price={'20,000'}/>
     <br />
     <br />
     <br />
     <br />
     <h3>Q5 : -</h3>
     <ColorHighlight/>
    </>
  )
}

export default App
