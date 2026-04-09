import styled from "styled-components";

// Task: Create a simple navigation link that turns red on hover and hides on mobile screens (width < 600px).
const Link = styled.a`
  color: black;
  text-decoration: none;

  &:hover {
    color: red;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const Navlink = () => {
    return (
        <Link href="#">Navlink</Link>
  )
}

export default Navlink