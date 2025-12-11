module.exports = app => {
    const userGallery = require("../controllers/userGallery.controller.js");
    const router = require("express").Router();

    // POST /api/userGallery/getGalleryList
    router.post("/getGalleryList", userGallery.getGalleryList);
    router.post("/getUserGalleryList", userGallery.getUserGalleryList);
    app.use('/api/userGallery', router);
};