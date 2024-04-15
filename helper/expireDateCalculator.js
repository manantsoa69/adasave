  //helper/expireDateCalculator.js
const calculateExpirationDate = (subscriptionDetails, subscriptionStatus) => {

  if (subscriptionStatus === 'E') {
    return null; // Return null for expired subscriptions
  }

  const currentDate = new Date(); // Use built-in Date object for date handling

  const expirationMap = {
    '1D': currentDate => currentDate.setDate(currentDate.getDate() + 1),
    '1W': currentDate => currentDate.setDate(currentDate.getDate() + 7), // 1 week
    '2W': currentDate => currentDate.setDate(currentDate.getDate() + 14), 
    '1M': currentDate => currentDate.getDate(currentDate.getDate() + 31),
    '10M': currentDate => currentDate.setMinutes(currentDate.getMinutes() + 45),
  };

  const expirationHandler = expirationMap[subscriptionDetails];
  if (expirationHandler) {
    expirationHandler(currentDate);
    return currentDate;
  }

  return null; // Return null for unknown or invalid subscriptionDetails
}


module.exports = {
  calculateExpirationDate
};
