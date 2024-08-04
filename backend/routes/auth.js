const router = require("express").Router();
const passport = require("passport");

// Route to handle successful login
router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: req.user,
        });
    } else {
        res.status(403).json({
            success: false,
            message: "Not authorized",
        });
    }
});

// Route to handle failed login
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Login failed",
    });
});

// Route to initiate Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login/failed" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect("/"); // Redirect to homepage or other desired URL
    }
);

// Route to handle logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;
