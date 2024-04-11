require("dotenv").config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blogs.models.js')

const { checkForAuthenticationCookie } = require('./midddleware/auth.middleware.js');

const userRoute = require('./routes/user.route.js');
const blogRoute = require('./routes/blog.route.js');


const app = express();
const PORT = process.env.PORT || 8000;   

mongoose.connect(process.env.MONGO_URL)
.then((e) => console.log("Mongodb connected"))
.catch((error) => console.log("error connecting to mongodb", error));

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public'))) //let expres know to serve it as static

app.get("/",async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home", { 
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})  