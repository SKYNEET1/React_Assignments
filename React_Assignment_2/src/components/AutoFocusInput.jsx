import { useRef } from 'react'

const AutoFocusInput = () => {

    // ref for each input
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);

    // Handle input change
    const handleChange = (e, nextRef) => {
        // Get current value of input
        const noOfChar = e.target.value;

        // If user types 4 characters
        if (noOfChar.length === 4) {
            // Move focus to next input (if exists)
            if (nextRef && nextRef.current) { // This will check if there is nextRef or nextRef.current then move the focus to next input field
                nextRef.current.focus();
            }
        }
    }

    return (
        <div style={{ display: "flex", gap: "10px" }}>
            <input
                type="text"
                maxLength={4} // character can not exceed 4
                ref={input1Ref}
                onChange={(e) => handleChange(e, input2Ref)} // sending event(e) and the reference of 2nd input
                placeholder="Input 1"
            />

            <input
                type="text"
                maxLength={4}
                ref={input2Ref}
                onChange={(e) => handleChange(e, input3Ref)} // sending event(e) and the reference of 3nd input
                placeholder="Input 2"
            />

            <input
                type="text"
                maxLength={4}
                ref={input3Ref}
                onChange={(e) => handleChange(e, null)} // no next input
                placeholder="Input 3"
            />
        </div>
    )
}

export default AutoFocusInput;