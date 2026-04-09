import React from 'react'

//  --primary-color is defined in index.css as global variable.
const Header = () => {
    return (
        <div style={{
            backgroundColor: "var(--primary-color)", color: "white", padding: "15px",
            textAlign: "center",
            fontWeight: "bold"
        }}>
            Header
        </div>
    )
}

export default Header