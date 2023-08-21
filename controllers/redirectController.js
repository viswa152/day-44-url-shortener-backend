const urlModel = require("../models/urlModel");
const { count } = require("../models/userModel");

const redirectController = {
  redirectRoute: async (req, res) => {
    const randomToken = req.params.id;
    try {
      const urlData = await urlModel.findOne({ randomToken });
      urlData.hitCount = urlData.hitCount + 1;
      await urlModel.findByIdAndUpdate(urlData._id, urlData);
      res.redirect(urlData.longURL);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = redirectController;
