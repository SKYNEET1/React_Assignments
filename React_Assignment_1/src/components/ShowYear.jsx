// A functional component that displays current year
const ShowYear = () => {
    return (
         // JSX: looks like HTML but used inside JavaScript
        <h3>Current Year: {new Date().getFullYear()}</h3>
    )
}

// Exporting this component so it can be used in other files
export default ShowYear;