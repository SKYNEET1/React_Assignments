import React from 'react'

const FeedBackHistory = ({history}) => {
    // destructuring the props directly else use it like props.history
    return (
        <div className="mt-4 w-full max-w-md">
            <h3 className="font-semibold mb-2">Feedback History</h3>

            {history.length === 0 ? (
                <p className="text-sm text-gray-500">No feedback yet</p>
            ) : (
                history.map((item, index) => (
                    // mapping the history
                    <div key={index} className="border p-2 rounded mb-2 bg-white">
                        <p className="text-sm font-medium">
                            {item.name} ({item.rating}/5)
                        </p>
                        <p className="text-sm italic">
                            "{item.feedback}"
                        </p>
                    </div>
                ))
            )}
        </div>
    )
}

export default FeedBackHistory