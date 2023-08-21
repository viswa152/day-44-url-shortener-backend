const router = require("express").Router();
const urlController = require("../controllers/urlController");
const authMiddleware = require("../middleware/authMiddleware");
const urlModel = require("../models/urlModel");

// router.get("/", async (req, res) => {
//   urlModel.find({}, {}).then((url) => {
//     res.status(200).json(url);
//   });
// });

router.get("/", authMiddleware.verifyToken, urlController.getAllUrl);
router.post("/", authMiddleware.verifyToken, urlController.postNewUrl);

module.exports = router;
