const router = require("express").Router();
const redirectController = require("../controllers/redirectController");

router.get("/:id", redirectController.redirectRoute);

module.exports = router;
