const { Router } = require('express');
const multer  = require('multer');
const path = require('path');

const Blog = require('../models/blogs.models.js');
const Comment = require('../models/comments.models.js');

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('./public/uploads'));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName)
    },
  });
  
const upload = multer({ storage: storage })

router.get("/add-new", (req, res) => { 
    return res.render("addBlog", {
        user: req.user,
    })
});

router.get("/add-newAI", (req, res) => { 
    
    return res.render("addBlogAI", {
        user: req.user,
    })
});
  
router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy"); //call user model in createdBy foeld of blog-model
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    return res.render("blog", {                                            //without populate() createdBy only has objectId
        user: req.user,
        blog,
        comments,
    })
});

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body
    
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    })
    return res.redirect(`/blog/${blog._id}`);
  
})

router.post("/AI", upload.single('coverImage'), async (req, res) => {
    const { title, body, caution } = req.body
    blogContent = `I have to write a travel blog of my recent travel experience. I will provide you two piece of
                content in which the first one is a raw discription of my journey and the second one will be
                about some information related to some caution or special observation related to any specific 
                place. you have to create a travel blog for me on these piece of contents. remember to be human like 
                and keep the content real. add small amount of story telling, in simple language as if someone is actually sharing his travel 
                journey. here are both the piece of contents:
                content1(raw information): ${body},
                content2(caution): ${caution}`
                
    const blog = await Blog.create({
        body: blogContent,
        title,
        createdBy: req.user._id, 
        coverImageURL: `/uploads/${req.file.filename}`,
    })
    return res.redirect(`/blog/${blog._id}`);
  
}) 


module.exports = router;