import { useRef } from "react";
import { colors } from "../data/colorsData"; // Imported from data 

const ColorHighlight = () => {

  // Store refs in array
  const itemRefs = useRef([]);

  // Function to highlight specific item
  const handleHighlight = (index) => {
    const element = itemRefs.current[index];

    if (element) {
      element.style.fontWeight = "bold"; // change style directly
    }
  };

  return (
    <div>

      <div>
        Highlight Color : 
      </div>
    
      {colors.map((color, index) => (
        <div key={index}>
          {/* Assign ref to each item */}
          <div
            ref={(div) => (itemRefs.current[index] = div)} // div is the element that is stored inside the array i.e itemRefs.
          >
            {color}
          </div>

          {/* Button for each item */}
          <button onClick={() => handleHighlight(index)}>
            Highlight
          </button>

          <br />
        </div>
      ))}
    </div>
  );
};

export default ColorHighlight;