import React, { useActionState } from "react";
import { useState, useEffect } from "react";
import FeedBackHistory from "./FeedBackHistory";


// This handelFeedback function will be trigered by fromAction declared in useActionState.
// Here no need of onchange React autometically sends formData through formAction.

const handelFeedback = (_, formData) => {
    const name = formData.get("name");
    const message = formData.get("message");
    const rating = formData.get("rating");

    // Validation that if no name no message no rating then send some error msg with red color
    if (!name || !message || !rating) {
        return { value: "All fields are required", success: false };
    }

    // If everything fine then send value that contains the name and rating and feedback msg with success true
    return {
        value: `Thanks ${name}! Your feedback (${rating}/5) has been submitted.`,
        feedback: message,
        success: true,
    };
};

const FeedBackForm = () => {
    const [state, formAction, isPending] = useActionState(
        handelFeedback,
        {
            value: "",
            feedback: "",
            success: false
        }
    );
    // state => outcome of the function
    // initially state contains 
    // {
    //   value: "",
    //   feedback: "",
    //   success: false
    // }

    // formAction autometically call the handelFeedback function and send parameters : previousState, formData.

    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (state.success && state.feedback) {
            setHistory((prev) => [
                ...prev,
                {
                    name: state.value.split(" ")[1], // simple extract
                    feedback: state.feedback,
                }
            ]);
        }
    }, [state]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Assignment 4
            </h1>

            <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">

                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Feedback Form
                </h2>

                <form action={formAction} className="space-y-4">

                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <textarea
                        name="message"
                        placeholder="Your Feedback"
                        rows="4"
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    ></textarea>

                    <select
                        name="rating"
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Select Rating</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                    </select>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
                    >
                        {isPending ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>

                {state?.value && (
                    <div
                        className={`mt-4 p-4 rounded-lg text-sm ${state.success
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        <p className="font-medium">{state.value}</p>

                        {state.feedback && (
                            <p className="mt-2 text-gray-700 italic border-l-4 border-gray-400 pl-3">
                                "{state.feedback}"
                            </p>
                        )}
                    </div>
                )}
            </div>
            {/* Show the history and hide the history */}
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="mt-4 w-full py-2 rounded-lg font-medium 
               border border-gray-300 
               bg-white text-gray-700 
               hover:bg-gray-100 
               transition duration-200 
               shadow-sm"
            >

                {showHistory ? "Hide History" : "Show History"}
            </button>
            {/* conditional showing data and sending history as a props to feedbackhistory component */}
            {showHistory && <FeedBackHistory history={history} />} 
        </div>
    );
};

export default FeedBackForm;