var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');

//app config
mongoose.connect('mongodb://localhost/blogApp',{useNewUrlParser: true});
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // only after body-parser

//mongoose config
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "placeholder.jpeg"},
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);

// Blog.create({
//     title: "Blog 2",
//     image: "https://images.unsplash.com/photo-1518128958364-65859d70aa41?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=df90aec8aaec700a402790e4799d226e&auto=format&fit=crop&w=1374&q=80",
//     body: "Hello this is a blog post"
// });

// RESTful route
app.get('/',function(req,res){
    res.redirect('/blogs');
});
app.get('/blogs',function(req,res){
    Blog.find({},function(err,blogs){
        if(err) {
            console.log(err);
        } else {
            res.render('index',{blogs: blogs});
        } 
    });
    // res.render('index');
});

//create route
app.get('/blogs/new', function(req,res){
    res.render('new');
});

app.post('/blogs', function(req,res){
    if(req.body.blog.image.search('https') ===-1)
        req.body.blog.image = "https://consumercomplaintscourt.com/wp-content/uploads/2015/12/no_uploaded.png";
    // we r sanitizing the below request
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err,newBlog){
        if(err){
            res.render('new');
        } else {
            res.redirect('/blogs');
        }
    });
});

// show route
app.get('/blogs/:id',function(req,res){
    // res.send("Show Page");
    Blog.findById(req.params.id, function(err,newBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show',{blog: newBlog});
        }
    });
});

// edit route
app.get('/blogs/:id/edit', function(req,res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err){
            res.render('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
    // res.render('edit');
});

// update route
app.put('/blogs/:id', function(req,res){
    // res.send('Update Route');
     // we r sanitizing the below request
     req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updateBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs/'+ req.params.id);
        }
    });
});

// delete route 
app.delete('/blogs/:id', function(req,res){
   // res.send("You have reached the delete Route");
   Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
        res.redirect('/blogs');
    } else {
        res.redirect('/blogs');
    }
   });
});

app.listen(3002,function(err,log){
    if(err)
        console.log(err);
    else 
        console.log("Blog App started at port 3002");
});


