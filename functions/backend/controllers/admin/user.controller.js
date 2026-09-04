const db = require("../../util/connection");

// create user by admin
exports.fakeUser = async (req, res) => {
  try {
    const { fullName, nickName, email, password, channelName } = req.body;
    if (!fullName || !nickName || !email) {
      return res.status(200).json({ status: false, message: "Required fields missing" });
    }

    const newUser = await db.create("users", {
      fullName,
      nickName,
      email,
      password: password || "12345678",
      channelName: channelName || fullName,
      isChannel: !!channelName,
      isFake: true,
      isActive: true,
      isBlock: false,
      coin: 0,
    });

    return res.status(200).json({ status: true, message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const updated = await db.update("users", userId, req.body);
    return res.status(200).json({ status: true, message: "User updated successfully", user: updated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// handle isActive
exports.isActive = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await db.findById("users", userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    const updated = await db.update("users", userId, { isActive: !user.isActive });
    return res.status(200).json({ status: true, message: "Success", user: updated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// handle isBlock
exports.isBlock = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await db.findById("users", userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    const updated = await db.update("users", userId, { isBlock: !user.isBlock });
    return res.status(200).json({ status: true, message: "Success", user: updated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// update password
exports.updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    await db.update("users", userId, { password: newPassword });
    return res.status(200).json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// delete users
exports.deleteUsers = async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) await db.delete("users", userId);
    return res.status(200).json({ status: true, message: "Users deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// get profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await db.findById("users", userId);
    return res.status(200).json({ status: true, message: "Success", user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// get users
exports.getUsers = async (req, res) => {
  try {
    let users = await db.find("users", {});
    return res.status(200).json({ status: true, message: "Success", total: users.length, users });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// get users added by admin for channel
exports.getUsersAddByAdminForChannel = async (req, res) => {
  try {
    let users = await db.find("users", { isFake: true });
    return res.status(200).json({ status: true, message: "Success", total: users.length, users });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// get channels of user
exports.channelsOfUser = async (req, res) => {
  try {
    let channels = await db.find("channels", {});
    if (!channels || channels.length === 0) {
      channels = await db.find("users", { isChannel: true });
    }
    return res.status(200).json({ status: true, message: "Success", total: channels.length, channels });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// delete channel by admin
exports.deleteChannelByAdmin = async (req, res) => {
  try {
    const { channelId } = req.query;
    if (channelId) await db.delete("channels", channelId);
    return res.status(200).json({ status: true, message: "Channel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// fetch user coin + VIP history
exports.fetchUserCoinVipHistory = async (req, res) => {
  try {
    const history = await db.find("wallet_history", {});
    return res.status(200).json({ status: true, message: "Success", total: history.length, history });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
