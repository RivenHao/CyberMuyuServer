module.exports = app => {
    const userGallery = require("../controllers/userGallery.controller.js");
    const router = require("express").Router();

    // POST /api/userGallery/getGalleryList
    router.post("/getGalleryList", userGallery.getGalleryList);

    app.use('/api/userGallery', router);
};