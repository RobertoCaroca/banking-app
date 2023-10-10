module.exports = async (UserModel) => {
  let accountNumber;
  let unique = false;
  while (!unique) {
    accountNumber = Math.random().toString().slice(2, 12); // Generate number
    const user = await UserModel.findOne({ "accounts.accountNumber": accountNumber });
    if (!user) unique = true; // If no user found with this account number, it's unique
  }
  return accountNumber;
};
