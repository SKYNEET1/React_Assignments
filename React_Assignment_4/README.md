Assignment 4 

<img width="684" height="894" alt="image" src="https://github.com/user-attachments/assets/c6ff04df-b867-4f1b-9572-07cee2cd0505" />

What is useActionState (React)

useActionState is a React hook used for handling form actions (especially async) in a cleaner way.
Instead of:

managing loading
managing error
managing response

👉 all manually with useState

You let useActionState handle it.
const [state, action, isPending] = useActionState(fn, initialState)
📌 Returns:
state → result of your action (data/error)
action → function you attach to form
isPending → loading state (true/false)
isPending gives loading automatically

Conclusion :
Because useState requires manual handling of loading, error, and async logic, while useActionState simplifies form-based async workflows and reduces boilerplate.
