const urlModel = require("../models/urlModel");
const userModel = require("../models/userModel");

const urlController = {
  getAllUrl: async (req, res) => {
    const userId = req.userId;

    const user = await userModel.findById(userId).populate("url");
    res.status(200).json(user.url);
  },
  postNewUrl: async (req, res) => {
    try {
      const { longURL } = req.body;
      const userId = req.userId;

      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      let randomString = "";

      for (i = 1; i <= 5; i++) {
        randomString += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      const shortUrl = `https://url-shortener-0973.onrender.com/short/${randomString}`;

      const url = new urlModel({
        longURL,
        shortURL: shortUrl,
        randomToken: randomString,
        user: userId,
      });

      const updatedUrl = await url.save();
      let user = await userModel.findById(userId);
      user.url = user.url.concat(updatedUrl._id);
      await user.save();

      res.status(200).json({ message: "Short Url Generated" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
};

module.exports = urlController;
