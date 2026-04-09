import styled from "styled-components";

// Its just like a component so start with letter "Capital", You can also pass props to it as it behave like components too.
// Conditional rendering is done through ternary operator
const CardStyle = styled.div`
  padding: 20px;
  color: white;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  background-color: ${(props) =>
        props.type === "success" ? "green" : "red"}; 
`;


const StatusCard = ({ type }) => {

    return (
        <CardStyle type={type}> - Conditional coloring - {type}</CardStyle>
    )
}

export default StatusCard;