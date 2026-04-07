import './App.css'
// Components are imported here
// A component is a reusable piece of UI
import ShowYear from './components/ShowYear'
import Header from './components/Header'

function App() {

  return (
    <div >

        {/* Header component is rendered (mounted) here */}
        <Header /> 

        <div>
            <h1>My AI Journey Begins</h1>
        </div>

        <div>
           {/* ShowYear component is rendered here */}
            <ShowYear /> 
        </div>

    </div>
  )
}

// Exporting App component (main component)
export default App;
