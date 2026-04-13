import React, { useState } from 'react'

const StateUse = () => {
    // const [increase, setIncrease] = useState(0);
    // const [increase2, setIncrease2] = useState(0);
    const [increase3, setIncrease3] = useState(0);
    setTimeout(() => {
        setIncrease3(increase3 +1);
        console.log('1',increase3);
        
        setIncrease3(increase3 +1);
        console.log('2',increase3);

        setIncrease3(increase3 +1);
        console.log('3',increase3);

        setIncrease3(1);
            },1000);
    return (
        <div>

            <h3>{increase3}</h3>
        </div>
    )
};

export default StateUse;