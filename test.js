async function loginRequest(email, password) {
    try {
        const response = await fetch("https://localhost:5500/login", {
            method: "POST",
            credentials: "include", // ✅ Important: Allows cookies to be sent,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login successful:", data);
        } else {
            console.log("Login failed:", data.message);
        }

        return data;
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Something went wrong" };
    }
}

// Example usage
loginRequest("1234@gmail.com", "2003")
.then(async () =>{
    let res = await fetch("https://localhost:5500/api/tables",{
        method: "GET",
        credentials: "include" // ✅ Important: Allows cookies to be sent
    });
    let data = await res.json()
    console.log(res);
    console.log(data);
})
