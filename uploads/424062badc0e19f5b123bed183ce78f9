<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Problematic HTML</title>
    <script>
        // Bad practice: Inline JavaScript
        const password = "hardcoded_secret_password";
        eval("alert('This is a problematic use of eval!');");
    </script>
</head>
<body>
    <h1>Welcome to the Insecure Page</h1>
    
    <!-- Example of a missing alt attribute for accessibility -->
    <img src="image.jpg">

    <!-- Problematic form with no validation -->
    <form action="http://example.com/login" method="POST">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"><br><br>
        
        <label for="password">Password:</label>
        <input type="password" id="password" name="password"><br><br>
        
        <button type="submit">Submit</button>
    </form>

    <!-- Inline styles (security and maintainability issue) -->
    <div style="background-color: red; color: white;">
        This is a warning message!
    </div>

    <!-- Deprecated element -->
    <marquee>Deprecated <code>&lt;marquee&gt;</code> tag in use!</marquee>

    <!-- XSS Vulnerability: Unsanitized user input -->
    <script>
        const userInput = "<script>alert('XSS vulnerability!');</script>";
        document.write(userInput);
    </script>
</body>
</html>

