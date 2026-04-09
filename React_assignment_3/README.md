React Assignment 3 : 


<img width="678" height="136" alt="image" src="https://github.com/user-attachments/assets/407f05aa-0d70-47ea-bd9e-ac7b1b0390a5" />
<img width="1258" height="217" alt="image" src="https://github.com/user-attachments/assets/e0437c6a-b07c-4c34-9e5c-150fefc69ae2" />
<img width="163" height="113" alt="image" src="https://github.com/user-attachments/assets/95ec261e-0ea0-4940-934a-4f88231a6cbf" />
<img width="1312" height="189" alt="image" src="https://github.com/user-attachments/assets/41e6a329-81fb-42da-9b88-9035283818b8" />


# CSS Structure in React

## Types of CSS in React

There are 3 main ways to handle CSS in React.

### 1. Global CSS

**What it is**

One or a few CSS files applied to the entire application.

Examples:
- index.css
- App.css

These styles affect all components in the app.

---

### 2. Component-Level CSS

**What it is**

Each component has its own CSS file.

Example:

Button.jsx  
Button.css

This helps keep styles organized and related to specific components.

---

### 3. Styled Components (CSS-in-JS)

**What it is**

CSS is written inside JavaScript using a library.

Library used:
- styled-components

This allows dynamic styling and scoped styles for components.

---

## File Structure Example

```
src/
 ├── components/
 │    ├── Button.jsx
 │    ├── Button.module.css
 │
 ├── pages/
 ├── App.jsx
 ├── index.css
```

---

## One Minute Revision

Global CSS  
= styles applied to the whole application

Component CSS  
= styles applied to a specific component

Styled Components  
= CSS written inside JavaScript with dynamic behavior
