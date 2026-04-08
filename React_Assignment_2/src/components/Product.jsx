import React, { useState } from 'react'

const Product = ({ name, price }) => {

    const [toggleEdit, settoggleEdit] = useState(false);

    return (
        <div>
            {/* Toggle button */}
            <button onClick={() => settoggleEdit(!toggleEdit)}>
                {!toggleEdit ? "Message will shown in INPUT field" : "Message will shown in H1 tag"}
            </button>

            <br />
            <br />

            {/* Conditional rendering */}
            {toggleEdit ? (
                // Show input when edit is true
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setProductName(e.target.value)}
                />
            ) : (
                // Show heading when edit is false
                <h1>{name}</h1>
            )}

            {/* Price always shown */}
            <p>Price: {price}</p>
        </div>
    )
}

export default Product;