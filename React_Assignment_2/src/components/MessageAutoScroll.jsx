import React, { useState, useRef, useEffect } from "react";

const MessageAutoScroll = () => {
    // Store messages
    const [messages, setMessages] = useState([]);

    // Ref for last message
    const bottomRef = useRef(null);
    const inputMessage = useRef(null);

    // Add new message on button click
    const addMessage = () => {
        // Add message to array
        // console.log(messages);
        // console.log(inputMessage)
        const value = inputMessage.current.value;
        if (!value) return null;
        setMessages((prev) => [...prev, value]);
        inputMessage.current.value = '';
    };

    // Scroll to bottom when messages update
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView();
        }
    }, [messages]);

    return (
        <div>
            <div>
                <h5>Auto Slide when message updated : </h5>
            </div>
            <div>
                <input type="text" ref={inputMessage} />
            </div>

            <button onClick={addMessage}>Add Message</button>

            <br />
            <br />

            {/* Display messages */}
            {messages.map((msg, index) => (
                <div key={index}>
                    {msg}
                    <br />
                </div>
            ))}

            {/* Last element reference */}
            <div ref={bottomRef}></div>
        </div>
    );
};

export default MessageAutoScroll;