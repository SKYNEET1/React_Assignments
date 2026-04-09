import './index.css';
import './App.css'
import StatusCard from './components/StatusCard';
import Header from './components/Header';
import Footer from './components/Footer';
import Navlink from './components/Navlink';
import { useState } from 'react';


function App() {
  const [type, setType] = useState('success');

  return (
    <>
      <h1>Assignment 3</h1>

      <section>
        <h5>Q1 :-</h5>
        <button className="btnQ1">Click Me</button>
      </section>

      <section className="section">
        <div className="btn-group">
          <button className="btn success" onClick={() => setType('success')}>
            Success
          </button>
          <button className="btn error" onClick={() => setType('error')}>
            Error
          </button>
        </div>

        <h5>Q2 :-</h5>
        <StatusCard type={type} />
      </section>

      <section>
        <h5>Q3 :-</h5>
        <Navlink />
      </section>

      <section>
        <h5>Q4 :-</h5>
        <Header />
        <br />
        <Footer />
      </section>
    </>
  );
}

export default App
