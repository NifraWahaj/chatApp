const router = require("express").Router();
const passport = require("passport");

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

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Login failed",
    });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login/failed" }),
    (req, res) => {
        if (req.user) {
            req.session.email = req.user.email;
            req.session.id = req.user._id;

            res.cookie('email', req.user.email, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });
        }
        res.redirect("http://localhost:3000/home");
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => { 
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error destroying session' });
            }
            res.clearCookie('connect.sid'); 
            res.json({ message: 'Logout successful' }); 
        });
    });
});


module.exports = router;
